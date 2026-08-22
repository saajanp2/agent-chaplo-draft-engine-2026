import React, { useState, useEffect, useMemo } from 'react';
import { 
  Player, 
  TeamConfig, 
  DraftPick, 
  ViewMode, 
  LookaheadPrediction 
} from './types';
import { raw208Players, defaultTeams } from './data';
import { Navbar } from './components/Navbar';
import { MasterDataGrid } from './components/MasterDataGrid';
import { DraftWarRoom } from './components/DraftWarRoom';
import { AIForesightHub } from './components/AIForesightHub';
import { ComparisonDock } from './components/ComparisonDock';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { DraftOrderModal } from './components/DraftOrderModal';
import confetti from 'canvas-confetti';

export function App() {
  // 1. Teams Configuration State (Defaulting to Slot #7 for Agent Chaplo)
  const [teams, setTeams] = useState<TeamConfig[]>(() => {
    const saved = localStorage.getItem('agent_chaplo_teams_2026_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 12) {
          const hasUser = parsed.some((t) => t.isUser);
          if (hasUser) return parsed;
        }
      } catch (e) {
        return defaultTeams;
      }
    }
    // Clean legacy storage key if present
    localStorage.removeItem('agent_chaplo_teams_2026');
    localStorage.removeItem('agent_chaplo_teams_2026_v2');
    return defaultTeams;
  });

  // 2. Drafted Picks History (180 picks total)
  const [picks, setPicks] = useState<DraftPick[]>(() => {
    const saved = localStorage.getItem('agent_chaplo_picks_2026_v3') || localStorage.getItem('agent_chaplo_picks_2026');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // 3. UI View Switcher State
  const [currentView, setCurrentView] = useState<ViewMode>('grid');
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // 4. Modals & Side-by-Side Comparison
  const [comparisonIds, setComparisonIds] = useState<Set<number>>(new Set());
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isDraftOrderModalOpen, setIsDraftOrderModalOpen] = useState<boolean>(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('agent_chaplo_teams_2026_v3', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('agent_chaplo_picks_2026_v3', JSON.stringify(picks));
  }, [picks]);

  // Helper: Compute snake draft pick information
  const getPickInfo = (pickIdx: number, currentTeams: TeamConfig[]) => {
    const overallPick = pickIdx + 1;
    const round = Math.floor(pickIdx / 12) + 1;
    const pickInRound = (pickIdx % 12) + 1;
    
    // Snake: Even rounds (2, 4, 6...) reverse slots (12 down to 1)
    const isEvenRound = round % 2 === 0;
    const targetSlot = isEvenRound ? 12 - (pickIdx % 12) : (pickIdx % 12) + 1;

    const team = currentTeams.find((t) => t.slot === targetSlot) || currentTeams[0];

    return {
      overallPick,
      round,
      pickInRound,
      team,
    };
  };

  // Current On-The-Clock Information
  const currentPickIndex = picks.length;
  const currentPickInfo = getPickInfo(currentPickIndex, teams);
  const activeTeam = currentPickInfo.team;
  const currentRound = currentPickInfo.round;
  const pickInRound = currentPickInfo.pickInRound;

  // Drafted Player IDs set
  const draftedPlayerIds = useMemo(() => {
    return new Set(picks.map((p) => p.playerId));
  }, [picks]);

  // Available Players with Dynamic Real-time Drop-off (VONA)
  const availablePlayers = useMemo(() => {
    const unpicked = raw208Players.filter((p) => !draftedPlayerIds.has(p.Player_ID));

    // Group by position to compute dynamic drop-off
    const posMap: Record<string, Player[]> = {
      QB: [], RB: [], WR: [], TE: [], K: [], DEF: []
    };

    unpicked.forEach((p) => {
      if (posMap[p.Pos]) posMap[p.Pos].push(p);
    });

    // Sort each position by projected PPG descending
    Object.keys(posMap).forEach((pos) => {
      posMap[pos].sort((a, b) => b.W1_4_Proj_PPG - a.W1_4_Proj_PPG);
    });

    const dropoffMap = new Map<number, number>();
    Object.values(posMap).forEach((group) => {
      group.forEach((p, idx) => {
        const nextPlayer = group[idx + 1];
        const dropoff = nextPlayer ? Number((p.W1_4_Proj_PPG - nextPlayer.W1_4_Proj_PPG).toFixed(1)) : 0;
        dropoffMap.set(p.Player_ID, dropoff);
      });
    });

    return unpicked.map((p) => ({
      ...p,
      Dynamic_Dropoff: dropoffMap.get(p.Player_ID) ?? 0,
    }));
  }, [draftedPlayerIds]);

  // User's rostered players
  const userTeam = teams.find((t) => t.isUser) || teams[0];
  const myTeamPlayers = useMemo(() => {
    return picks.filter((p) => p.teamId === userTeam.id).map((p) => p.player);
  }, [picks, userTeam]);

  // Comparison players array
  const comparedPlayers = useMemo(() => {
    return raw208Players.filter((p) => comparisonIds.has(p.Player_ID));
  }, [comparisonIds]);

  // Lookahead Engine (N+3 Forecast)
  const lookaheadPredictions = useMemo<LookaheadPrediction[]>(() => {
    const predictions: LookaheadPrediction[] = [];
    const simulatedAvailable = [...availablePlayers];

    for (let i = 1; i <= 3; i++) {
      const nextIdx = currentPickIndex + i - 1;
      if (nextIdx >= 180) break;

      const nextInfo = getPickInfo(nextIdx, teams);
      const nextTeam = nextInfo.team;

      // Select best candidate based on team archetype
      let chosenIdx = 0;
      let reason = "Drafts highest projected Value-Over-Replacement starter.";

      if (nextTeam.archetype.includes("Hero RB") || nextTeam.archetype.includes("Dual Workhorse")) {
        const rbIdx = simulatedAvailable.findIndex((p) => p.Pos === 'RB');
        if (rbIdx >= 0) {
          chosenIdx = rbIdx;
          reason = `Prioritizes workhorse RB anchor in line with ${nextTeam.archetype} strategy.`;
        }
      } else if (nextTeam.archetype.includes("Zero RB") || nextTeam.archetype.includes("PPR")) {
        const wrIdx = simulatedAvailable.findIndex((p) => p.Pos === 'WR');
        if (wrIdx >= 0) {
          chosenIdx = wrIdx;
          reason = `Targets high target share alpha WR to stack perimeter volume.`;
        }
      } else if (nextTeam.archetype.includes("Elite QB/TE")) {
        const qbTeIdx = simulatedAvailable.findIndex((p) => p.Pos === 'QB' || p.Pos === 'TE');
        if (qbTeIdx >= 0) {
          chosenIdx = qbTeIdx;
          reason = `Locks in elite single-position point differential cheat code.`;
        }
      }

      const predicted = simulatedAvailable[chosenIdx] || simulatedAvailable[0];
      if (predicted) {
        predictions.push({
          pickNumber: nextInfo.overallPick,
          round: nextInfo.round,
          pickInRound: nextInfo.pickInRound,
          teamId: nextTeam.id,
          teamName: nextTeam.name,
          archetype: nextTeam.archetype,
          predictedPlayer: predicted,
          reasoning: reason,
        });
        simulatedAvailable.splice(chosenIdx, 1);
      }
    }

    return predictions;
  }, [currentPickIndex, teams, availablePlayers]);

  // Handler: Draft Player (Supports targeting active on-clock team or specific team)
  const handleDraftPlayer = (player: Player, targetTeamId?: number) => {
    if (picks.length >= 180) {
      alert("Draft is complete! All 180 picks have been recorded.");
      return;
    }

    const assignedTeam = targetTeamId 
      ? teams.find((t) => t.id === targetTeamId) || activeTeam 
      : activeTeam;

    const newPick: DraftPick = {
      overallPick: currentPickInfo.overallPick,
      round: currentPickInfo.round,
      pickInRound: currentPickInfo.pickInRound,
      teamId: assignedTeam.id,
      teamName: assignedTeam.name,
      playerId: player.Player_ID,
      player: player,
      timestamp: new Date().toISOString(),
    };

    setPicks((prev) => [...prev, newPick]);

    // Confetti on key milestones
    if (assignedTeam.isUser || newPick.overallPick === 1 || newPick.overallPick % 12 === 0) {
      confetti({
        particleCount: assignedTeam.isUser ? 80 : 40,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setFeedbackBanner(`Pick #${newPick.overallPick}: ${assignedTeam.name} drafted ${player.Player_Name} (${player.Pos}, ${player.Team})`);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  // Handler: Move / Transfer Player between Teams (Drag-and-Drop or Quick Transfer)
  const handleMovePlayer = (playerId: number, targetTeamId: number) => {
    const targetTeam = teams.find((t) => t.id === targetTeamId);
    if (!targetTeam) return;

    let movedPlayerName = '';
    setPicks((prev) => {
      return prev.map((pick) => {
        if (pick.playerId === playerId) {
          movedPlayerName = pick.player.Player_Name;
          return {
            ...pick,
            teamId: targetTeam.id,
            teamName: targetTeam.name,
          };
        }
        return pick;
      });
    });

    setFeedbackBanner(`Transferred ${movedPlayerName} to ${targetTeam.name}`);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  // Handler: Remove / Drop Drafted Player (1-Click Mistake Recovery)
  const handleRemovePlayer = (playerId: number) => {
    const removedPick = picks.find((p) => p.playerId === playerId);
    if (!removedPick) return;

    setPicks((prev) => prev.filter((p) => p.playerId !== playerId));
    setFeedbackBanner(`Removed ${removedPick.player.Player_Name} from ${removedPick.teamName} (returned to pool)`);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  // Handler: Undo Last Pick
  const handleUndoPick = () => {
    if (picks.length === 0) return;
    const lastPick = picks[picks.length - 1];
    setPicks((prev) => prev.slice(0, prev.length - 1));
    setFeedbackBanner(`Undid Pick #${lastPick.overallPick} (${lastPick.player.Player_Name})`);
    setTimeout(() => setFeedbackBanner(null), 3000);
  };

  // Handler: Reset Live Draft
  const handleResetDraft = () => {
    const confirmReset = window.confirm("Are you sure you want to reset the entire draft board back to Pick #1? All picks will be cleared.");
    if (confirmReset) {
      setPicks([]);
      setFeedbackBanner("Draft reset to Pick #1. Board cleared.");
      setTimeout(() => setFeedbackBanner(null), 3000);
    }
  };

  // Handler: 1-Click Set User Team Slot
  const handleSetUserTeam = (teamId: number) => {
    setTeams((prev) => {
      return prev.map((t) => ({
        ...t,
        isUser: t.id === teamId,
        name: t.id === teamId 
          ? (t.name.includes("Agent Chaplo") ? t.name : `Team ${t.slot} (Agent Chaplo)`) 
          : t.name.replace(" (Agent Chaplo)", ` (Brown Baller ${t.slot})`)
      }));
    });
    const selected = teams.find((t) => t.id === teamId);
    setFeedbackBanner(`🎯 Set Draft Slot to #${selected?.slot} (${selected?.name})`);
    setTimeout(() => setFeedbackBanner(null), 3500);
  };

  // Handler: Toggle Comparison
  const handleToggleCompare = (player: Player) => {
    setComparisonIds((prev) => {
      const next = new Set(prev);
      if (next.has(player.Player_ID)) {
        next.delete(player.Player_ID);
      } else {
        if (next.size >= 4) {
          alert("You can compare up to 4 players side-by-side.");
          return prev;
        }
        next.add(player.Player_ID);
      }
      return next;
    });
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    if (picks.length === 0) {
      alert("No picks have been made yet to export.");
      return;
    }

    let csv = "Overall_Pick,Round,Pick_In_Round,Team_Name,Player_Name,Pos,NFL_Team,Yahoo_ADP,POADP_Surplus,W1_4_Proj_PPG,Season_Proj_Pts,Weekly_Opportunity\n";
    
    picks.forEach((p) => {
      const row = [
        p.overallPick,
        p.round,
        p.pickInRound,
        `"${p.teamName.replace(/"/g, '""')}"`,
        `"${p.player.Player_Name.replace(/"/g, '""')}"`,
        p.player.Pos,
        p.player.Team,
        p.player.Yahoo_ADP,
        p.player.POADP_Points_Over_ADP,
        p.player.W1_4_Proj_PPG,
        p.player.Proj_Fantasy_Pts_2026,
        `"${p.player.Primary_Weekly_Opportunity?.replace(/"/g, '""') || ''}"`,
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Brown_Ballers_Draft_Picks_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      {/* Top Header & Live Navigation */}
      <Navbar
        currentPickIndex={currentPickIndex}
        activeTeam={activeTeam}
        userTeam={userTeam}
        currentRound={currentRound}
        pickInRound={pickInRound}
        currentView={currentView}
        onSelectView={setCurrentView}
        comparedCount={comparisonIds.size}
        onOpenDraftOrderModal={() => setIsDraftOrderModalOpen(true)}
        onUndoPick={handleUndoPick}
        canUndo={picks.length > 0}
        onResetDraft={handleResetDraft}
        onExportCSV={handleExportCSV}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1600px] w-full px-3 sm:px-5 lg:px-6 py-6 space-y-6">
        {/* Real-time Draft Pick Notification Banner */}
        {feedbackBanner && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2.5 text-xs text-amber-200 backdrop-blur-md animate-fadeIn shadow-lg">
            <span>⚡ {feedbackBanner}</span>
            <button onClick={() => setFeedbackBanner(null)} className="text-amber-400 hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic View Rendering */}
        {currentView === 'grid' && (
          <MasterDataGrid
            players={raw208Players}
            draftedPlayerIds={draftedPlayerIds}
            comparisonIds={comparisonIds}
            onDraftPlayer={handleDraftPlayer}
            onToggleCompare={handleToggleCompare}
            onSelectPlayer={setSelectedPlayer}
            selectedPos={selectedPos}
            onSelectPos={setSelectedPos}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            activeTeamName={activeTeam.name}
          />
        )}

        {currentView === 'warroom' && (
          <DraftWarRoom
            teams={teams}
            picks={picks}
            activeTeamId={activeTeam.id}
            currentPickNumber={currentPickInfo.overallPick}
            availablePlayers={availablePlayers}
            allPlayers={raw208Players}
            onDraftPlayer={handleDraftPlayer}
            onMovePlayer={handleMovePlayer}
            onRemovePlayer={handleRemovePlayer}
            onSelectPlayer={setSelectedPlayer}
            onSetUserTeam={handleSetUserTeam}
          />
        )}

        {currentView === 'foresight' && (
          <AIForesightHub
            availablePlayers={availablePlayers}
            myTeam={myTeamPlayers}
            activeTeam={activeTeam}
            currentPickNumber={currentPickInfo.overallPick}
            currentRound={currentRound}
            lookaheadPredictions={lookaheadPredictions}
            onDraftPlayer={handleDraftPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
        )}

        {currentView === 'comparison' && (
          <ComparisonDock
            comparedPlayers={comparedPlayers}
            onRemovePlayer={(id) => {
              setComparisonIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }}
            onClearAll={() => setComparisonIds(new Set())}
            onDraftPlayer={handleDraftPlayer}
            draftedPlayerIds={draftedPlayerIds}
          />
        )}
      </main>

      {/* Deep Dive Player Detail Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onDraft={handleDraftPlayer}
        isDrafted={selectedPlayer ? draftedPlayerIds.has(selectedPlayer.Player_ID) : false}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedPlayer ? comparisonIds.has(selectedPlayer.Player_ID) : false}
      />

      {/* Pre-Draft Team Order Configuration Modal */}
      <DraftOrderModal
        isOpen={isDraftOrderModalOpen}
        onClose={() => setIsDraftOrderModalOpen(false)}
        teams={teams}
        onSaveTeams={(updated) => {
          setTeams(updated);
          setFeedbackBanner("Draft order updated and applied across 180-pick snake board.");
          setTimeout(() => setFeedbackBanner(null), 4000);
        }}
      />
    </div>
  );
}

export default App;

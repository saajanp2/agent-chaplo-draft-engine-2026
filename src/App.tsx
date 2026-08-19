import React, { useState, useEffect, useMemo } from 'react';
import { Player, Position, DraftSession } from './types';
import { players as initialStaticPlayers } from './data';
import { Navbar } from './components/Navbar';
import { StrategicForesightBar } from './components/StrategicForesightBar';
import { MasterDataGrid } from './components/MasterDataGrid';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { ComparisonDock } from './components/ComparisonDock';
import { DraftWarRoom } from './components/DraftWarRoom';
import { SheetSyncModal } from './components/SheetSyncModal';
import { DraftSessionModal } from './components/DraftSessionModal';
import { 
  loginWithGoogle, 
  logoutGoogle, 
  subscribeToAuthChanges, 
  getAccessToken 
} from './services/authService';
import { 
  fetchLiveGoogleSheetData, 
  DEFAULT_SHEET_ID 
} from './services/sheetsService';
import { User } from 'firebase/auth';
import { 
  Sparkles, Layers, ShieldCheck, Flame, TrendingUp, AlertTriangle, 
  Activity, Award, Zap, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Master Players State
  const [allPlayers, setAllPlayers] = useState<Player[]>(() => {
    const isSyncedFromLive = localStorage.getItem('ff_2026_is_live_synced') === 'true';
    const dataVersion = localStorage.getItem('ff_2026_version');
    const CURRENT_VERSION = '2026.6.0';

    if (dataVersion !== CURRENT_VERSION) {
      localStorage.setItem('ff_2026_version', CURRENT_VERSION);
      localStorage.setItem('ff_2026_players', JSON.stringify(initialStaticPlayers));
      return initialStaticPlayers;
    }

    const saved = localStorage.getItem('ff_2026_players');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialStaticPlayers.length) {
          return parsed;
        }
      } catch (e) {
        return initialStaticPlayers;
      }
    }
    localStorage.setItem('ff_2026_players', JSON.stringify(initialStaticPlayers));
    return initialStaticPlayers;
  });

  // Drafted Players (My Team)
  const [myTeamIds, setMyTeamIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('ff_2026_my_team');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  // Drafted Players (Opponents / Taken)
  const [opponentDraftedIds, setOpponentDraftedIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('ff_2026_opponent_drafted');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        return new Set();
      }
    }
    return new Set();
  });

  // Compared Players (Max 4)
  const [comparisonIds, setComparisonIds] = useState<Set<number>>(new Set());

  // Selected Player for Deep Dive Modal
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Position Filter & Preset Filter
  const [selectedPos, setSelectedPos] = useState<string>('ALL');
  const [activeFilterPreset, setActiveFilterPreset] = useState<string>('all');

  // UI Modals & Drawers
  const [isDraftWarRoomOpen, setIsDraftWarRoomOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Saved Draft Sessions State
  const [savedDrafts, setSavedDrafts] = useState<DraftSession[]>(() => {
    const saved = localStorage.getItem('ff_2026_saved_drafts');
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

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem('ff_2026_active_session_id') || 'session_default';
  });

  // Auth & Sync State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncBannerMessage, setSyncBannerMessage] = useState<string | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('ff_2026_my_team', JSON.stringify(Array.from(myTeamIds)));
  }, [myTeamIds]);

  useEffect(() => {
    localStorage.setItem('ff_2026_opponent_drafted', JSON.stringify(Array.from(opponentDraftedIds)));
  }, [opponentDraftedIds]);

  useEffect(() => {
    localStorage.setItem('ff_2026_saved_drafts', JSON.stringify(savedDrafts));
  }, [savedDrafts]);

  useEffect(() => {
    localStorage.setItem('ff_2026_active_session_id', activeSessionId);
  }, [activeSessionId]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handler: Google Sign-in
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
      setSyncBannerMessage('Signed in to Google account successfully.');
      setTimeout(() => setSyncBannerMessage(null), 4000);
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.message || 'Google Sign-in failed. Please ensure popups are allowed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handler: Logout
  const handleLogout = async () => {
    try {
      await logoutGoogle();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Handler: Sync with Google Sheet
  const handleSyncSheet = async (sheetId: string = DEFAULT_SHEET_ID, range: string = 'A1:ZZ500') => {
    setIsSyncing(true);
    try {
      const accessToken = getAccessToken();
      const fetchedPlayers = await fetchLiveGoogleSheetData(sheetId, range, accessToken);
      if (fetchedPlayers && fetchedPlayers.length > 0) {
        setAllPlayers(fetchedPlayers);
        localStorage.setItem('ff_2026_players', JSON.stringify(fetchedPlayers));
        setLastSynced(new Date());
        setSyncBannerMessage(`Synced ${fetchedPlayers.length} players with live 2025 actuals & 2026 projections!`);
        setTimeout(() => setSyncBannerMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Handler: Restore default Top 200 dataset
  const handleRestoreDefaultDataset = () => {
    setAllPlayers(initialStaticPlayers);
    localStorage.setItem('ff_2026_players', JSON.stringify(initialStaticPlayers));
    setSyncBannerMessage(`Restored full Top 200 Player Master Dataset (${initialStaticPlayers.length} players)!`);
    setTimeout(() => setSyncBannerMessage(null), 4000);
  };

  // Handler: Draft Player to My Team
  const handleDraftPlayer = (player: Player) => {
    setMyTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(player.Player_ID)) {
        next.delete(player.Player_ID);
      } else {
        next.add(player.Player_ID);
        // Remove from opponent drafted if it was there
        setOpponentDraftedIds((opp) => {
          const oppNext = new Set(opp);
          oppNext.delete(player.Player_ID);
          return oppNext;
        });

        // Trigger confetti for key draft milestones
        if (next.size === 1 || next.size === 5 || next.size === 10) {
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
        }
      }
      return next;
    });
  };

  // Handler: Mark Drafted by Opponent
  const handleOpponentDraftPlayer = (player: Player) => {
    setOpponentDraftedIds((prev) => {
      const next = new Set(prev);
      if (next.has(player.Player_ID)) {
        next.delete(player.Player_ID);
      } else {
        next.add(player.Player_ID);
        // Remove from my team if it was there
        setMyTeamIds((my) => {
          const myNext = new Set(my);
          myNext.delete(player.Player_ID);
          return myNext;
        });
      }
      return next;
    });
  };

  // Handler: Compare Toggle
  const handleToggleCompare = (player: Player) => {
    setComparisonIds((prev) => {
      const next = new Set(prev);
      if (next.has(player.Player_ID)) {
        next.delete(player.Player_ID);
      } else {
        if (next.size >= 4) {
          alert('You can compare a maximum of 4 players side-by-side.');
          return prev;
        }
        next.add(player.Player_ID);
      }
      return next;
    });
  };

  // Handler: Start New Clean Draft Session
  const handleStartNewDraft = (customName?: string) => {
    const now = new Date().toISOString();
    
    // Auto-save current active session into history if it has picks
    if (myTeamIds.size > 0 || opponentDraftedIds.size > 0) {
      const currentSessionName = `Draft (${myTeamIds.size} roster, ${myTeamIds.size + opponentDraftedIds.size} picks)`;
      setSavedDrafts((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
        const updatedSession: DraftSession = {
          id: activeSessionId === 'session_default' ? `draft_${Date.now()}` : activeSessionId,
          name: existingIndex >= 0 ? prev[existingIndex].name : currentSessionName,
          createdAt: existingIndex >= 0 ? prev[existingIndex].createdAt : now,
          updatedAt: now,
          myTeamIds: Array.from(myTeamIds),
          opponentDraftedIds: Array.from(opponentDraftedIds),
        };
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = updatedSession;
          return copy;
        }
        return [updatedSession, ...prev];
      });
    }

    // Reset draft board
    const newId = `draft_${Date.now()}`;
    const newName = customName || `Mock Draft #${savedDrafts.length + 1}`;
    
    setMyTeamIds(new Set());
    setOpponentDraftedIds(new Set());
    setActiveSessionId(newId);
    
    const newSession: DraftSession = {
      id: newId,
      name: newName,
      createdAt: now,
      updatedAt: now,
      myTeamIds: [],
      opponentDraftedIds: [],
    };
    
    setSavedDrafts((prev) => [newSession, ...prev]);
    setSyncBannerMessage(`Started fresh draft: "${newName}" (Draft board cleared & previous draft saved to history)`);
    setTimeout(() => setSyncBannerMessage(null), 5000);
  };

  // Handler: Resume Existing Draft Session
  const handleResumeDraft = (sessionId: string) => {
    const target = savedDrafts.find((s) => s.id === sessionId);
    if (!target) return;

    // Auto-save current active session before switching
    if (activeSessionId !== sessionId && (myTeamIds.size > 0 || opponentDraftedIds.size > 0)) {
      const now = new Date().toISOString();
      setSavedDrafts((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = {
            ...copy[existingIndex],
            updatedAt: now,
            myTeamIds: Array.from(myTeamIds),
            opponentDraftedIds: Array.from(opponentDraftedIds),
          };
          return copy;
        }
        return prev;
      });
    }

    setMyTeamIds(new Set(target.myTeamIds));
    setOpponentDraftedIds(new Set(target.opponentDraftedIds));
    setActiveSessionId(target.id);
    setSyncBannerMessage(`Resumed "${target.name}" (${target.myTeamIds.length} rostered, ${target.myTeamIds.length + target.opponentDraftedIds.length} total picks)`);
    setTimeout(() => setSyncBannerMessage(null), 4000);
  };

  // Handler: Delete Saved Draft
  const handleDeleteDraft = (sessionId: string) => {
    setSavedDrafts((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId('session_default');
    }
  };

  // Handler: Hard Refresh Master Projections & LocalStorage Cache
  const handleHardRefresh = (resetPicks: boolean = false) => {
    localStorage.removeItem('ff_2026_players');
    localStorage.removeItem('ff_2026_version');
    localStorage.removeItem('ff_2026_is_live_synced');
    
    setAllPlayers(initialStaticPlayers);

    if (resetPicks) {
      setMyTeamIds(new Set());
      setOpponentDraftedIds(new Set());
      localStorage.removeItem('ff_2026_my_team');
      localStorage.removeItem('ff_2026_opponent_drafted');
      setSyncBannerMessage('Hard Refresh Executed: Master calibrated 2026 projections reloaded & draft board reset.');
    } else {
      setSyncBannerMessage('Hard Refresh Executed: Master calibrated 2026 projections reloaded (Current draft picks preserved).');
    }
    setTimeout(() => setSyncBannerMessage(null), 5000);
  };

  // Real-Time Positional Drop-Off & Cliff Computation
  const { availablePlayers, playersWithDynamicDropoff } = useMemo(() => {
    const unpicked = allPlayers.filter(
      (p) => !myTeamIds.has(p.Player_ID) && !opponentDraftedIds.has(p.Player_ID)
    );

    // Group available players by position
    const posGroups: Record<string, Player[]> = {
      QB: [], RB: [], WR: [], TE: [], K: [], DEF: []
    };
    unpicked.forEach((p) => {
      if (posGroups[p.Pos]) {
        posGroups[p.Pos].push(p);
      }
    });

    const dropoffMap = new Map<number, import('./types').DynamicDropoff>();
    Object.entries(posGroups).forEach(([, group]) => {
      // Sort descending by 2026 projected points
      group.sort((a, b) => {
        const ptsA = a.Proj_Fantasy_Pts_26 || ((a.Proj_PPG_26 || 0) * 17);
        const ptsB = b.Proj_Fantasy_Pts_26 || ((b.Proj_PPG_26 || 0) * 17);
        return ptsB - ptsA;
      });

      group.forEach((player, idx) => {
        const playerPts = player.Proj_Fantasy_Pts_26 || ((player.Proj_PPG_26 || 12) * 17);
        const nextPlayer = group[idx + 1];
        const nextPts = nextPlayer
          ? (nextPlayer.Proj_Fantasy_Pts_26 || ((nextPlayer.Proj_PPG_26 || 12) * 17))
          : 0;
        const dropoffPts = nextPlayer ? Number(Math.max(0, playerPts - nextPts).toFixed(1)) : 0;
        const dropoffPPG = nextPlayer ? Number((dropoffPts / 17).toFixed(1)) : 0;

        // Drop-off to the best available player in the next tier down
        const nextTierPlayer = group.slice(idx + 1).find((p) => p.Position_Tier > player.Position_Tier);
        const nextTierPts = nextTierPlayer
          ? (nextTierPlayer.Proj_Fantasy_Pts_26 || ((nextTierPlayer.Proj_PPG_26 || 12) * 17))
          : 0;
        const tierCliffDropoffPPG = nextTierPlayer
          ? Number((Math.max(0, playerPts - nextTierPts) / 17).toFixed(1))
          : undefined;

        dropoffMap.set(player.Player_ID, {
          dropoffPts,
          dropoffPPG,
          nextPlayerName: nextPlayer?.Player_Name,
          nextPlayerPPG: nextPlayer?.Proj_PPG_26,
          posRankAvailable: idx + 1,
          isPosLeader: idx === 0,
          tierCliffDropoffPPG,
        });
      });
    });

    const enrichPlayer = (p: Player): Player => {
      const info = dropoffMap.get(p.Player_ID);
      return {
        ...p,
        Dynamic_Dropoff: info?.dropoffPPG ?? 0,
        dynamicDropoff: info,
      };
    };

    return {
      availablePlayers: unpicked.map(enrichPlayer),
      playersWithDynamicDropoff: allPlayers.map(enrichPlayer),
    };
  }, [allPlayers, myTeamIds, opponentDraftedIds]);

  const myTeamPlayers = useMemo(() => {
    return playersWithDynamicDropoff.filter((p) => myTeamIds.has(p.Player_ID));
  }, [playersWithDynamicDropoff, myTeamIds]);

  const comparedPlayers = useMemo(() => {
    return playersWithDynamicDropoff.filter((p) => comparisonIds.has(p.Player_ID));
  }, [playersWithDynamicDropoff, comparisonIds]);

  // Current Draft Telemetry & Phase Calculation
  const totalPicksMade = myTeamIds.size + opponentDraftedIds.size;
  const currentRound = Math.floor(totalPicksMade / 12) + 1;

  const currentDraftPhase = useMemo(() => {
    if (totalPicksMade < 36) {
      return {
        id: 'phase_early',
        title: 'Phase 1: Foundation Anchors (Rounds 1–3)',
        range: [1, 36],
        strategyTip: 'Target tier-1 anchor assets: workhorse RBs with 80%+ snap shares, alpha WR1s, or dual-threat elite QBs.',
      };
    } else if (totalPicksMade < 84) {
      return {
        id: 'phase_mid',
        title: 'Phase 2: Core Starters & VORP Maximizers (Rounds 4–7)',
        range: [37, 84],
        strategyTip: 'Maximize Value Over Replacement (VORP). Secure high-volume WR2/RB2s before positional tier drop-offs.',
      };
    } else if (totalPicksMade < 132) {
      return {
        id: 'phase_late',
        title: 'Phase 3: Market Gaps & Target Share Arbitrage (Rounds 8–11)',
        range: [85, 132],
        strategyTip: 'Exploit market gaps where ADP lags True Rank by 10+ spots. Target high red-zone and target share players.',
      };
    } else {
      return {
        id: 'phase_deep',
        title: 'Phase 4: High-Upside Sleepers & Rookies (Rounds 12+)',
        range: [133, 200],
        strategyTip: 'Draft pure 90th-percentile ceiling upside. Prioritize explosive rookies, handcuff RBs, and high-EPA pass catchers.',
      };
    }
  }, [totalPicksMade]);

  // Team Positional Need Analysis (12-Team, 2-FLEX, 1 QB, 2 RB, 2 WR, 1 TE, 2 FLEX, 1 K, 1 DEF, 5 Bench)
  const teamNeedInfo = useMemo(() => {
    const counts = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
    myTeamPlayers.forEach((p) => {
      if (counts[p.Pos as Position] !== undefined) {
        counts[p.Pos as Position]++;
      }
    });

    const totalSkillStarters = counts.RB + counts.WR + counts.TE;
    const neededPositions: Position[] = [];

    if (counts.QB === 0) neededPositions.push('QB');
    if (counts.RB < 2) neededPositions.push('RB');
    if (counts.WR < 2) neededPositions.push('WR');
    if (counts.TE === 0) neededPositions.push('TE');

    // 2 FLEX spots (need up to 4 RBs and 4 WRs to secure starting core + flexes)
    if (totalSkillStarters < 7) {
      if (counts.RB < 3) neededPositions.push('RB');
      if (counts.WR < 3) neededPositions.push('WR');
      if (counts.RB < 4) neededPositions.push('RB');
      if (counts.WR < 4) neededPositions.push('WR');
    }

    if (counts.K === 0 && totalPicksMade >= 144) neededPositions.push('K');
    if (counts.DEF === 0 && totalPicksMade >= 144) neededPositions.push('DEF');

    // Determine primary need
    let primaryNeedPos = 'BPA (Best Player Available)';
    if (counts.QB === 0 && totalPicksMade >= 36) primaryNeedPos = 'QB (6-pt Pass TD Stud Needed)';
    else if (counts.TE === 0 && totalPicksMade >= 60) primaryNeedPos = 'TE (Starting TE Slot)';
    else if (counts.RB < 2) primaryNeedPos = `RB (Need ${2 - counts.RB} Starting RB${2 - counts.RB > 1 ? 's' : ''})`;
    else if (counts.WR < 2) primaryNeedPos = `WR (Need ${2 - counts.WR} Starting WR${2 - counts.WR > 1 ? 's' : ''})`;
    else if (totalSkillStarters < 7) primaryNeedPos = `FLEX (${7 - totalSkillStarters} Starting Skill/Flex Needed)`;
    else if (counts.QB === 0) primaryNeedPos = 'QB (Starting QB)';
    else if (counts.TE === 0) primaryNeedPos = 'TE (Starting TE)';
    else if (counts.RB < 4) primaryNeedPos = 'RB (Depth & Handcuff)';
    else if (counts.WR < 5) primaryNeedPos = 'WR (Upside Target)';

    return {
      counts,
      neededPositions,
      primaryNeedPos,
    };
  }, [myTeamPlayers, totalPicksMade]);

  // Filtered Players based on Presets
  const presetFilteredPlayers = useMemo(() => {
    return playersWithDynamicDropoff.filter((player) => {
      // Draft Phase Presets
      if (activeFilterPreset === 'phase_auto') {
        const [minRank, maxRank] = currentDraftPhase.range;
        // Provide a slight margin around the phase
        return player.Projected_Rank >= Math.max(1, minRank - 8) && player.Projected_Rank <= maxRank + 12;
      }
      if (activeFilterPreset === 'phase_early') {
        return player.Projected_Rank <= 36;
      }
      if (activeFilterPreset === 'phase_mid') {
        return player.Projected_Rank >= 37 && player.Projected_Rank <= 84;
      }
      if (activeFilterPreset === 'phase_late') {
        return player.Projected_Rank >= 85 && player.Projected_Rank <= 132;
      }
      if (activeFilterPreset === 'phase_deep') {
        return player.Projected_Rank >= 133;
      }

      // Team Need Preset
      if (activeFilterPreset === 'team_need') {
        const needed = teamNeedInfo.neededPositions;
        if (needed.length === 0) return true;
        return needed.includes(player.Pos);
      }

      // Metric & Archetype Presets
      if (activeFilterPreset === 'max_ppg') return (player.Proj_PPG_26 || 0) >= 15.0;
      if (activeFilterPreset === 'high_edge') return player.Championship_Edge_Score >= 75;
      if (activeFilterPreset === 'high_gap') return player.Market_Gap >= 10;
      if (activeFilterPreset === 'high_ceiling') return (player.Ceiling_PPG_26 || 0) >= 18;
      if (activeFilterPreset === 'high_vorp') return player.VORP >= 45;
      if (activeFilterPreset === 'high_dropoff') return (player.Dynamic_Dropoff || 0) >= 1.5;
      if (activeFilterPreset === 'sleepers') {
        return (player.Market_Gap >= 10 || player.Sleeper_Tag.toLowerCase().includes('breakout') || player.Sleeper_Tag.toLowerCase().includes('sleeper')) && player.Projected_Rank > 50;
      }
      if (activeFilterPreset === 'rookies') {
        return player.Is_Rookie || player.Sleeper_Tag.toLowerCase().includes('rookie');
      }
      if (activeFilterPreset === 'contract_year') {
        return player.Sleeper_Tag.toLowerCase().includes('contract');
      }

      return true;
    });
  }, [playersWithDynamicDropoff, activeFilterPreset, currentDraftPhase, teamNeedInfo]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
      </div>

      {/* Main Top Navigation */}
      <Navbar
        user={user}
        isLoggingIn={isLoggingIn}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenSyncModal={() => setIsSheetModalOpen(true)}
        onOpenDraftRoom={() => setIsDraftWarRoomOpen(true)}
        onOpenSessionModal={() => setIsSessionModalOpen(true)}
        onStartNewDraft={() => handleStartNewDraft()}
        onHardRefresh={() => setIsSessionModalOpen(true)}
        savedSessionsCount={savedDrafts.length}
        myTeamCount={myTeamIds.size}
        activeFilterPreset={activeFilterPreset}
        onSelectFilterPreset={setActiveFilterPreset}
      />

      <div className="mx-auto max-w-[1600px] w-full px-3 sm:px-5 lg:px-6 py-6 space-y-6">
        {/* Sync Success Alert Notification Banner */}
        {syncBannerMessage && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2.5 text-xs text-emerald-300 backdrop-blur-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{syncBannerMessage}</span>
            </div>
            <button
              onClick={() => setSyncBannerMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section: Data Engine Overview & Telemetry */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>2026 High-Correlation Predictive Analytics</span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 ring-1 ring-indigo-500/30">
                12 Teams • 0.5 PPR • 6-pt Pass TD • 2 FLEX (10 Starters, 5 Bench)
              </span>
            </div>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
              Championship Draft Engine
            </h1>
            <p className="mt-1 text-xs text-neutral-400 max-w-2xl leading-relaxed">
              Calibrated for 12-Team Half-PPR with 6-pt Passing TDs and 2 FLEX spots. Fuses 2025 actual production, 2026 ceiling projections, Dynamic VORP, and cross-platform market inefficiencies (Yahoo / Sleeper / ECR).
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-2 text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                Board Status
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {availablePlayers.length} Available
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3.5 py-2 text-right">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">
                My Roster
              </span>
              <span className="font-mono text-xs font-bold text-indigo-300">
                {myTeamIds.size}/15 Drafted
              </span>
            </div>
          </div>
        </section>

        {/* Strategic Foresight N+2 Real-Time Cards */}
        <StrategicForesightBar
          availablePlayers={availablePlayers}
          myTeam={myTeamPlayers}
          onSelectPlayer={setSelectedPlayer}
          onDraftPlayer={handleDraftPlayer}
        />

        {/* Master Interactive Data Grid */}
        <section>
          <MasterDataGrid
            players={presetFilteredPlayers}
            myTeamIds={myTeamIds}
            opponentDraftedIds={opponentDraftedIds}
            comparisonIds={comparisonIds}
            onDraftPlayer={handleDraftPlayer}
            onOpponentDraftPlayer={handleOpponentDraftPlayer}
            onToggleCompare={handleToggleCompare}
            onSelectPlayer={setSelectedPlayer}
            selectedPos={selectedPos}
            onSelectPos={setSelectedPos}
            activeFilterPreset={activeFilterPreset}
            onSelectFilterPreset={setActiveFilterPreset}
            currentDraftPhaseName={currentDraftPhase.title}
            currentTeamNeedName={teamNeedInfo.primaryNeedPos}
            strategyTip={currentDraftPhase.strategyTip}
          />
        </section>
      </div>

      {/* Floating Head-to-Head Comparison Dock */}
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
        myTeamIds={myTeamIds}
      />

      {/* Deep Dive Player Detail Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onDraft={handleDraftPlayer}
        isDrafted={selectedPlayer ? myTeamIds.has(selectedPlayer.Player_ID) : false}
        onToggleCompare={handleToggleCompare}
        isCompared={selectedPlayer ? comparisonIds.has(selectedPlayer.Player_ID) : false}
      />

      {/* Live Draft War Room Drawer */}
      <DraftWarRoom
        isOpen={isDraftWarRoomOpen}
        onClose={() => setIsDraftWarRoomOpen(false)}
        myTeam={myTeamPlayers}
        onRemovePlayer={handleDraftPlayer}
        onClearDraft={() => {
          setMyTeamIds(new Set());
          setOpponentDraftedIds(new Set());
        }}
        availablePlayers={availablePlayers}
        onDraftPlayer={handleDraftPlayer}
      />

      {/* Google Sheets Synchronization Modal */}
      <SheetSyncModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        user={user}
        isLoggingIn={isLoggingIn}
        isSyncing={isSyncing}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onSync={handleSyncSheet}
        onRestoreDefault={handleRestoreDefaultDataset}
        lastSynced={lastSynced}
        totalPlayersCount={allPlayers.length}
      />

      {/* Draft Session & Hard Refresh Modal */}
      <DraftSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        sessions={savedDrafts}
        activeSessionId={activeSessionId}
        myTeamCount={myTeamIds.size}
        totalPicksCount={myTeamIds.size + opponentDraftedIds.size}
        onStartNewDraft={handleStartNewDraft}
        onResumeDraft={handleResumeDraft}
        onDeleteDraft={handleDeleteDraft}
        onHardRefresh={handleHardRefresh}
      />
    </div>
  );
}

export default App;

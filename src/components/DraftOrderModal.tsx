import React, { useState } from 'react';
import { X, ArrowUp, ArrowDown, Shuffle, RotateCcw, Check, Users, Shield } from 'lucide-react';
import { TeamConfig } from '../types';
import { defaultTeams } from '../data';
import confetti from 'canvas-confetti';

interface DraftOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamConfig[];
  onSaveTeams: (updatedTeams: TeamConfig[]) => void;
}

export const DraftOrderModal: React.FC<DraftOrderModalProps> = ({
  isOpen,
  onClose,
  teams,
  onSaveTeams,
}) => {
  const [localTeams, setLocalTeams] = useState<TeamConfig[]>(teams);

  // Sync if teams prop changes
  React.useEffect(() => {
    setLocalTeams(teams);
  }, [teams]);

  if (!isOpen) return null;

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...localTeams];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    // Update slots
    const updated = copy.map((t, idx) => ({ ...t, slot: idx + 1 }));
    setLocalTeams(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === localTeams.length - 1) return;
    const copy = [...localTeams];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    // Update slots
    const updated = copy.map((t, idx) => ({ ...t, slot: idx + 1 }));
    setLocalTeams(updated);
  };

  const handleNameChange = (index: number, newName: string) => {
    const copy = [...localTeams];
    copy[index] = { ...copy[index], name: newName };
    setLocalTeams(copy);
  };

  const handleToggleUser = (index: number) => {
    const copy = localTeams.map((t, idx) => ({
      ...t,
      isUser: idx === index,
    }));
    setLocalTeams(copy);
  };

  const handleRandomize = () => {
    const shuffled = [...localTeams].sort(() => Math.random() - 0.5);
    const updated = shuffled.map((t, idx) => ({ ...t, slot: idx + 1 }));
    setLocalTeams(updated);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleResetDefault = () => {
    setLocalTeams(defaultTeams);
  };

  const handleSave = () => {
    onSaveTeams(localTeams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md animate-fadeIn p-4">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-100">Draft Order Configuration</h3>
              <p className="text-xs text-neutral-400">Customize 12-team draft slots, names, and user assignment for the 180-pick snake draft</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
          <span className="text-xs text-neutral-400">
            Total Teams: <strong className="text-white">12 Teams (15 Rounds • 180 Picks)</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-all"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>🎲 Randomize Order</span>
            </button>
            <button
              onClick={handleResetDefault}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-400" />
              <span>↺ Reset Default</span>
            </button>
          </div>
        </div>

        {/* Re-orderable Team List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {localTeams.map((team, index) => (
            <div
              key={team.id}
              className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                team.isUser
                  ? 'border-amber-500/50 bg-amber-950/20 ring-1 ring-amber-500/30'
                  : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                <span className="flex h-7 w-8 items-center justify-center rounded-lg bg-neutral-800 font-mono text-xs font-bold text-neutral-300 shrink-0">
                  #{index + 1}
                </span>

                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                <span className="hidden sm:inline-block rounded bg-neutral-800/80 px-2 py-0.5 text-[10px] text-neutral-400 shrink-0">
                  {team.archetype}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleUser(index)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    team.isUser
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                  title="Assign this team slot to your active user"
                >
                  {team.isUser ? '★ My Team' : 'Set as Mine'}
                </button>

                <div className="flex items-center border-l border-neutral-800 pl-2">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                    title="Move up in draft order"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === localTeams.length - 1}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
                    title="Move down in draft order"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>Save & Apply Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

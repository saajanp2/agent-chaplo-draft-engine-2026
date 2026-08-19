import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Plus, 
  Play, 
  Trash2, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Save,
  FolderOpen
} from 'lucide-react';
import { DraftSession, Player } from '../types';

interface DraftSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: DraftSession[];
  activeSessionId: string;
  myTeamCount: number;
  totalPicksCount: number;
  onStartNewDraft: (customName?: string) => void;
  onResumeDraft: (sessionId: string) => void;
  onDeleteDraft: (sessionId: string) => void;
  onHardRefresh: (resetPicks: boolean) => void;
}

export const DraftSessionModal: React.FC<DraftSessionModalProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  myTeamCount,
  totalPicksCount,
  onStartNewDraft,
  onResumeDraft,
  onDeleteDraft,
  onHardRefresh,
}) => {
  const [newDraftName, setNewDraftName] = useState('');
  const [confirmHardReset, setConfirmHardReset] = useState(false);
  const [resetPicksOnRefresh, setResetPicksOnRefresh] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDraftName.trim() || `Mock Draft #${sessions.length + 1}`;
    onStartNewDraft(name);
    setNewDraftName('');
    setFeedbackMsg(`Started new draft: "${name}"`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleResume = (id: string, name: string) => {
    onResumeDraft(id);
    setFeedbackMsg(`Resumed draft: "${name}"`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleTriggerHardRefresh = () => {
    onHardRefresh(resetPicksOnRefresh);
    setConfirmHardReset(false);
    setFeedbackMsg('Hard refresh complete! Loaded latest calibrated 2026 projections.');
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 backdrop-blur-md animate-fadeIn p-4">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl text-neutral-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-100">Draft Session & Data Manager</h3>
              <p className="text-xs text-neutral-400">Start new drafts, resume saved draft states, or perform a hard refresh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Current Active Session Status */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Active Draft Session
              </span>
            </div>
            <span className="text-xs text-neutral-400">
              {totalPicksCount} Total Picks Recorded
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Users className="h-3.5 w-3.5 text-indigo-400" />
                <span>My Team: <strong className="text-white">{myTeamCount} players</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>Active Board</span>
              </div>
            </div>

            <form onSubmit={handleCreateNew} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={newDraftName}
                onChange={(e) => setNewDraftName(e.target.value)}
                placeholder="New draft name (optional)..."
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1 sm:w-48"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Start New Draft</span>
              </button>
            </form>
          </div>
        </div>

        {/* Saved Draft History List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-neutral-400">
              Saved Draft Sessions ({sessions.length})
            </h4>
            <span className="text-[11px] text-neutral-500">Auto-saved to local browser storage</span>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-500">
              No previous draft sessions saved yet. Clicking "Start New Draft" will archive your current draft here.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const dateStr = new Date(session.updatedAt || session.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                      isActive
                        ? 'border-indigo-500/50 bg-indigo-950/30 ring-1 ring-indigo-500/30'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-serif text-sm font-bold text-neutral-200">{session.name}</h5>
                        {isActive && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>My Roster: <strong>{session.myTeamIds.length}</strong></span>
                        <span>•</span>
                        <span>Total Picks: <strong>{session.myTeamIds.length + session.opponentDraftedIds.length}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          onClick={() => handleResume(session.id, session.name)}
                          className="flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all"
                        >
                          <Play className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                          <span>Resume</span>
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteDraft(session.id)}
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-rose-400 transition-all"
                        title="Delete draft session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hard Refresh & Cache Wipe Section */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Hard Refresh & Master Data Reload
              </h4>
            </div>
            <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
              Clean Reset
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Perform a clean reload to wipe cached local browser state and reload the latest calibrated 2026 projections (12-Team, 0.5 PPR, 6-pt Pass TD, 2-FLEX).
          </p>

          {!confirmHardReset ? (
            <button
              onClick={() => setConfirmHardReset(true)}
              className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Hard Refresh Master Projections</span>
            </button>
          ) : (
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Confirm Hard Refresh</span>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetPicksOnRefresh}
                  onChange={(e) => setResetPicksOnRefresh(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Also clear current draft board picks (start with completely empty board)</span>
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleTriggerHardRefresh}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-all shadow-md shadow-amber-600/20"
                >
                  Confirm & Execute Hard Refresh
                </button>
                <button
                  onClick={() => setConfirmHardReset(false)}
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

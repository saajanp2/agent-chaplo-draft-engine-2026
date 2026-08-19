import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Sheet, X, RefreshCw, CheckCircle2, AlertCircle, ExternalLink, LogIn, LogOut, Key } from 'lucide-react';
import { DEFAULT_SHEET_ID, DEFAULT_SHEET_GID } from '../services/sheetsService';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isLoggingIn: boolean;
  isSyncing: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSync: (sheetId: string, range: string) => Promise<void>;
  onRestoreDefault?: () => void;
  lastSynced: Date | null;
  totalPlayersCount: number;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  isLoggingIn,
  isSyncing,
  onLogin,
  onLogout,
  onSync,
  onRestoreDefault,
  lastSynced,
  totalPlayersCount,
}) => {
  const [sheetId, setSheetId] = useState(DEFAULT_SHEET_ID);
  const [sheetTabRange, setSheetTabRange] = useState('A1:ZZ500');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setSyncStatusMsg(null);
    setSyncError(null);
    try {
      await onSync(sheetId, sheetTabRange);
      setSyncStatusMsg(`Successfully ingested and mapped spreadsheet rows into data engine!`);
    } catch (err: any) {
      setSyncError(err?.message || 'Failed to sync Google Sheet');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 p-4 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-sheet-modal"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <Sheet className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-100">
              Google Sheets Live Sync
            </h3>
            <p className="text-xs text-neutral-400">
              Ingest 2025 actuals and 2026 projected statistical categories
            </p>
          </div>
        </div>

        {/* Auth Status Banner */}
        <div className="my-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Google Authorization Status
              </span>
              <p className="text-xs text-neutral-200">
                {user ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Connected as {user.email}
                  </span>
                ) : (
                  <span className="text-neutral-400">Sign in with Google to enable live API synchronization</span>
                )}
              </p>
            </div>

            {user ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-700 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 transition-all shadow"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Authorizing...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Form: Spreadsheet ID & Range */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Google Spreadsheet ID / URL
            </label>
            <input
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="e.g. 1JMxaRKYC0MnM_4-9OAUI3_BU4Dpv8iuWtWza1z5hbBM"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
              <span>Default: 2026 Fantasy Master Dataset</span>
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:underline"
              >
                <span>Open Sheet</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300">
              Tab / Cell Range
            </label>
            <input
              type="text"
              value={sheetTabRange}
              onChange={(e) => setSheetTabRange(e.target.value)}
              placeholder="A1:ZZ500"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Sync Status / Error Messages */}
        {syncStatusMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {syncError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-500/15 p-3 text-xs text-rose-400 border border-rose-500/30">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* Telemetry info */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3 text-[11px] text-neutral-400">
          <span>Active Dataset: <b className="text-neutral-200">{totalPlayersCount} Players Loaded</b></span>
          <span>Last Synced: <b className="text-neutral-200">{lastSynced ? lastSynced.toLocaleTimeString() : 'Initial Load'}</b></span>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-2.5">
          {onRestoreDefault ? (
            <button
              id="btn-restore-default-dataset"
              onClick={() => {
                onRestoreDefault();
                setSyncStatusMsg(`Restored complete 200 Player Dataset with K & DEF appended.`);
              }}
              className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white transition-all"
            >
              Restore Master 200 + K/DEF Dataset
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Close
            </button>

            <button
              id="btn-trigger-sync"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Spreadsheet Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

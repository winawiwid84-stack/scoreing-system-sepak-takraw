import React, { useState } from 'react';
import { MatchScoreToast } from '../../types/toast';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Trophy,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ScoreToastContainerProps {
  toasts: MatchScoreToast[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectMatch?: (matchId: string) => void;
}

export const ScoreToastContainer: React.FC<ScoreToastContainerProps> = ({
  toasts,
  onDismiss,
  onClearAll,
  soundEnabled,
  onToggleSound,
  onSelectMatch,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none transition-all"
    >
      {/* Toast Dock Header (if multiple) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl pointer-events-auto text-[11px] text-slate-300 shadow-xl">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Firestore Observer Aktif</span>
          <span className="text-slate-400 font-normal">({toasts.length} update)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Matikan Suara Alert' : 'Nyalakan Suara Alert'}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {toasts.length > 1 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[10px] text-slate-400 hover:text-amber-400 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup Semua
            </button>
          )}
        </div>
      </div>

      {/* Stacked Toast Cards */}
      <div className="flex flex-col gap-2.5">
        {toasts.slice(0, 4).map((toast) => {
          const isPointScored = toast.changeType === 'POINT_SCORED';
          const isSetWon = toast.changeType === 'SET_WON';
          const isFinished = toast.changeType === 'MATCH_SUBMITTED' || toast.changeType === 'MATCH_VERIFIED';

          const borderStyle = isSetWon
            ? 'border-emerald-500/50 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900'
            : isFinished
            ? 'border-purple-500/50 bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900'
            : 'border-amber-500/50 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950';

          return (
            <div
              key={toast.id}
              onMouseEnter={() => setHoveredId(toast.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`pointer-events-auto border rounded-2xl p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 ${borderStyle} relative overflow-hidden`}
            >
              {/* Top Accent Strip */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isSetWon
                    ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500'
                    : isFinished
                    ? 'bg-gradient-to-r from-purple-500 via-blue-400 to-purple-500'
                    : 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600'
                }`}
              />

              {/* Toast Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isSetWon
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isFinished
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isSetWon ? (
                      <Trophy className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                    )}
                    <span>
                      {isSetWon
                        ? 'SET TUNTAS'
                        : isFinished
                        ? 'HASIL DISERAHKAN'
                        : 'SKOR TERBARU'}
                    </span>
                  </span>

                  <span className="text-[11px] font-mono font-bold text-slate-300">
                    {toast.matchCode}
                  </span>
                  <span className="text-[10px] text-slate-400">· {toast.courtName}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Tutup notifikasi"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category Info */}
              <div className="text-[11px] text-slate-400 mb-2 truncate">
                {toast.categoryName}
              </div>

              {/* Live Score Display Card */}
              <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 mb-2.5">
                <div className="flex items-center justify-between gap-2">
                  {/* Home Team */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <span>{toast.homeTeamName}</span>
                      {toast.scoringSide === 'HOME' && isPointScored && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] px-1 py-0.2 rounded font-black animate-bounce">
                          +1
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Set dimenangkan: {toast.homeSetsWon}
                    </span>
                  </div>

                  {/* Score Digit Display */}
                  <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 bg-slate-900 border border-slate-700/60 rounded-lg font-mono">
                    <span
                      className={`text-lg font-black transition-all ${
                        toast.scoringSide === 'HOME'
                          ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : 'text-white'
                      }`}
                    >
                      {toast.homeScore}
                    </span>
                    <span className="text-slate-500 font-bold">:</span>
                    <span
                      className={`text-lg font-black transition-all ${
                        toast.scoringSide === 'AWAY'
                          ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                          : 'text-white'
                      }`}
                    >
                      {toast.awayScore}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-right min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center justify-end gap-1">
                      {toast.scoringSide === 'AWAY' && isPointScored && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] px-1 py-0.2 rounded font-black animate-bounce">
                          +1
                        </span>
                      )}
                      <span>{toast.awayTeamName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Set dimenangkan: {toast.awaySetsWon}
                    </span>
                  </div>
                </div>

                {/* Subtitle Message */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-medium truncate">
                    Set {toast.setNumber}: {toast.message}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {new Date(toast.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {toast.refereeName && (
                  <span className="text-[10px] text-slate-400 truncate">
                    Wasit: {toast.refereeName}
                  </span>
                )}

                {onSelectMatch && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMatch(toast.matchId);
                      onDismiss(toast.id);
                    }}
                    className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <span>Buka Scoreboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Auto-Dismiss Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
                <div
                  className={`h-full bg-amber-400 transition-all ${
                    hoveredId === toast.id ? 'opacity-30' : 'animate-[shrink_4.5s_linear_forwards]'
                  }`}
                  style={{ width: hoveredId === toast.id ? '100%' : undefined }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

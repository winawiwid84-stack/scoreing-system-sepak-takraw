import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Match } from '../../types';
import { DigitalScoreboard } from './DigitalScoreboard';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
} from 'lucide-react';

interface RefereeDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const RefereeDashboard: React.FC<RefereeDashboardProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    matches,
    teams,
    categories,
    courts,
    simulateScoreChangeAlert,
    soundEnabled,
    setSoundEnabled,
  } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'pending'>('all');

  // Filter matches assigned to this referee
  const myMatches = matches.filter((m) => {
    // If user is named referee or wasit in general
    return (
      m.refereeId === currentUser.id ||
      m.refereeName?.includes(currentUser.fullName) ||
      currentUser.role === 'ADMIN' // Admin can also open scoreboard
    );
  });

  const getTeamName = (id?: string, placeholder?: string) => {
    if (!id) return placeholder || 'TBD';
    const found = teams.find((t) => t.id === id);
    return found ? found.name : placeholder || 'TBD';
  };

  const getCourtName = (id?: string) => {
    const found = courts.find((c) => c.id === id);
    return found ? found.name : 'Lapangan -';
  };

  if (selectedMatch) {
    // Fetch latest state of selected match
    const liveMatch = matches.find((m) => m.id === selectedMatch.id) || selectedMatch;
    return (
      <DigitalScoreboard
        match={liveMatch}
        onBack={() => setSelectedMatch(null)}
        onOpenLiveScoreboard={() => onNavigateTab && onNavigateTab('scoreboard')}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Referee Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-900/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Meja Wasit Pertandingan (Technical Table)</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Tercatat sebagai Wasit Resmi Turnamen. Pilih pertandingan untuk memulai pencatatan poin digital per set.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('scoreboard')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 via-amber-400 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Live Scoreboard (Fullscreen / Split)</span>
            </button>
          )}

          <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Total Tugas</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {myMatches.length}
            </span>
          </div>
          <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Menunggu Pengesahan</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {myMatches.filter((m) => m.status === 'AWAITING_VERIFICATION').length}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Firestore Observer Status Strip */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Firestore Observer Real-Time Aktif</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Sinkronisasi Meja Wasit
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Setiap kali skor diubah pada scoreboard wasit, sistem observer Firestore memancarkan alert toast real-time kepada seluruh pengguna.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Suara Alert: ON' : 'Suara Alert: OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => simulateScoreChangeAlert()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uji Alert Toast (+1 Poin)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Semua Penugasan ({myMatches.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-emerald-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Perlu Diisi / Aktif ({myMatches.filter((m) => m.status !== 'COMPLETED').length})
        </button>
      </div>

      {/* Matches List */}
      {myMatches.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">Belum Ada Pertandingan Ditugaskan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Admin panitia belum menetapkan Anda pada jadwal partai tertentu. Anda dapat melihat jadwal umum atau menghubungi koordinator perwasitan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myMatches
            .filter((m) => {
              if (filter === 'pending') return m.status !== 'COMPLETED';
              return true;
            })
            .map((match) => {
              const cat = categories.find((c) => c.id === match.categoryId);
              const homeName = getTeamName(match.teamHomeId, match.teamHomePlaceholder);
              const awayName = getTeamName(match.teamAwayId, match.teamAwayPlaceholder);

              return (
                <div
                  key={match.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {match.matchCode}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          match.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : match.status === 'ON_GOING'
                            ? 'bg-blue-500/20 text-blue-300'
                            : match.status === 'AWAITING_VERIFICATION'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {match.status === 'COMPLETED'
                          ? 'Selesai & Sah'
                          : match.status === 'ON_GOING'
                          ? 'Sedang Berlangsung'
                          : match.status === 'AWAITING_VERIFICATION'
                          ? 'Menunggu Pengesahan'
                          : 'Dijadwalkan'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{cat?.name}</span>
                      <span>·</span>
                      <span>{match.stage.replace('_', ' ')}</span>
                    </div>

                    {/* Teams Vs Box */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[170px]">{homeName}</span>
                        <span className="font-mono font-extrabold text-amber-400 text-sm">
                          {match.homeSetsWon}
                        </span>
                      </div>
                      <div className="border-t border-slate-900"></div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[170px]">{awayName}</span>
                        <span className="font-mono font-extrabold text-amber-400 text-sm">
                          {match.awaySetsWon}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{getCourtName(match.courtId)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {match.scheduledDate} · Pukul {match.scheduledTime} WIB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Buka Scoring Pertandingan</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

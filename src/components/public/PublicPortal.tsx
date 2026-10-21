import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Users,
  Search,
  CheckCircle2,
  Play,
  ArrowRight,
  Sparkles,
  Maximize2,
  Radio,
} from 'lucide-react';

interface PublicPortalProps {
  onNavigateTab: (tab: string) => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ onNavigateTab }) => {
  const { tournament, categories, courts, teams, matches } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [selectedCourtId, setSelectedCourtId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const liveMatches = matches.filter((m) => m.status === 'ON_GOING');
  const recentMatches = matches.filter((m) => m.status === 'COMPLETED').slice(-4);

  // Filtered schedule
  const filteredMatches = matches.filter((m) => {
    if (selectedCatId !== 'ALL' && m.categoryId !== selectedCatId) return false;
    if (selectedCourtId !== 'ALL' && m.courtId !== selectedCourtId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const home = teams.find((t) => t.id === m.teamHomeId)?.name.toLowerCase() || '';
      const away = teams.find((t) => t.id === m.teamAwayId)?.name.toLowerCase() || '';
      const code = m.matchCode.toLowerCase();
      return home.includes(q) || away.includes(q) || code.includes(q);
    }
    return true;
  });

  const getTeamName = (id?: string, placeholder?: string) => {
    if (!id) return placeholder || 'TBD';
    return teams.find((t) => t.id === id)?.name || placeholder || 'TBD';
  };

  const getCourtName = (id?: string) => {
    return courts.find((c) => c.id === id)?.name || 'Lapangan Belum Ditentukan';
  };

  return (
    <div className="space-y-10 pb-12">
      {/* HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src={tournament.bannerUrl}
            alt="Sepak Takraw Championship Action"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl p-6 sm:p-12 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide">
            <span className="bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
              PSTI Jawa Barat · Resmi ISTAF 2024+
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">
              {tournament.startDate} s/d {tournament.endDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight text-balance leading-tight">
            {tournament.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {tournament.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{tournament.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{teams.length} Regu Peserta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{categories.length} Nomor Kategori</span>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => onNavigateTab('scoreboard')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 via-amber-400 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>Live Scoreboard (Fullscreen & Split Screen)</span>
            </button>

            <button
              onClick={() => onNavigateTab('jadwal')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md transition-colors"
            >
              <span>Lihat Seluruh Jadwal & Hasil</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('klasemen')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md transition-colors"
            >
              <span>Klasemen Babak Grup</span>
            </button>

            <button
              onClick={() => onNavigateTab('bagan')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md transition-colors"
            >
              <span>Bagan Sistem Gugur</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE SCORE STRIP */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span>Pertandingan Sedang Berlangsung (Live Scoreboard)</span>
            </div>

            <button
              onClick={() => onNavigateTab('scoreboard')}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-500/20 to-amber-500/20 hover:from-red-500/30 hover:to-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Buka Layar Penuh (Split Screen)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((m) => {
              const home = teams.find((t) => t.id === m.teamHomeId);
              const away = teams.find((t) => t.id === m.teamAwayId);
              const cat = categories.find((c) => c.id === m.categoryId);

              return (
                <div
                  key={m.id}
                  className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-5 shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {m.matchCode}
                    </span>
                    <span className="text-slate-400">
                      {cat?.name} · {getCourtName(m.courtId)}
                    </span>
                    <span className="font-bold text-red-400 flex items-center gap-1 text-[11px]">
                      LIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center py-2 border-y border-slate-800">
                    <div className="text-center">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{home?.name}</h4>
                      <span className="text-[10px] text-slate-400">{home?.contingent}</span>
                      <div className="font-mono text-3xl font-black text-amber-400 mt-1">
                        {m.homeSetsWon}
                      </div>
                    </div>

                    <div className="text-center">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{away?.name}</h4>
                      <span className="text-[10px] text-slate-400">{away?.contingent}</span>
                      <div className="font-mono text-3xl font-black text-amber-400 mt-1">
                        {m.awaySetsWon}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
                    <span>Servis: {m.serviceSide === 'HOME' ? home?.name : away?.name}</span>
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      {m.sets.map((s) => (
                        <span key={s.setNumber} className="bg-slate-950 px-2 py-0.5 rounded">
                          S{s.setNumber}: {s.homeScore}-{s.awayScore}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE & RESULTS PORTAL SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Jadwal & Hasil Pertandingan</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cari pertandingan berdasarkan regu, nomor lapangan, atau kategori.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama regu / kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none w-48 text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none"
            >
              <option value="ALL">Semua Lapangan</option>
              {courts.map((crt) => (
                <option key={crt.id} value={crt.id}>
                  {crt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((m) => {
            const homeName = getTeamName(m.teamHomeId, m.teamHomePlaceholder);
            const awayName = getTeamName(m.teamAwayId, m.teamAwayPlaceholder);
            const cat = categories.find((c) => c.id === m.categoryId);
            const isWinnerHome = m.isVerified && m.winnerTeamId === m.teamHomeId;
            const isWinnerAway = m.isVerified && m.winnerTeamId === m.teamAwayId;

            return (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {m.matchCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.status === 'ON_GOING'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.status === 'COMPLETED'
                        ? 'Selesai & Sah'
                        : m.status === 'ON_GOING'
                        ? 'Sedang Berlangsung'
                        : 'Dijadwalkan'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    {cat?.name} · {m.stage.replace('_', ' ')}
                  </div>

                  {/* Teams Box */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`truncate max-w-[170px] ${
                          isWinnerHome ? 'font-black text-amber-300' : 'font-bold text-white'
                        }`}
                      >
                        {homeName}
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {m.status !== 'SCHEDULED' ? m.homeSetsWon : '-'}
                      </span>
                    </div>

                    <div className="border-t border-slate-900"></div>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`truncate max-w-[170px] ${
                          isWinnerAway ? 'font-black text-amber-300' : 'font-bold text-white'
                        }`}
                      >
                        {awayName}
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {m.status !== 'SCHEDULED' ? m.awaySetsWon : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Sets points summary */}
                  {m.sets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400 mt-2">
                      {m.sets.map((s) => (
                        <span key={s.setNumber} className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          S{s.setNumber}: {s.homeScore}-{s.awayScore}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {m.scheduledDate} {m.scheduledTime} WIB
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{getCourtName(m.courtId).split('(')[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

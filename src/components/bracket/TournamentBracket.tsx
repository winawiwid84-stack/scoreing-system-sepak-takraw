import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Match } from '../../types';
import { Trophy, Award, Clock, MapPin, CheckCircle, ChevronRight } from 'lucide-react';

export const TournamentBracket: React.FC = () => {
  const { categories, matches, teams, courts } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  // Filter knockout matches for this category
  const knockoutMatches = matches.filter(
    (m) => m.categoryId === activeCategory?.id && m.stage !== 'GROUP_STAGE'
  );

  const qfMatches = knockoutMatches.filter((m) => m.stage === 'QUARTER_FINAL');
  const sfMatches = knockoutMatches.filter((m) => m.stage === 'SEMI_FINAL');
  const bronzeMatches = knockoutMatches.filter((m) => m.stage === 'BRONZE_FINAL');
  const finalMatches = knockoutMatches.filter((m) => m.stage === 'FINAL');

  const getTeam = (id?: string) => teams.find((t) => t.id === id);

  const renderMatchCard = (m: Match, title?: string) => {
    const homeTeam = getTeam(m.teamHomeId);
    const awayTeam = getTeam(m.teamAwayId);
    const court = courts.find((c) => c.id === m.courtId);

    const isHomeWinner = m.isVerified && m.winnerTeamId === m.teamHomeId;
    const isAwayWinner = m.isVerified && m.winnerTeamId === m.teamAwayId;

    return (
      <div
        key={m.id}
        className={`bg-slate-900 border rounded-2xl p-3.5 space-y-2.5 shadow-md transition-all ${
          m.status === 'COMPLETED'
            ? 'border-emerald-800/60 bg-slate-900/90'
            : m.status === 'ON_GOING'
            ? 'border-amber-500/50 bg-slate-900'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-amber-400">{m.matchCode}</span>
            {title && <span>· {title}</span>}
          </div>
          <span
            className={`font-semibold ${
              m.status === 'COMPLETED'
                ? 'text-emerald-400'
                : m.status === 'ON_GOING'
                ? 'text-amber-400'
                : 'text-slate-500'
            }`}
          >
            {m.status === 'COMPLETED' ? 'Selesai' : m.status === 'ON_GOING' ? 'Live' : 'Jadwal'}
          </span>
        </div>

        {/* Team Home Slot */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
            isHomeWinner
              ? 'bg-amber-500/10 text-white font-bold border border-amber-500/30'
              : 'text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {isHomeWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            <span className="truncate">
              {homeTeam ? homeTeam.name : m.teamHomePlaceholder || 'TBD (Menunggu Laga)'}
            </span>
          </div>
          <span className="font-mono text-sm font-bold tabular-nums text-amber-400">
            {m.status !== 'SCHEDULED' ? m.homeSetsWon : '-'}
          </span>
        </div>

        {/* Team Away Slot */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
            isAwayWinner
              ? 'bg-amber-500/10 text-white font-bold border border-amber-500/30'
              : 'text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            {isAwayWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            <span className="truncate">
              {awayTeam ? awayTeam.name : m.teamAwayPlaceholder || 'TBD (Menunggu Laga)'}
            </span>
          </div>
          <span className="font-mono text-sm font-bold tabular-nums text-amber-400">
            {m.status !== 'SCHEDULED' ? m.awaySetsWon : '-'}
          </span>
        </div>

        {/* Match Sets Detail & Schedule */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
          <span>
            {m.scheduledDate} · {m.scheduledTime}
          </span>
          <span>{court?.name ? court.name.split('(')[0] : 'Lapangan Center'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header and Category Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Diagram Bagan Sistem Gugur (Bracket)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pemenang pertandingan resmi otomatis dimajukan ke bagan babak berikutnya setelah hasil disahkan oleh panitia.
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeCategory?.id === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {knockoutMatches.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          Belum ada bagan gugur yang diterbitkan untuk kategori ini. Bagan akan dibuat otomatis setelah babak grup tuntas.
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="min-w-[960px] grid grid-cols-4 gap-6 items-center">
            {/* Round 1: Perempat Final (Quarter Finals) */}
            <div className="space-y-6">
              <div className="text-center pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Perempat Final (QF)
                </h3>
                <span className="text-[10px] text-slate-400">8 Besar</span>
              </div>
              <div className="space-y-4">
                {qfMatches.map((m) => renderMatchCard(m))}
              </div>
            </div>

            {/* Round 2: Semifinals */}
            <div className="space-y-12">
              <div className="text-center pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Semifinal (SF)
                </h3>
                <span className="text-[10px] text-slate-400">4 Besar Menuju Podium</span>
              </div>
              <div className="space-y-10">
                {sfMatches.map((m) => renderMatchCard(m))}
              </div>
            </div>

            {/* Round 3: Bronze Final (Perebutan Juara 3) */}
            <div className="space-y-6 self-start pt-16">
              <div className="text-center pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Perebutan Juara 3</span>
                </h3>
                <span className="text-[10px] text-slate-400">Medali Perunggu</span>
              </div>

              {bronzeMatches.length > 0 ? (
                bronzeMatches.map((m) => renderMatchCard(m, 'Juara 3'))
              ) : (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-400">
                  Kategori ini menerapkan regulasi Juara 3 Bersama (tanpa tanding).
                </div>
              )}
            </div>

            {/* Round 4: Grand Final (Perebutan Juara 1 & 2) */}
            <div className="space-y-6 self-start pt-4">
              <div className="text-center pb-2 border-b border-amber-500/40">
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Grand Final (Emas & Perak)</span>
                </h3>
                <span className="text-[10px] text-amber-300 font-semibold">Partai Puncak</span>
              </div>

              {finalMatches.map((m) => renderMatchCard(m, 'Final Emas'))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

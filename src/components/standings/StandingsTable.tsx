import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { calculateGroupStandings } from '../../utils/scoring';
import { Trophy, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const StandingsTable: React.FC = () => {
  const { categories, teams, groups, matches } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const catGroups = groups.filter((g) => g.categoryId === activeCategory?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header and Category Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Klasemen Babak Grup Sepak Takraw</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dihitung otomatis secara resmi dari hasil pertandingan yang telah disahkan panitia.
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

      {/* Tie-Breaker Rules Card */}
      {activeCategory && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">Urutan Tie-Breaker Resmi:</span>
            <span className="text-slate-400">
              {activeCategory.regulation.tieBreakerOrder.join(' → ')}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Poin Menang: +{activeCategory.regulation.pointsWin}</span>
            <span>·</span>
            <span>Poin Kalah: {activeCategory.regulation.pointsLoss}</span>
            <span>·</span>
            <span>Kuota Lolos: Top {activeCategory.advancingPerGroup} Regu / Grup</span>
          </div>
        </div>
      )}

      {/* Groups Display */}
      {catGroups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-400">
          Belum ada pembagian grup yang dibuat untuk kategori ini.
        </div>
      ) : (
        <div className="space-y-6">
          {catGroups.map((group) => {
            const teamsInThisGroup = teams.filter((t) => group.teamIds.includes(t.id));
            const matchesInThisGroup = matches.filter(
              (m) => m.categoryId === activeCategory.id && m.groupId === group.id
            );

            const standings = calculateGroupStandings(
              teamsInThisGroup,
              matchesInThisGroup,
              activeCategory.regulation,
              activeCategory.advancingPerGroup
            );

            return (
              <div
                key={group.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg"
              >
                {/* Group Table Header */}
                <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                      {group.name}
                    </span>
                    <h3 className="text-sm font-bold text-white">GRUP {group.name}</h3>
                  </div>

                  <span className="text-xs text-slate-400">
                    {teamsInThisGroup.length} Regu Terdaftar
                  </span>
                </div>

                {/* Responsive Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-200">
                    <thead className="bg-slate-950/50 text-[11px] text-slate-400 border-b border-slate-800 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-center w-12">Pos</th>
                        <th className="py-3 px-4">Regu & Kontingen</th>
                        <th className="py-3 px-3 text-center" title="Main">M</th>
                        <th className="py-3 px-3 text-center" title="Menang">Mn</th>
                        <th className="py-3 px-3 text-center" title="Kalah">K</th>
                        <th className="py-3 px-4 text-center font-bold text-amber-400">POIN</th>
                        <th className="py-3 px-3 text-center" title="Set Menang - Set Kalah">Set M-K</th>
                        <th className="py-3 px-3 text-center" title="Selisih Set">SS</th>
                        <th className="py-3 px-3 text-center" title="Rasio Set">R.Set</th>
                        <th className="py-3 px-3 text-center" title="Poin Angka Menang - Kalah">Angka M-K</th>
                        <th className="py-3 px-3 text-center" title="Selisih Poin Angka">SP</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {standings.map((row) => (
                        <tr
                          key={row.teamId}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            row.isQualified ? 'bg-amber-500/[0.02]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                                row.rank === 1
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : row.rank === 2
                                  ? 'bg-slate-700 text-white'
                                  : 'text-slate-400'
                              }`}
                            >
                              {row.rank}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">{row.teamName}</div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {row.contingent}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                            {row.played}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono tabular-nums text-emerald-400 font-bold">
                            {row.won}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono tabular-nums text-rose-400">
                            {row.lost}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono tabular-nums font-black text-amber-400 text-sm">
                            {row.points}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-300">
                            {row.setsWon}-{row.setsLost}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                            {row.setDifference > 0 ? `+${row.setDifference}` : row.setDifference}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-400">
                            {row.setRatio}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono tabular-nums text-slate-300">
                            {row.pointsWon}-{row.pointsLost}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                            {row.pointDifference > 0 ? `+${row.pointDifference}` : row.pointDifference}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {row.needsDecision ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                <AlertCircle className="w-3 h-3" /> Putusan Panitia
                              </span>
                            ) : row.isQualified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <CheckCircle2 className="w-3 h-3" /> Lolos Babak Gugur
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Gugur</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

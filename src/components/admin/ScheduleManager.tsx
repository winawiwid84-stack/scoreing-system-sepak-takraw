import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Match, MatchStatus } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  AlertTriangle,
  Play,
  RotateCw,
  Plus,
  CheckCircle,
} from 'lucide-react';

export const ScheduleManager: React.FC = () => {
  const {
    tournament,
    categories,
    teams,
    courts,
    matches,
    users,
    autoGenerateGroupSchedule,
    updateMatch,
    assignReferee,
  } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const referees = users.filter((u) => u.role === 'WASIT' || u.role === 'ADMIN');

  // Filter matches
  const catMatches = matches.filter((m) => {
    if (m.categoryId !== activeCategory?.id) return false;
    if (filterStage !== 'ALL' && m.stage !== filterStage) return false;
    return true;
  });

  // Conflict Detection: check if any two matches share the same court at same date & time,
  // or if the same team plays in two matches at the same date & time.
  const conflicts: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const m1 = matches[i];
      const m2 = matches[j];
      if (
        m1.scheduledDate === m2.scheduledDate &&
        m1.scheduledTime === m2.scheduledTime &&
        m1.status !== 'COMPLETED' &&
        m2.status !== 'COMPLETED'
      ) {
        // Court conflict
        if (m1.courtId && m1.courtId === m2.courtId) {
          const courtName = courts.find((c) => c.id === m1.courtId)?.name || 'Lapangan';
          conflicts.push(
            `Bentrok Lapangan: ${m1.matchCode} dan ${m2.matchCode} dijadwalkan di ${courtName} pada waktu yang sama (${m1.scheduledDate} ${m1.scheduledTime}).`
          );
        }
        // Team conflict
        const teams1 = [m1.teamHomeId, m1.teamAwayId].filter(Boolean);
        const teams2 = [m2.teamHomeId, m2.teamAwayId].filter(Boolean);
        const shared = teams1.filter((t) => teams2.includes(t));
        if (shared.length > 0) {
          const tName = teams.find((t) => t.id === shared[0])?.name || 'Tim';
          conflicts.push(
            `Bentrok Tim: ${tName} dijadwalkan bertanding ganda pada ${m1.matchCode} dan ${m2.matchCode} jam ${m1.scheduledTime}.`
          );
        }
      }
    }
  }

  const getTeamName = (id?: string, placeholder?: string) => {
    if (!id) return placeholder || 'TBD';
    return teams.find((t) => t.id === id)?.name || placeholder || 'TBD';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Auto-Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Manajemen Jadwal Pertandingan & Penugasan Wasit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Penetapan jam tanding, nomor lapangan, dan penugasan wasit berlisensi tanpa bentrok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeCategory?.id === cat.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (
                confirm(
                  `Buat jadwal otomatis untuk seluruh laga babak grup pada kategori ${activeCategory.name}?`
                )
              ) {
                autoGenerateGroupSchedule(activeCategory.id);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Auto Jadwal Grup</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Alerts */}
      {conflicts.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Peringatan Deteksi Bentrok Jadwal ({conflicts.length} Ditemukan):</span>
          </div>
          <div className="space-y-1">
            {conflicts.map((conf, idx) => (
              <div key={idx} className="text-xs text-rose-200/90 pl-6 list-disc">
                · {conf}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Stages */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setFilterStage('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStage === 'ALL'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Semua Babak ({catMatches.length})
        </button>
        <button
          onClick={() => setFilterStage('GROUP_STAGE')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStage === 'GROUP_STAGE'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Babak Grup
        </button>
        <button
          onClick={() => setFilterStage('QUARTER_FINAL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStage === 'QUARTER_FINAL'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Perempat Final
        </button>
        <button
          onClick={() => setFilterStage('SEMI_FINAL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStage === 'SEMI_FINAL'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Semifinal
        </button>
        <button
          onClick={() => setFilterStage('FINAL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterStage === 'FINAL'
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Final
        </button>
      </div>

      {/* Match Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Kode Laga</th>
                <th className="py-3 px-4">Partai Pertandingan</th>
                <th className="py-3 px-4">Tanggal & Jam</th>
                <th className="py-3 px-4">Lapangan</th>
                <th className="py-3 px-4">Wasit Bertugas</th>
                <th className="py-3 px-4 text-center">Status Laga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {catMatches.map((m) => {
                const homeName = getTeamName(m.teamHomeId, m.teamHomePlaceholder);
                const awayName = getTeamName(m.teamAwayId, m.teamAwayPlaceholder);

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                        {m.matchCode}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {m.stage.replace('_', ' ')} {m.groupName ? `(Grup ${m.groupName})` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white font-bold text-sm">
                        {homeName} <span className="text-slate-500 font-normal">vs</span> {awayName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Skor Set:{' '}
                        <strong className="text-amber-400">
                          {m.homeSetsWon} - {m.awaySetsWon}
                        </strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={m.scheduledDate}
                          onChange={(e) =>
                            updateMatch(m.id, { scheduledDate: e.target.value })
                          }
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <input
                          type="time"
                          value={m.scheduledTime}
                          onChange={(e) =>
                            updateMatch(m.id, { scheduledTime: e.target.value })
                          }
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none w-20"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={m.courtId || ''}
                        onChange={(e) => updateMatch(m.id, { courtId: e.target.value })}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none max-w-[160px]"
                      >
                        <option value="">Pilih Lapangan</option>
                        {courts.map((crt) => (
                          <option key={crt.id} value={crt.id}>
                            {crt.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={m.refereeId || ''}
                        onChange={(e) => {
                          const ref = referees.find((r) => r.id === e.target.value);
                          if (ref) {
                            assignReferee(m.id, ref.id, ref.fullName);
                          }
                        }}
                        className={`border rounded px-2 py-1 text-xs focus:outline-none max-w-[170px] ${
                          !m.refereeId
                            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      >
                        <option value="">Belum Ditugaskan</option>
                        {referees.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.fullName}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={m.status}
                        onChange={(e) =>
                          updateMatch(m.id, { status: e.target.value as MatchStatus })
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border focus:outline-none ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : m.status === 'ON_GOING'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : m.status === 'AWAITING_VERIFICATION'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="SCHEDULED">Dijadwalkan</option>
                        <option value="READY">Siap Tanding</option>
                        <option value="ON_GOING">Sedang Berlangsung</option>
                        <option value="AWAITING_VERIFICATION">Menunggu Pengesahan</option>
                        <option value="COMPLETED">Selesai & Sah</option>
                        <option value="POSTPONED">Ditunda</option>
                        <option value="WALKOVER">Walkover (WO)</option>
                        <option value="CANCELLED">Dibatalkan</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

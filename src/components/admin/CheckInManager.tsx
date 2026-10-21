import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Team, Player } from '../../types';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Printer,
  FileCheck,
  Shirt,
  Calendar,
  Users,
  Building,
  RotateCcw,
  Check,
} from 'lucide-react';

export const CheckInManager: React.FC = () => {
  const { categories, teams, currentUser, updateTeamCheckIn, togglePlayerAttendance } =
    useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HADIR' | 'BELUM_HADIR' | 'TIDAK_HADIR'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingTeam, setInspectingTeam] = useState<Team | null>(null);

  // Modal State for Detailed Check-In
  const [repName, setRepName] = useState<string>('');
  const [checkInNotes, setCheckInNotes] = useState<string>('');
  const [checkedPlayerIds, setCheckedPlayerIds] = useState<string[]>([]);

  // Filter teams (Only APPROVED or SUBMITTED teams can register attendance)
  const filteredTeams = teams.filter((t) => {
    if (selectedCatId !== 'ALL' && t.categoryId !== selectedCatId) return false;
    const currentStatus = t.checkInStatus || 'BELUM_HADIR';
    if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCont = t.contingent.toLowerCase().includes(q);
      const matchCoach = t.coachName?.toLowerCase().includes(q) || false;
      const matchRep = t.checkInRepresentative?.toLowerCase().includes(q) || false;
      return matchName || matchCont || matchCoach || matchRep;
    }
    return true;
  });

  // Calculate Metrics
  const totalTeams = teams.length;
  const hadirCount = teams.filter((t) => t.checkInStatus === 'HADIR').length;
  const belumHadirCount = teams.filter((t) => !t.checkInStatus || t.checkInStatus === 'BELUM_HADIR').length;
  const tidakHadirCount = teams.filter((t) => t.checkInStatus === 'TIDAK_HADIR').length;
  const attendanceRate = totalTeams > 0 ? Math.round((hadirCount / totalTeams) * 100) : 0;

  // Open detailed inspection modal
  const openCheckInModal = (team: Team) => {
    setInspectingTeam(team);
    setRepName(team.checkInRepresentative || team.coachName || team.managerName || '');
    setCheckInNotes(team.checkInNotes || 'Hadir lengkap, seragam dan identitas atlet telah diperiksa.');

    // Pre-check players who are marked present or all starters by default
    const currentChecked = team.players
      .filter((p) => p.isPresent !== false)
      .map((p) => p.id);
    setCheckedPlayerIds(currentChecked.length > 0 ? currentChecked : team.players.map((p) => p.id));
  };

  const handleQuickMarkHadir = (team: Team) => {
    updateTeamCheckIn(team.id, 'HADIR', {
      representativeName: team.coachName || team.managerName || 'Perwakilan Tim',
      notes: 'Daftar ulang cepat disahkan oleh petugas panitia.',
      checkedPlayerIds: team.players.map((p) => p.id),
    });
  };

  const handleSaveModalCheckIn = (status: 'HADIR' | 'BELUM_HADIR' | 'TIDAK_HADIR') => {
    if (!inspectingTeam) return;

    updateTeamCheckIn(inspectingTeam.id, status, {
      representativeName: repName,
      notes: checkInNotes,
      checkedPlayerIds: status === 'HADIR' ? checkedPlayerIds : [],
    });

    setInspectingTeam(null);
  };

  const togglePlayerInModal = (playerId: string) => {
    setCheckedPlayerIds((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Print Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Meja Pendaftaran Ulang & Presensi Kehadiran Peserta</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Daftar Ulang Peserta Turnamen
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Verifikasi fisik kedatangan regu, pemeriksaan kehadiran atlet inti & cadangan, serta legalitas seragam pertandingan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Lembar Presensi</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Total Regu Terdaftar</span>
          <span className="font-mono text-2xl font-black text-white mt-1 block">
            {totalTeams}
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-emerald-300 block font-bold">Hadir / Daftar Ulang</span>
          <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
            {hadirCount}{' '}
            <span className="text-xs font-normal text-emerald-300">({attendanceRate}%)</span>
          </span>
        </div>

        <div className="bg-slate-900 border border-amber-500/40 bg-amber-500/5 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-amber-300 block font-bold">Belum Melapor</span>
          <span className="font-mono text-2xl font-black text-amber-400 mt-1 block">
            {belumHadirCount}
          </span>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-rose-300 block font-medium">Tidak Hadir / WO</span>
          <span className="font-mono text-2xl font-black text-rose-400 mt-1 block">
            {tidakHadirCount}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari regu, pelatih, kontingen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none w-56 text-xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
          >
            <option value="ALL">Semua Status Presensi</option>
            <option value="HADIR">Sudah Hadir / Daftar Ulang</option>
            <option value="BELUM_HADIR">Belum Melapor</option>
            <option value="TIDAK_HADIR">Tidak Hadir (Mengundurkan Diri)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Menampilkan <strong className="text-white font-mono">{filteredTeams.length}</strong> regu
        </div>
      </div>

      {/* Printable Roll Call Title (Only in print) */}
      <div className="hidden print-only text-center mb-6">
        <h1 className="text-xl font-bold uppercase">
          Formulir Presensi & Daftar Ulang Peserta Turnamen Sepak Takraw
        </h1>
        <p className="text-xs">
          PSTI Kota Bandung · GOR Sepak Takraw, Lodaya Bandung · Tanggal: {new Date().toLocaleDateString('id-ID')}
        </p>
      </div>

      {/* Teams Check-in Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Regu & Kontingen</th>
                <th className="py-3.5 px-4">Kategori Laga</th>
                <th className="py-3.5 px-4">Pelatih / Perwakilan Lapor</th>
                <th className="py-3.5 px-4 text-center">Fisik Atlet</th>
                <th className="py-3.5 px-4 text-center">Status Kehadiran</th>
                <th className="py-3.5 px-4 text-center no-print">Tindakan Panitia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTeams.map((team) => {
                const cat = categories.find((c) => c.id === team.categoryId);
                const isHadir = team.checkInStatus === 'HADIR';
                const isTidakHadir = team.checkInStatus === 'TIDAK_HADIR';
                const presentPlayersCount = team.players.filter((p) => p.isPresent !== false).length;

                return (
                  <tr key={team.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                          {team.groupSlotCode || 'Pool'}
                        </span>
                        <div>
                          <div className="font-bold text-white text-sm">{team.name}</div>
                          <div className="text-[11px] text-slate-400">{team.contingent}</div>
                        </div>
                      </div>
                      {team.checkInNotes && (
                        <div className="text-[10px] text-slate-400 mt-1 italic pl-1 border-l-2 border-slate-700">
                          {team.checkInNotes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300">{cat?.name || 'Kategori'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">
                        {team.checkInRepresentative || team.coachName || team.managerName || '-'}
                      </div>
                      {team.checkInTime ? (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>
                            Lapor: {new Date(team.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500">Belum konfirmasi lapor</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openCheckInModal(team)}
                        className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 hover:border-amber-400 transition-colors"
                      >
                        <span className={isHadir ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                          {team.players.length > 0 ? `${presentPlayersCount}/${team.players.length} Atlet Hadir` : 'Belum Ada Roster'}
                        </span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                          isHadir
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isTidakHadir
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isHadir ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Hadir Sah</span>
                          </>
                        ) : isTidakHadir ? (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tidak Hadir / WO</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Belum Lapor</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isHadir ? (
                          <button
                            onClick={() => handleQuickMarkHadir(team)}
                            title="Tandai Hadir Lengkap Langsung"
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Tandai Hadir</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openCheckInModal(team)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold"
                          >
                            Edit Rincian
                          </button>
                        )}

                        <button
                          onClick={() => openCheckInModal(team)}
                          title="Periksa Kehadiran Fisik Pemain"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Roster
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED CHECK-IN & PLAYER ATTENDANCE MODAL */}
      {inspectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>Daftar Ulang Fisik: {inspectingTeam.name}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {inspectingTeam.contingent} · Slot Pool: {inspectingTeam.groupSlotCode || 'Pool'}
                </span>
              </div>

              <button
                onClick={() => setInspectingTeam(null)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Representative Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Pelatih / Perwakilan yang Melapor
                  </label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    placeholder="Nama Lengkap Pelatih / Manajer"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Petugas Meja Daftar Ulang
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.fullName}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Pemeriksaan Fisik & Kostum
                </label>
                <input
                  type="text"
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  placeholder="Contoh: Seragam disetujui, bola pemanasan sesuai regulasi."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Individual Players Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Pemeriksaan Kehadiran Atlet per Individu ({checkedPlayerIds.length}/{inspectingTeam.players.length} Hadir)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCheckedPlayerIds(inspectingTeam.players.map((p) => p.id))}
                    className="text-[11px] text-amber-300 hover:underline"
                  >
                    Centang Semua Hadir
                  </button>
                </div>

                {inspectingTeam.players.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                    Belum ada atlet yang didaftarkan pada regu ini.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {inspectingTeam.players.map((player) => {
                      const isChecked = checkedPlayerIds.includes(player.id);

                      return (
                        <div
                          key={player.id}
                          onClick={() => togglePlayerInModal(player.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                            />
                            <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-amber-400 flex items-center justify-center text-xs">
                              {player.jerseyNumber}
                            </span>
                            <div>
                              <div className="font-bold text-white">{player.fullName}</div>
                              <div className="text-[10px] text-slate-400">
                                Posisi: <strong className="text-amber-300">{player.position}</strong> · {player.isStarter ? 'Inti' : 'Cadangan'} · NIK: {player.identityNumber}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isChecked
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isChecked ? 'Fisik Hadir' : 'Belum Hadir'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSaveModalCheckIn('TIDAK_HADIR')}
                className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold transition-colors"
              >
                Tandai Walkover / Batal Hadir
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveModalCheckIn('BELUM_HADIR')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Reset Belum Lapor
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModalCheckIn('HADIR')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Konfirmasi & Sahkan Hadir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

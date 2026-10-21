import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { RegistrationStatus, Team } from '../../types';
import {
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Search,
  Filter,
} from 'lucide-react';

export const TeamVerification: React.FC = () => {
  const { categories, teams, setTeamStatus, verifyPlayer } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [reasonModal, setReasonModal] = useState<{
    teamId: string;
    action: RegistrationStatus;
  } | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const filteredTeams = teams.filter((t) => {
    if (selectedCatId !== 'ALL' && t.categoryId !== selectedCatId) return false;
    if (statusFilter !== 'ALL' && t.registrationStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCont = t.contingent.toLowerCase().includes(q);
      return matchName || matchCont;
    }
    return true;
  });

  const handleActionClick = (teamId: string, action: RegistrationStatus) => {
    if (action === 'APPROVED') {
      setTeamStatus(teamId, 'APPROVED', 'Disetujui lengkap oleh Panitia Keabsahan PSTI.');
    } else {
      setReasonModal({ teamId, action });
      setNoteText('');
    }
  };

  const handleConfirmReason = () => {
    if (!reasonModal) return;
    setTeamStatus(reasonModal.teamId, reasonModal.action, noteText);
    setReasonModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Verifikasi & Keabsahan Regu & Atlet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pemeriksaan dokumen identitas, nomor punggung, posisi resmi, dan kelayakan usia atlet kategori Kadet/Junior.
          </p>
        </div>

        {/* Filter Tools */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Cari regu / kontingen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none w-44"
          />

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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUBMITTED">Diajukan (Perlu Review)</option>
            <option value="APPROVED">Disetujui (Approved)</option>
            <option value="NEEDS_REVISION">Perlu Perbaikan</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Teams Verification Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Regu & Kontingen</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Pelatih / Kontak</th>
                <th className="py-3 px-4 text-center">Jumlah Atlet</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tindakan Panitia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredTeams.map((team) => {
                const cat = categories.find((c) => c.id === team.categoryId);

                return (
                  <tr key={team.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{team.name}</div>
                      <div className="text-[11px] text-slate-400">{team.contingent}</div>
                      {team.rejectionReason && (
                        <div className="text-[10px] text-rose-300 mt-1 italic">
                          Catatan: {team.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300">{cat?.name || 'Kategori'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white">{team.coachName || '-'}</div>
                      <div className="text-[11px] text-slate-400">{team.contactPhone || '-'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedTeam(team)}
                        className="font-mono font-bold text-amber-400 hover:underline bg-slate-950 px-2 py-1 rounded border border-slate-800"
                      >
                        {team.players.length} Pemain (Lihat Roster)
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          team.registrationStatus === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : team.registrationStatus === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : team.registrationStatus === 'NEEDS_REVISION'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {team.registrationStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleActionClick(team.id, 'APPROVED')}
                          title="Setujui Regu"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleActionClick(team.id, 'NEEDS_REVISION')}
                          title="Minta Perbaikan"
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold"
                        >
                          Revisi
                        </button>
                        <button
                          onClick={() => handleActionClick(team.id, 'REJECTED')}
                          title="Tolak Regu"
                          className="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-[11px] font-semibold"
                        >
                          Tolak
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

      {/* Modal Detail Roster Pemain */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Daftar Atlet Regu: {selectedTeam.name}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedTeam.contingent} · Total {selectedTeam.players.length} Pemain
                </span>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              {selectedTeam.players.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 italic">
                  Belum ada data atlet yang diinputkan oleh pelatih.
                </div>
              ) : (
                selectedTeam.players.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-amber-400 flex items-center justify-center text-sm">
                        {p.jerseyNumber}
                      </span>
                      <div>
                        <div className="font-bold text-white">{p.fullName}</div>
                        <div className="text-[11px] text-slate-400">
                          Posisi: <strong className="text-amber-400">{p.position}</strong> ·
                          Lahir: {p.birthDate} · NIK: {p.identityNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => verifyPlayer(p.id, !p.isVerified, 'Diverifikasi panitia')}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${
                          p.isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.isVerified ? 'Terverifikasi' : 'Verifikasi Atlet'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Catatan Alasan (Revisi / Tolak) */}
      {reasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {reasonModal.action === 'REJECTED'
                ? 'Alasan Penolakan Regu'
                : 'Catatan Perbaikan Dokumen'}
            </h3>

            <p className="text-xs text-slate-400">
              Cantumkan catatan alasan kepada pelatih regu (misal: berkas akta lahir kurang jelas atau melebihi batas usia):
            </p>

            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Contoh: Lampirkan kembali scan akta kelahiran pemain nomor punggung 7."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReasonModal(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReason}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Kirim Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

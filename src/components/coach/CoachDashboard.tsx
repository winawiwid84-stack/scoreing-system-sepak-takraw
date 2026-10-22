import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Player, Team } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Calendar,
  Award,
} from 'lucide-react';

export const CoachDashboard: React.FC = () => {
  const {
    currentUser,
    teams,
    categories,
    matches,
    registerTeam,
    updateTeam,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setTeamStatus,
  } = useTournament();

  // Find coach's managed team
  const coachTeam = teams.find(
    (t) => t.id === currentUser.teamId || t.coachName?.includes(currentUser.fullName)
  ) || teams[0]; // fallback to team 1 for quick testing

  const [activeTab, setActiveTab] = useState<'roster' | 'matches' | 'register'>('roster');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  // New Player Form State
  const [playerName, setPlayerName] = useState('');
  const [playerNik, setPlayerNik] = useState('');
  const [playerBirthDate, setPlayerBirthDate] = useState('2014-06-15');
  const [playerJersey, setPlayerJersey] = useState<number>(1);
  const [playerPosition, setPlayerPosition] = useState<
    'Tekong' | 'Apit Kanan (Feeder)' | 'Apit Kiri (Killer/Striker)'
  >('Tekong');
  const [isStarter, setIsStarter] = useState(true);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamContingent, setNewTeamContingent] = useState('Kota Bandung');
  const [newTeamCategory, setNewTeamCategory] = useState(categories[0]?.id || '');
  const [newTeamManager, setNewTeamManager] = useState('');
  const [newTeamContact, setNewTeamContact] = useState('');

  const category = categories.find((c) => c.id === coachTeam?.categoryId);

  // Matches for this team
  const teamMatches = matches.filter(
    (m) => m.teamHomeId === coachTeam?.id || m.teamAwayId === coachTeam?.id
  );

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachTeam) return;

    if (!playerName || !playerNik) {
      alert('Nama pemain dan NIK/NISN wajib diisi!');
      return;
    }

    if (coachTeam.players.length >= (category?.regulation.maxPlayersPerTeam || 5)) {
      alert(
        `Regu sudah mencapai batas maksimal ${
          category?.regulation.maxPlayersPerTeam || 5
        } atlet sesuai regulasi!`
      );
      return;
    }

    addPlayer(coachTeam.id, {
      fullName: playerName,
      identityNumber: playerNik,
      birthDate: playerBirthDate,
      jerseyNumber: Number(playerJersey),
      position: playerPosition,
      isStarter,
      isVerified: false,
      documentName: `dokumen_${playerNik}.pdf`,
    });

    setPlayerName('');
    setPlayerNik('');
    setShowAddPlayerModal(false);
  };

  const handleRegisterNewTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName || !newTeamCategory) {
      alert('Nama regu dan kategori turnamen wajib dipilih!');
      return;
    }

    const teamId = registerTeam({
      categoryId: newTeamCategory,
      coachId: currentUser.id,
      name: newTeamName,
      contingent: newTeamContingent,
      coachName: currentUser.fullName,
      managerName: newTeamManager,
      contactPhone: newTeamContact,
      registrationStatus: 'SUBMITTED',
      players: [],
    });

    alert('Regu berhasil didaftarkan dan dikirim ke Admin untuk verifikasi kelayakan!');
    setNewTeamName('');
    setActiveTab('roster');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Coach Top Summary Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Portal Pelatih & Manajemen Kontingen</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">
            {coachTeam ? coachTeam.name : 'Daftarkan Tim Baru'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {coachTeam
              ? `${coachTeam.contingent} · Kategori: ${category?.name || 'U15 / U18'}`
              : 'Silakan daftarkan tim binaan Anda untuk berpartisipasi dalam kejuaraan.'}
          </p>
        </div>

        {coachTeam && (
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Status Pendaftaran</span>
              <span
                className={`font-bold uppercase ${
                  coachTeam.registrationStatus === 'APPROVED'
                    ? 'text-emerald-400'
                    : coachTeam.registrationStatus === 'REJECTED'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {coachTeam.registrationStatus}
              </span>
            </div>

            <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Slot Undian</span>
              <span className="font-mono font-bold text-amber-400">
                {coachTeam.groupSlotCode || 'Belum Diundi'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'roster'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Daftar Pemain (Roster)
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'matches'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Jadwal Pertandingan Tim ({teamMatches.length})
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'register'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          Daftar Regu Lain
        </button>
      </div>

      {/* TAB 1: ROSTER ATLET */}
      {activeTab === 'roster' && coachTeam && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Susunan Regu Resmi</h2>
              <p className="text-xs text-slate-400">
                Regulasi Sepak Takraw: Minimal 3 pemain (1 Tekong, 1 Apit Kanan, 1 Apit Kiri),
                maksimal 5 pemain dengan cadangan.
              </p>
            </div>

            <button
              onClick={() => setShowAddPlayerModal(true)}
              disabled={coachTeam.players.length >= (category?.regulation.maxPlayersPerTeam || 5)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Atlet</span>
            </button>
          </div>

          {/* Roster Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coachTeam.players.map((player) => (
              <div
                key={player.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-extrabold text-amber-400 text-base">
                      {player.jerseyNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{player.fullName}</h4>
                      <span className="text-[11px] font-semibold text-amber-400">
                        {player.position}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      player.isVerified
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {player.isVerified ? 'Terverifikasi' : 'Pending Dokumen'}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>NIK / NISN:</span>
                    <span className="font-mono text-slate-200">{player.identityNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal Lahir:</span>
                    <span className="text-slate-200">{player.birthDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Regu:</span>
                    <span className="text-white font-medium">
                      {player.isStarter ? 'Pemain Inti' : 'Pemain Cadangan'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {player.documentName ? 'Berkas Akta/NISN Ada' : 'Belum Ada Berkas'}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm(`Hapus atlet ${player.fullName} dari susunan regu?`)) {
                        deletePlayer(player.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {coachTeam.players.length === 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Belum ada atlet yang didaftarkan pada regu ini. Klik &quot;Tambah Atlet&quot; untuk
              mendaftarkan Tekong dan Apit.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JADWAL TIM */}
      {activeTab === 'matches' && coachTeam && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Jadwal & Hasil Pertandingan Regu</h2>
          <div className="space-y-3">
            {teamMatches.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                Belum ada jadwal pertandingan yang diterbitkan untuk regu ini.
              </div>
            ) : (
              teamMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-amber-400 font-bold">{m.matchCode}</span>
                      <span>·</span>
                      <span className="text-slate-300">
                        {m.scheduledDate} {m.scheduledTime} WIB
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400">{m.stage.replace('_', ' ')}</span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      {teams.find((t) => t.id === m.teamHomeId)?.name || 'Home'} vs{' '}
                      {teams.find((t) => t.id === m.teamAwayId)?.name || 'Away'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Skor Set:</div>
                      <div className="font-mono text-base font-extrabold text-amber-400">
                        {m.homeSetsWon} - {m.awaySetsWon}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.status === 'ON_GOING'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DAFTAR REGULASI / REGISTRASI REGULASI BARU */}
      {activeTab === 'register' && (
        <form
          onSubmit={handleRegisterNewTeam}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl space-y-4"
        >
          <h3 className="text-base font-bold text-white">Formulir Pendaftaran Regu Baru</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Regu / Sekolah / Klub
            </label>
            <input
              type="text"
              required
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Contoh: SMPN 10 BANDUNG"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Asal Daerah / Kontingen
            </label>
            <input
              type="text"
              required
              value={newTeamContingent}
              onChange={(e) => setNewTeamContingent(e.target.value)}
              placeholder="Kota Bandung / Purwakarta"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pilih Kategori Pertandingan
            </label>
            <select
              value={newTeamCategory}
              onChange={(e) => setNewTeamCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.gender} - {c.ageGroup})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Manajer Tim
            </label>
            <input
              type="text"
              value={newTeamManager}
              onChange={(e) => setNewTeamManager(e.target.value)}
              placeholder="Nama Manajer"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="tel"
              value={newTeamContact}
              onChange={(e) => setNewTeamContact(e.target.value)}
              placeholder="+62 81..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Kirimkan Pendaftaran Regu
          </button>
        </form>
      )}

      {/* MODAL TAMBAH ATLET */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSavePlayer}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Tambah Atlet ke Regu</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nama Lengkap Atlet
              </label>
              <input
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="misal: Rizky Pratama"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                NIK / NISN (Untuk Validasi Usia)
              </label>
              <input
                type="text"
                required
                value={playerNik}
                onChange={(e) => setPlayerNik(e.target.value)}
                placeholder="3273..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  required
                  value={playerBirthDate}
                  onChange={(e) => setPlayerBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nomor Punggung
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  required
                  value={playerJersey}
                  onChange={(e) => setPlayerJersey(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Posisi Sepak Takraw
              </label>
              <select
                value={playerPosition}
                onChange={(e) =>
                  setPlayerPosition(
                    e.target.value as 'Tekong' | 'Apit Kanan (Feeder)' | 'Apit Kiri (Killer/Striker)'
                  )
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Tekong">Tekong (Penyaji Servis Lingkaran)</option>
                <option value="Apit Kanan (Feeder)">Apit Kanan (Pengumpan / Feeder)</option>
                <option value="Apit Kiri (Killer/Striker)">
                  Apit Kiri (Smasher / Killer / Striker)
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isStarterCheck"
                checked={isStarter}
                onChange={(e) => setIsStarter(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <label htmlFor="isStarterCheck" className="text-xs text-slate-300">
                Pemain Inti (Regu Utama Lapangan)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md"
              >
                Simpan Atlet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

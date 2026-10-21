import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Match, SetScore } from '../../types';
import { DrawingManager } from './DrawingManager';
import { ScheduleManager } from './ScheduleManager';
import { RegulationSettings } from './RegulationSettings';
import { TeamVerification } from './TeamVerification';
import { CheckInManager } from './CheckInManager';
import {
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Shuffle,
  Sliders,
  Users,
  History,
  Building,
  Edit3,
  RotateCcw,
  Trash2,
  UserCheck,
  Cloud,
  RefreshCw,
  Sparkles,
  Download,
  FileText,
  Printer,
  ExternalLink,
  Award,
  Layers,
  Activity,
  Trophy,
} from 'lucide-react';
import { TournamentReportModal } from './TournamentReportModal';
import { generateTournamentPDF, computeTournamentStatistics } from '../../utils/pdfExport';

export const AdminDashboard: React.FC = () => {
  const {
    tournament,
    categories,
    teams,
    matches,
    groups,
    auditLogs,
    courts,
    verifyMatchResult,
    adminCorrectScore,
    updateTournament,
    addCourt,
    deleteCourt,
    clearAllTournamentData,
    isFirebaseConnected,
    syncAllToFirebase,
    isProductionMode,
    setIsProductionMode,
    setupOfficialPstiTournament,
  } = useTournament();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  const handleCloudSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllToFirebase();
      setSyncFeedback({ text: res.message, error: false });
    } catch (e: any) {
      setSyncFeedback({ text: e?.message || 'Gagal sinkronisasi ke Firebase', error: true });
    } finally {
      setIsSyncing(false);
    }
  };

  const [activeTab, setActiveTab] = useState<
    'verification' | 'checkin' | 'drawing' | 'schedule' | 'regulations' | 'teams' | 'audit' | 'courts' | 'reports'
  >('verification');

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [quickDownloadFeedback, setQuickDownloadFeedback] = useState<string | null>(null);
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>('ALL');

  // Correction Modal State
  const [correctingMatch, setCorrectingMatch] = useState<Match | null>(null);
  const [correctedSets, setCorrectedSets] = useState<SetScore[]>([]);
  const [correctedWinnerId, setCorrectedWinnerId] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  const handleQuickExport = (
    preset: 'FULL' | 'MATCHES' | 'PODIUM' | 'ROSTER',
    catId: string = selectedReportCategory
  ) => {
    try {
      const isFull = preset === 'FULL';
      const isMatches = preset === 'MATCHES';
      const isPodium = preset === 'PODIUM';
      const isRoster = preset === 'ROSTER';

      const catObj = catId !== 'ALL' ? categories.find((c) => c.id === catId) : undefined;
      const catSuffix = catObj ? ` - ${catObj.name}` : '';

      const title = isFull
        ? `LAPORAN RESMI LENGKAP ${tournament.name.toUpperCase()}${catSuffix}`
        : isMatches
        ? `REKAPITULASI HASIL & SKOR PERTANDINGAN${catSuffix}`
        : isPodium
        ? `BERITA ACARA & REKAPITULASI JUARA${catSuffix}`
        : `DAFTAR REGU & VERIFIKASI KEHADIRAN${catSuffix}`;

      const doc = generateTournamentPDF(
        tournament,
        categories,
        teams,
        matches,
        groups,
        courts,
        auditLogs,
        {
          includeOverview: true,
          includeStats: isFull || isPodium,
          includeStandings: isFull || isPodium,
          includeMatches: isFull || isMatches,
          includePodium: isFull || isPodium,
          includeRoster: isFull || isRoster,
          includeAuditTrail: isFull,
          includeSignatures: true,
          categoryId: catId,
          reportTitle: title,
        }
      );

      const cleanName = (tournament.name || 'Turnamen')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 25);
      const fileName = `Laporan_${preset}_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      setQuickDownloadFeedback(`File PDF "${fileName}" berhasil diunduh ke folder Downloads.`);
    } catch (err: any) {
      alert('Gagal membuat dokumen PDF: ' + (err?.message || err));
    }
  };

  // Pending verification queue
  const pendingMatches = matches.filter((m) => m.status === 'AWAITING_VERIFICATION');
  const ongoingMatches = matches.filter((m) => m.status === 'ON_GOING');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const checkedInCount = teams.filter((t) => t.checkInStatus === 'HADIR').length;

  // Total players count
  const totalPlayers = teams.reduce((acc, t) => acc + t.players.length, 0);

  const openCorrectionModal = (m: Match) => {
    setCorrectingMatch(m);
    setCorrectedSets(
      m.sets.length > 0
        ? JSON.parse(JSON.stringify(m.sets))
        : [
            { setNumber: 1, homeScore: 21, awayScore: 18, isFinished: true, winnerSide: 'HOME' },
            { setNumber: 2, homeScore: 21, awayScore: 19, isFinished: true, winnerSide: 'HOME' },
          ]
    );
    setCorrectedWinnerId(m.winnerTeamId || m.teamHomeId || '');
    setCorrectionReason('');
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingMatch) return;
    if (!correctionReason.trim()) {
      alert('Alasan koreksi skor resmi wajib diisi untuk catatan integritas dan audit trail!');
      return;
    }

    adminCorrectScore(
      correctingMatch.id,
      correctedSets,
      correctedWinnerId,
      correctionReason
    );
    alert('Koreksi hasil resmi berhasil disimpan dan dicatat ke Audit Trail!');
    setCorrectingMatch(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-900/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Dashboard Pengurus Cabang & Administrator Turnamen</span>
          </div>
          <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Penyelenggara: {tournament.organizer} · Lokasi: {tournament.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Production vs Demo Mode */}
          <button
            onClick={() => {
              const nextMode = !isProductionMode;
              if (
                confirm(
                  nextMode
                    ? 'Aktifkan Mode Produksi Resmi? Seluruh bilah simulasi dan login 1-klik akan disembunyikan untuk keperluan turnamen resmi.'
                    : 'Beralih ke Mode Uji Coba? Menu simulasi demo akan ditampilkan kembali.'
                )
              ) {
                setIsProductionMode(nextMode);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border ${
              isProductionMode
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isProductionMode ? 'Mode Resmi: AKTIF' : 'Mode Demo: AKTIF'}</span>
          </button>

          {/* Setup Official PSTI Tournament (Clean Slate) */}
          <button
            onClick={async () => {
              if (
                confirm(
                  'Siapkan Turnamen Resmi PSTI Kota Bandung 2026? Tindakan ini akan mengaktifkan Mode Produksi, mengosongkan tim & jadwal sampel, dan menyiapkan kategori resmi di GOR Lodaya.'
                )
              ) {
                setupOfficialPstiTournament();
                try {
                  await syncAllToFirebase();
                  setSyncFeedback({
                    text: 'Turnamen resmi PSTI Kota Bandung berhasil diinisialisasi dan disimpan ke Firebase Cloud!',
                    error: false,
                  });
                } catch {
                  setSyncFeedback({
                    text: 'Turnamen resmi berhasil diinisialisasi lokal.',
                    error: false,
                  });
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mulai Turnamen Resmi (Bersih)</span>
          </button>

          {/* Export PDF Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Laporan (PDF)</span>
          </button>

          {/* Sync to Cloud */}
          <button
            onClick={handleCloudSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce text-amber-300' : 'text-amber-400'}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron ke Cloud'}</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data untuk membuat turnamen baru dari awal?'
                )
              ) {
                clearAllTournamentData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Semua</span>
          </button>
        </div>
      </div>

      {quickDownloadFeedback && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-200 p-3.5 rounded-2xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{quickDownloadFeedback}</span>
          </div>
          <button
            onClick={() => setQuickDownloadFeedback(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {syncFeedback && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
            syncFeedback.error
              ? 'bg-rose-950/60 border-rose-800 text-rose-200'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback.text}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Kategori Laga</span>
          <span className="font-mono text-2xl font-black text-white mt-1 block">
            {categories.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Total Regu</span>
          <span className="font-mono text-2xl font-black text-white mt-1 block">
            {teams.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-emerald-300 block font-bold">Daftar Ulang Hadir</span>
          <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
            {checkedInCount} / {teams.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Laga Live</span>
          <span className="font-mono text-2xl font-black text-blue-400 mt-1 block">
            {ongoingMatches.length}
          </span>
        </div>

        <div className="bg-slate-900 border border-amber-500/50 bg-amber-500/5 rounded-2xl p-4 text-center relative overflow-hidden">
          <span className="text-[11px] text-amber-300 block font-bold">Menunggu Sah</span>
          <span className="font-mono text-2xl font-black text-amber-400 mt-1 block">
            {pendingMatches.length}
          </span>
          {pendingMatches.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 block font-medium">Laga Selesai</span>
          <span className="font-mono text-2xl font-black text-emerald-400 mt-1 block">
            {completedMatches.length}
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'verification'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Pengesahan & Skor ({pendingMatches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'checkin'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Daftar Ulang Peserta ({checkedInCount}/{teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drawing')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'drawing'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Pengundian Grup</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal & Wasit</span>
        </button>

        <button
          onClick={() => setActiveTab('regulations')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'regulations'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Regulasi & Aturan</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'teams'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Verifikasi Tim ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'audit'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Log Audit ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'reports'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Laporan & Statistik PDF</span>
        </button>
      </div>

      {/* TAB 1: PENGESAHAN & SKOR */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          {/* Antrean Pengesahan Wasit */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-400" />
                  <span>Antrean Lembar Skor Menunggu Pengesahan ({pendingMatches.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hasil yang disahkan akan otomatis mengupdate Klasemen Babak Grup dan memajukan bagan gugur.
                </p>
              </div>
            </div>

            {pendingMatches.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                Tidak ada pertandingan yang sedang menunggu verifikasi wasit saat ini.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMatches.map((m) => {
                  const homeTeam = teams.find((t) => t.id === m.teamHomeId);
                  const awayTeam = teams.find((t) => t.id === m.teamAwayId);
                  const cat = categories.find((c) => c.id === m.categoryId);

                  return (
                    <div
                      key={m.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {m.matchCode}
                          </span>
                          <span className="text-slate-400">
                            {cat?.name} · {m.stage.replace('_', ' ')}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-300">Wasit: {m.refereeName}</span>
                        </div>

                        <div className="text-sm font-bold text-white flex items-center gap-3">
                          <span>{homeTeam?.name || 'Home'}</span>
                          <span className="font-mono font-black text-amber-400 text-lg">
                            {m.homeSetsWon} - {m.awaySetsWon}
                          </span>
                          <span>{awayTeam?.name || 'Away'}</span>
                        </div>

                        {/* Set breakdown */}
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Rincian Set:</span>
                          {m.sets.map((s) => (
                            <span key={s.setNumber} className="bg-slate-900 px-2 py-0.5 rounded font-mono">
                              Set {s.setNumber}: {s.homeScore}-{s.awayScore}
                            </span>
                          ))}
                        </div>

                        {m.refereeNotes && (
                          <div className="text-xs text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                            <span className="text-amber-400 font-semibold">Catatan Wasit: </span>
                            {m.refereeNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (confirm(`Sahkan hasil pertandingan ${m.matchCode}?`)) {
                              verifyMatchResult(m.id, true);
                            }
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Sahkan Hasil</span>
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt('Masukkan alasan penolakan draf skor:');
                            if (reason) {
                              verifyMatchResult(m.id, false, reason);
                            }
                          }}
                          className="px-3 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabel Pertandingan Selesai & Fitur Koreksi Resmi */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Pertandingan Selesai & Disahkan (Fitur Koreksi Resmi)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap koreksi skor yang telah disahkan wajib menyertakan alasan tertulis dan tercatat di Log Audit.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-200">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Kode Laga</th>
                    <th className="py-3 px-4">Pertandingan</th>
                    <th className="py-3 px-4">Skor Set Akhir</th>
                    <th className="py-3 px-4">Pemenang Sah</th>
                    <th className="py-3 px-4">Pengesah</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {completedMatches.map((m) => {
                    const home = teams.find((t) => t.id === m.teamHomeId);
                    const away = teams.find((t) => t.id === m.teamAwayId);
                    const winner = teams.find((t) => t.id === m.winnerTeamId);

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {m.matchCode}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {home?.name} <span className="text-slate-500 font-normal">vs</span>{' '}
                          {away?.name}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {m.homeSetsWon} - {m.awaySetsWon}
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">
                          {winner?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {m.verifiedBy}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openCorrectionModal(m)}
                            className="flex items-center gap-1 mx-auto px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400" />
                            <span>Koreksi Resmi</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DAFTAR ULANG PESERTA */}
      {activeTab === 'checkin' && <CheckInManager />}

      {/* TAB 2: PENGUNDIAN GRUP */}
      {activeTab === 'drawing' && <DrawingManager />}

      {/* TAB 3: JADWAL & WASIT */}
      {activeTab === 'schedule' && <ScheduleManager />}

      {/* TAB 4: REGULASI & ATURAN */}
      {activeTab === 'regulations' && <RegulationSettings />}

      {/* TAB 5: VERIFIKASI TIM */}
      {activeTab === 'teams' && <TeamVerification />}

      {/* TAB 6: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <span>Log Jejak Audit Resmi (Audit Trail)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mencatat seluruh aksi kritis: pengundian, kunci/buka undian, pengesahan hasil, koreksi skor, dan perubahan regulasi.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Tindakan</th>
                  <th className="py-3 px-4">Entitas Terkait</th>
                  <th className="py-3 px-4">Pelaksana</th>
                  <th className="py-3 px-4">Alasan & Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-400">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{log.entityName}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.performedBy} ({log.userRole})
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      <div>{log.reason}</div>
                      {log.oldValue && (
                        <div className="text-[10px] text-rose-300 mt-0.5">
                          Lama: {log.oldValue}
                        </div>
                      )}
                      {log.newValue && (
                        <div className="text-[10px] text-emerald-300">
                          Baru: {log.newValue}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LAPORAN & STATISTIK (PDF EXPORT) */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Top Banner Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-900/40 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <FileText className="w-4 h-4" />
                <span>Pusat Laporan & Ekspor PDF Resmi Turnamen</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Dokumen & Statistik Resmi Siap Unduh (PDF)
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Hasilkan dokumen PDF berstandar PSTI untuk arsip kejuaraan, pengesahan Technical Delegate, rekapitulasi poin per set, dan laporan resmi ke KONI atau Pengurus Cabang.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Kustomisasi & Pratinjau PDF</span>
              </button>
            </div>
          </div>

          {/* Category Filter Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Filter Kategori Laporan:</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setSelectedReportCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedReportCategory === 'ALL'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white bg-slate-950'
                }`}
              >
                Semua Kategori ({categories.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedReportCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedReportCategory === c.id
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick 1-Click Export Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Master Full Report */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 transition-all group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Paling Lengkap
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                  Laporan Resmi Lengkap Turnamen (Master Report)
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Mencakup semua data: Ringkasan eksekutif, statistik turnamen, klasemen grup lengkap, hasil pertandingan dengan skor per set, kehadiran daftar ulang, audit trail, serta kolom pengesahan Technical Delegate.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Format Dokumen: A4 Multi-Halaman</span>
                <button
                  type="button"
                  onClick={() => handleQuickExport('FULL')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>

            {/* Card 2: Match Results & Scores */}
            <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 space-y-4 transition-all group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2.5 py-0.5 rounded-full border border-blue-400/20">
                  Teknis Pertandingan
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                  Rekapitulasi Hasil & Skor Pertandingan
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Laporan khusus seluruh laga dari babak grup hingga partai puncak, rincian skor tiap set (21 angka / deuce), alokasi lapangan, nama wasit pemimpin, dan status pengesahan skor meja.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Total Laga: {matches.length} Pertandingan</span>
                <button
                  type="button"
                  onClick={() => handleQuickExport('MATCHES')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>

            {/* Card 3: Podium & Berita Acara */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-4 transition-all group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Berita Acara
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                  Berita Acara & Rekapitulasi Juara (Podium)
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Dokumen penetapan resmi peraih medali Emas (Juara 1), Perak (Juara 2), dan Perunggu (Juara 3 / Bersama) per kategori lomba, dilengkapi lembar tanda tangan pengesahan resmi.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Total Kategori: {categories.length}</span>
                <button
                  type="button"
                  onClick={() => handleQuickExport('PODIUM')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>

            {/* Card 4: Team Rosters & Check-in */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition-all group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                  Verifikasi Peserta
                </span>
              </div>
              <div>
                <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                  Daftar Regu & Verifikasi Daftar Ulang (Check-in)
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Daftar lengkap seluruh tim, kontingen asal, nama ofisial, daftar atlet beserta nomor punggung & posisi (Tekong, Apit), serta stempel waktu kehadiran daftar ulang fisik.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Kehadiran: {checkedInCount} / {teams.length} Regu
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickExport('ROSTER')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Summary Tables View */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Statistik Rinci Kompilasi Data PDF</span>
              </h4>
              <span className="text-xs text-slate-400">
                Data diperbarui secara real-time dari database turnamen
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Kategori Laga</th>
                    <th className="py-2.5 px-3">Format Set & Poin</th>
                    <th className="py-2.5 px-3 text-center">Jumlah Regu</th>
                    <th className="py-2.5 px-3 text-center">Grup</th>
                    <th className="py-2.5 px-3 text-center">Laga Selesai</th>
                    <th className="py-2.5 px-3 text-right">Aksi Ekspor PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {categories.map((cat) => {
                    const catTeams = teams.filter((t) => t.categoryId === cat.id);
                    const catGroups = groups.filter((g) => g.categoryId === cat.id);
                    const catMatches = matches.filter((m) => m.categoryId === cat.id);
                    const catFinished = catMatches.filter((m) => m.status === 'COMPLETED').length;

                    return (
                      <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {cat.regulation.numberOfSets} Set ({cat.regulation.targetPointsPerSet} Poin, Deuce Max {cat.regulation.deuceMaxPoints})
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                          {catTeams.length}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {catGroups.length} Grup
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="text-emerald-400 font-bold">{catFinished}</span> / {catMatches.length}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleQuickExport('FULL', cat.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold rounded-lg text-[11px] transition-colors cursor-pointer border border-slate-700"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF Kategori</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KOREKSI HASIL RESMI */}
      {correctingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveCorrection}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <span>Koreksi Hasil Resmi Pertandingan ({correctingMatch.matchCode})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Prosedur koreksi resmi panitia. Wajib mencantumkan alasan tertulis.
              </p>
            </div>

            {/* Set scores inputs */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Koreksi Skor Tiap Set:
              </label>
              {correctedSets.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="font-bold text-amber-400 w-14">Set {s.setNumber}:</span>
                  <input
                    type="number"
                    min="0"
                    value={s.homeScore}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const copy = [...correctedSets];
                      copy[idx].homeScore = val;
                      copy[idx].winnerSide = val > copy[idx].awayScore ? 'HOME' : 'AWAY';
                      setCorrectedSets(copy);
                    }}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-mono font-bold"
                  />
                  <span className="text-slate-500 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    value={s.awayScore}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const copy = [...correctedSets];
                      copy[idx].awayScore = val;
                      copy[idx].winnerSide = copy[idx].homeScore > val ? 'HOME' : 'AWAY';
                      setCorrectedSets(copy);
                    }}
                    className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 ml-auto">
                    Menang: {s.winnerSide}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pemenang Pertandingan
              </label>
              <select
                value={correctedWinnerId}
                onChange={(e) => setCorrectedWinnerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
              >
                <option value={correctingMatch.teamHomeId}>
                  {teams.find((t) => t.id === correctingMatch.teamHomeId)?.name || 'Home'}
                </option>
                <option value={correctingMatch.teamAwayId}>
                  {teams.find((t) => t.id === correctingMatch.teamAwayId)?.name || 'Away'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alasan Resmi Koreksi (Wajib Diisi untuk Audit Log)
              </label>
              <textarea
                rows={3}
                required
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="Contoh: Kesalahan input angka set ke-2 oleh pencatat skor meja wasit, dikoreksi sesuai lembar catatan manual wasit kepala."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCorrectingMatch(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-md"
              >
                Simpan & Catat Audit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EKSPOR LAPORAN RESMI & STATISTIK TURNAMEN (PDF) */}
      <TournamentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

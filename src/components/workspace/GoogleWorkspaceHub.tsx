/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { calculateGroupStandings } from '../../utils/scoring';
import {
  signInWithGoogleWorkspace,
  getGoogleWorkspaceToken,
  disconnectWorkspace,
  createGoogleSpreadsheet,
  uploadFileToDrive,
  listDriveFiles,
  createGoogleRegistrationForm,
  sendEmailViaGmail,
} from '../../services/googleWorkspace';
import {
  FileSpreadsheet,
  HardDrive,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Send,
  Download,
  UploadCloud,
  FileCheck,
  Shield,
  Sparkles,
} from 'lucide-react';

export const GoogleWorkspaceHub: React.FC = () => {
  const { tournament, categories, courts, teams, groups, matches, users } = useTournament();
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sheets' | 'drive' | 'forms' | 'gmail'>('sheets');

  // Status & Feedback State
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; link?: string } | null>(null);

  // Drive files state
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; webViewLink: string; createdTime: string }>>([]);

  // Forms state
  const [createdFormUrl, setCreatedFormUrl] = useState<string | null>(null);

  // Gmail modal / form state
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = await getGoogleWorkspaceToken();
    setIsConnected(!!token);
    if (token) {
      loadDriveFiles();
    }
  };

  const handleConnect = async () => {
    setIsLoadingAuth(true);
    setFeedback(null);
    try {
      await signInWithGoogleWorkspace();
      setIsConnected(true);
      setFeedback({
        type: 'success',
        message: 'Berhasil terhubung ke Google Workspace! Anda sekarang dapat menggunakan Google Drive, Sheets, Forms, dan Gmail.',
      });
      loadDriveFiles();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: 'error',
        message: `Gagal menghubungkan Google Workspace: ${errorMsg}`,
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWorkspace();
    setIsConnected(false);
    setDriveFiles([]);
    setFeedback({
      type: 'success',
      message: 'Sesi Google Workspace telah diputuskan.',
    });
  };

  const loadDriveFiles = async () => {
    try {
      const files = await listDriveFiles();
      setDriveFiles(files);
    } catch (err) {
      console.error('Error loading Drive files:', err);
    }
  };

  // ==========================================
  // GOOGLE SHEETS ACTIONS
  // ==========================================
  const handleExportStandingsToSheets = async () => {
    if (!isConnected) return;
    setActionLoading('sheets-standings');
    setFeedback(null);

    try {
      const categoryName = activeCategory?.name || 'Nomor Pertandingan';
      const catGroups = groups.filter((g) => g.categoryId === activeCategory?.id);

      const headers = ['Grup', 'Peringkat', 'Regu / Tim', 'Kontingen', 'Main (M)', 'Menang (W)', 'Kalah (L)', 'Set M', 'Set K', 'Selisih Set', 'Poin Turnamen'];
      const rows: (string | number)[][] = [];

      catGroups.forEach((grp) => {
        const teamsInGrp = teams.filter((t) => grp.teamIds.includes(t.id));
        const matchesInGrp = matches.filter((m) => m.groupId === grp.id);
        const groupStandings = calculateGroupStandings(teamsInGrp, matchesInGrp, activeCategory.regulation);
        groupStandings.forEach((s, idx) => {
          rows.push([
            grp.name,
            idx + 1,
            s.teamName,
            s.contingent,
            s.played,
            s.won,
            s.lost,
            s.setsWon,
            s.setsLost,
            s.setDifference,
            s.points,
          ]);
        });
      });

      const result = await createGoogleSpreadsheet(`Klasemen ${categoryName}`, headers, rows);
      setFeedback({
        type: 'success',
        message: `Berhasil mengekspor Klasemen ke Google Sheets!`,
        link: result.spreadsheetUrl,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportRosterToSheets = async () => {
    if (!isConnected) return;
    setActionLoading('sheets-roster');
    setFeedback(null);

    try {
      const headers = ['No', 'Nama Regu', 'Kontingen Asal', 'Status Kehadiran', 'Nama Atlet', 'Nomor Punggung', 'Posisi', 'Status Verifikasi'];
      const rows: (string | number)[][] = [];

      let counter = 1;
      teams.forEach((t) => {
        if (t.players.length === 0) {
          rows.push([counter++, t.name, t.contingent, t.checkInStatus || 'BELUM_HADIR', '-', '-', '-', t.registrationStatus]);
        } else {
          t.players.forEach((p) => {
            rows.push([
              counter++,
              t.name,
              t.contingent,
              t.checkInStatus || 'BELUM_HADIR',
              p.fullName,
              p.jerseyNumber,
              p.position,
              p.isVerified ? 'TERVERIFIKASI' : 'BELUM',
            ]);
          });
        }
      });

      const result = await createGoogleSpreadsheet('Daftar Tim dan Atlet Sepak Takraw', headers, rows);
      setFeedback({
        type: 'success',
        message: 'Daftar tim dan atlet berhasil diekspor ke Google Sheets!',
        link: result.spreadsheetUrl,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportMatchesToSheets = async () => {
    if (!isConnected) return;
    setActionLoading('sheets-matches');
    setFeedback(null);

    try {
      const headers = ['Kode Pertandingan', 'Babak', 'Nomor Lomba', 'Tim Home', 'Tim Away', 'Skor Akhir (Set)', 'Status', 'Pemenang'];
      const rows = matches.map((m) => {
        const teamA = teams.find((t) => t.id === m.teamHomeId)?.name || m.teamHomePlaceholder || 'TBD';
        const teamB = teams.find((t) => t.id === m.teamAwayId)?.name || m.teamAwayPlaceholder || 'TBD';
        const catName = categories.find((c) => c.id === m.categoryId)?.name || m.categoryId;
        const winner = m.winnerTeamId ? (m.winnerTeamId === m.teamHomeId ? teamA : teamB) : '-';
        return [
          m.matchCode || m.id,
          m.stage,
          catName,
          teamA,
          teamB,
          `${m.homeSetsWon} - ${m.awaySetsWon}`,
          m.status,
          winner,
        ];
      });

      const result = await createGoogleSpreadsheet('Jadwal dan Rekap Pertandingan Takraw', headers, rows);
      setFeedback({
        type: 'success',
        message: 'Jadwal & hasil pertandingan berhasil diekspor ke Google Sheets!',
        link: result.spreadsheetUrl,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // GOOGLE DRIVE ACTIONS
  // ==========================================
  const handleBackupToDrive = async () => {
    if (!isConnected) return;
    setActionLoading('drive-backup');
    setFeedback(null);

    try {
      const fullState = {
        tournament,
        categories,
        courts,
        teams,
        groups,
        matches,
        users,
        backupTimestamp: new Date().toISOString(),
      };
      const jsonBackup = JSON.stringify(fullState, null, 2);
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Backup_PSTI_Bandung_${dateStr}.json`;

      const result = await uploadFileToDrive(filename, jsonBackup, 'application/json');
      setFeedback({
        type: 'success',
        message: `File backup turnamen (${filename}) berhasil disimpan di Google Drive Anda!`,
        link: result.webViewLink,
      });
      loadDriveFiles();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportReportToDrive = async () => {
    if (!isConnected) return;
    setActionLoading('drive-report');
    setFeedback(null);

    try {
      const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Berita Acara Turnamen Sepak Takraw PSTI</title>
        <style>
          body { font-family: sans-serif; padding: 24px; line-height: 1.6; color: #1e293b; }
          h1 { color: #d97706; margin-bottom: 4px; }
          .meta { color: #64748b; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Laporan Resmi Turnamen Sepak Takraw PSTI Kota Bandung</h1>
        <div class="meta">
          <p>Venue: Gelanggang Olahraga (GOR) Lodaya Bandung | Tanggal Cetak: ${new Date().toLocaleString('id-ID')}</p>
          <p>Total Tim: ${teams.length} | Total Pertandingan: ${matches.length} | Kategori: U15 & U18 Putra/Putri</p>
        </div>
        <h2>Daftar Tim dan Status Kehadiran</h2>
        <table>
          <tr><th>No</th><th>Nama Regu</th><th>Kontingen Asal</th><th>Status Registrasi</th><th>Kehadiran</th></tr>
          ${teams
            .map(
              (t, i) =>
                `<tr><td>${i + 1}</td><td>${t.name}</td><td>${t.contingent}</td><td>${t.registrationStatus}</td><td>${t.checkInStatus || 'BELUM_HADIR'}</td></tr>`
            )
            .join('')}
        </table>
      </body>
      </html>
      `;

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `Berita_Acara_PSTI_${dateStr}.html`;

      const result = await uploadFileToDrive(filename, reportHtml, 'text/html');
      setFeedback({
        type: 'success',
        message: `Laporan resmi turnamen berhasil diunggah ke Google Drive!`,
        link: result.webViewLink,
      });
      loadDriveFiles();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // GOOGLE FORMS ACTIONS
  // ==========================================
  const handleCreateForm = async () => {
    if (!isConnected) return;
    setActionLoading('forms-create');
    setFeedback(null);

    try {
      const result = await createGoogleRegistrationForm('Kejuaraan Sepak Takraw PSTI Kota Bandung 2026');
      setCreatedFormUrl(result.responderUri);
      setFeedback({
        type: 'success',
        message: 'Google Form pendaftaran resmi berhasil dibuat dengan kolom nama tim, kontingen, kontak pelatih, dan nomor kategori!',
        link: result.responderUri,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  // ==========================================
  // GMAIL ACTIONS (With Explicit User Confirmation)
  // ==========================================
  const prepareScheduleNotification = () => {
    const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED' || m.status === 'READY').slice(0, 5);
    const scheduleSummary = upcomingMatches
      .map((m) => {
        const teamA = teams.find((t) => t.id === m.teamHomeId)?.name || m.teamHomePlaceholder || 'TBD';
        const teamB = teams.find((t) => t.id === m.teamAwayId)?.name || m.teamAwayPlaceholder || 'TBD';
        const courtName = courts.find((c) => c.id === m.courtId)?.name || 'Lapangan 1';
        return `• [${m.matchCode || 'Match'}] ${teamA} vs ${teamB} (${courtName} - Pukul ${m.scheduledTime || '09:00 WIB'})`;
      })
      .join('\n');

    setEmailTo('official.pstibdg@gmail.com');
    setEmailSubject('[PSTI Bandung] Jadwal dan Panggilan Pertandingan Sepak Takraw');
    setEmailBody(
      `Yth. Pelatih, Manajer Tim, dan Wasit Pertandingan,\n\nBerikut adalah jadwal pertandingan sepak takraw yang akan segera berlangsung di GOR Lodaya Bandung:\n\n${scheduleSummary}\n\nHarap seluruh atlet dan ofisial berada di ruang pemanasan 15 menit sebelum panggilan servis pertama.\n\nSalam Olahraga,\nPanitia Pelaksana PSTI Kota Bandung`
    );
    setEmailModalOpen(true);
  };

  const prepareResultAnnouncement = () => {
    const completedMatches = matches.filter((m) => m.status === 'COMPLETED').slice(-5);
    const resultSummary = completedMatches
      .map((m) => {
        const teamA = teams.find((t) => t.id === m.teamHomeId)?.name || 'TBD';
        const teamB = teams.find((t) => t.id === m.teamAwayId)?.name || 'TBD';
        return `• ${teamA} [${m.homeSetsWon} - ${m.awaySetsWon}] ${teamB}`;
      })
      .join('\n');

    setEmailTo('official.pstibdg@gmail.com');
    setEmailSubject('[PSTI Bandung] Pengesahan Hasil dan Skor Pertandingan Takraw');
    setEmailBody(
      `Yth. Tim Manajer dan Dewan Hakim Turnamen,\n\nBerikut adalah ringkasan hasil skor pertandingan yang telah selesai dan disahkan oleh Wasit Utama:\n\n${resultSummary}\n\nData klasemen terkini dapat dicek langsung melalui portal resmi PSTI Scoring Hub.\n\nTerima kasih atas sportivitas seluruh atlet dan ofisial.\n\nPanitia Pertandingan PSTI Kota Bandung`
    );
    setEmailModalOpen(true);
  };

  const handleSendEmailConfirmed = async () => {
    if (!emailTo || !emailSubject || !emailBody) {
      alert('Mohon lengkapi alamat penerima, subjek, dan pesan email.');
      return;
    }

    setActionLoading('gmail-send');
    setFeedback(null);
    try {
      await sendEmailViaGmail({
        to: emailTo,
        subject: emailSubject,
        bodyText: emailBody,
      });
      setEmailModalOpen(false);
      setFeedback({
        type: 'success',
        message: `Email berhasil dikirimkan via akun Gmail Anda ke: ${emailTo}`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Google Workspace Integration Hub
              </span>
              <span className="text-xs text-slate-400">OAuth 2.0 Live Cloud Sync</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Pusat Integrasi Google Cloud & Workspace
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Sinkronkan data turnamen sepak takraw secara real-time dengan Google Drive, Google Sheets,
              Google Forms pendaftaran, dan pengiriman notifikasi via Gmail.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Google Terhubung</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                >
                  Putuskan
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isLoadingAuth}
                className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoadingAuth ? 'Menghubungkan...' : 'Hubungkan Akun Google'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-semibold">{feedback.message}</p>
            {feedback.link && (
              <a
                href={feedback.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold underline hover:opacity-80"
              >
                <span>Buka Dokumen Google Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Category selector for Sheet operations */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <span className="font-semibold text-slate-300">Pilih Kategori untuk Operasi Dokumen:</span>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeCategory?.id === c.id
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Selection Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sheets'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets</span>
        </button>

        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'drive'
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'forms'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Google Forms</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gmail'
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail Notifikasi</span>
        </button>
      </div>

      {/* TAB CONTENT 1: GOOGLE SHEETS */}
      {activeTab === 'sheets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-base">Ekspor Klasemen & Poin Grup</h3>
              <p className="text-xs text-slate-400 mt-1">
                Membuat Google Spreadsheet baru berisi tabel peringkat grup, poin kemenangan, selisih set, dan rasio angka.
              </p>
            </div>
            <button
              onClick={handleExportStandingsToSheets}
              disabled={!isConnected || actionLoading === 'sheets-standings'}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{actionLoading === 'sheets-standings' ? 'Mengekspor...' : 'Ekspor ke Google Sheet'}</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-base">Ekspor Roster Tim & Atlet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Daftar lengkap seluruh tim, nama atlet, nomor punggung, posisi (Tekong/Feeder/Killer), dan status kehadiran daftar ulang.
              </p>
            </div>
            <button
              onClick={handleExportRosterToSheets}
              disabled={!isConnected || actionLoading === 'sheets-roster'}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{actionLoading === 'sheets-roster' ? 'Mengekspor...' : 'Ekspor Roster ke Sheet'}</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-base">Ekspor Jadwal & Hasil Pertandingan</h3>
              <p className="text-xs text-slate-400 mt-1">
                Rekapitulasi nomor pertandingan, babak, skor akhir per set, dan status pengesahan wasit untuk laporan panitia.
              </p>
            </div>
            <button
              onClick={handleExportMatchesToSheets}
              disabled={!isConnected || actionLoading === 'sheets-matches'}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{actionLoading === 'sheets-matches' ? 'Mengekspor...' : 'Ekspor Jadwal ke Sheet'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GOOGLE DRIVE */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
                  <HardDrive className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-base">Backup Database Turnamen (.json)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Amankan seluruh data turnamen (tim, atlet, pertandingan, skor real-time) langsung ke root Google Drive Anda.
                </p>
              </div>
              <button
                onClick={handleBackupToDrive}
                disabled={!isConnected || actionLoading === 'drive-backup'}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{actionLoading === 'drive-backup' ? 'Menyimpan ke Drive...' : 'Simpan Backup ke Google Drive'}</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-bold text-white text-base">Unggah Berita Acara Pertandingan (.html)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Arsipkan dokumen pengesahan hasil turnamen dan berita acara pertandingan resmi ke Google Drive.
                </p>
              </div>
              <button
                onClick={handleExportReportToDrive}
                disabled={!isConnected || actionLoading === 'drive-report'}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{actionLoading === 'drive-report' ? 'Mengunggah...' : 'Unggah Berita Acara ke Drive'}</span>
              </button>
            </div>
          </div>

          {/* Drive Files List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span>Berkas Turnamen Terkait di Google Drive Anda</span>
              </h3>
              <button
                onClick={loadDriveFiles}
                disabled={!isConnected}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan</span>
              </button>
            </div>

            {driveFiles.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {isConnected
                  ? 'Belum ada berkas backup yang disimpan ke Google Drive dari sesi ini.'
                  : 'Hubungkan akun Google Anda untuk melihat dan mengelola berkas Drive.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {driveFiles.map((file) => (
                  <div key={file.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-medium text-white block">{file.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(file.createdTime).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        <span>Buka</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: GOOGLE FORMS */}
      {activeTab === 'forms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Formulir Pendaftaran Tim & Atlet via Google Forms</h3>
            <p className="text-xs text-slate-300 mt-1">
              Buat Google Form resmi dengan 1-klik untuk disebarkan kepada manajer atau pelatih klub sepak takraw.
              Formulir langsung dikonfigurasi dengan pertanyaan nama regu, kontingen, nomor kategori (U15 Putra/Putri, U18 Putra/Putri), dan kontak WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateForm}
              disabled={!isConnected || actionLoading === 'forms-create'}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{actionLoading === 'forms-create' ? 'Membuat Google Form...' : 'Buat Google Form Pendaftaran Baru'}</span>
            </button>

            {createdFormUrl && (
              <a
                href={createdFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 transition-colors"
              >
                <span>Buka Formulir Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Alur Pendaftaran Terintegrasi:</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300">
              <li>Panitia menekan tombol "Buat Google Form Pendaftaran Baru".</li>
              <li>Tautan formulir Google disebarkan ke grup WhatsApp pelatih & manajer kontingen.</li>
              <li>Respon pendaftaran dapat langsung ditinjau dan disinkronkan ke dalam sistem turnamen PSTI ini.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: GMAIL NOTIFICATIONS */}
      {activeTab === 'gmail' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-white text-base">Kirim Notifikasi Jadwal Pertandingan</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kirimkan surat elektronik rekap panggilan lapangan dan jam tanding kepada manajer tim serta wasit.
                </p>
              </div>
              <button
                onClick={prepareScheduleNotification}
                disabled={!isConnected}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Susun Notifikasi Jadwal Gmail</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-bold text-white text-base">Kirim Berita Acara & Skor Sah</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Umumkan ringkasan hasil skor pertandingan yang telah diverifikasi resmi oleh dewan wasit turnamen.
                </p>
              </div>
              <button
                onClick={prepareResultAnnouncement}
                disabled={!isConnected}
                className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Susun Pengumuman Skor Gmail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gmail Modal with Mandatory Explicit User Confirmation */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Konfirmasi Pengiriman Email via Gmail</h3>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tujuan Email (To):</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Subjek:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Isi Pesan:</label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              {/* Explicit User Confirmation requirement check */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>
                  Sesuai kebijakan Google Workspace, pengiriman email ini akan menggunakan akun Gmail Anda langsung kepada penerima di atas.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSendEmailConfirmed}
                disabled={actionLoading === 'gmail-send'}
                className="flex items-center gap-1.5 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{actionLoading === 'gmail-send' ? 'Mengirim...' : 'Kirim Email Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

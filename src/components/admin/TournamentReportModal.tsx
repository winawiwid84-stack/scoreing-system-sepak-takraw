import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  generateTournamentPDF,
  computeTournamentStatistics,
  ExportReportOptions,
} from '../../utils/pdfExport';
import {
  FileText,
  Download,
  Printer,
  ExternalLink,
  CheckCircle2,
  X,
  FileCheck,
  Trophy,
  Users,
  Calendar,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TournamentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TournamentReportModal: React.FC<TournamentReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    tournament,
    categories,
    teams,
    matches,
    groups,
    courts,
    auditLogs,
  } = useTournament();

  const stats = computeTournamentStatistics(categories, teams, matches, courts);

  const [options, setOptions] = useState<ExportReportOptions>({
    includeOverview: true,
    includeStats: true,
    includeStandings: true,
    includeMatches: true,
    includePodium: true,
    includeRoster: true,
    includeAuditTrail: false,
    includeSignatures: true,
    categoryId: 'ALL',
    reportTitle: `LAPORAN RESMI ${tournament.name.toUpperCase()}`,
    notes: '',
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset Configurations
  const applyPreset = (preset: 'FULL' | 'MATCHES' | 'PODIUM' | 'ROSTER') => {
    switch (preset) {
      case 'FULL':
        setOptions({
          ...options,
          includeOverview: true,
          includeStats: true,
          includeStandings: true,
          includeMatches: true,
          includePodium: true,
          includeRoster: true,
          includeAuditTrail: true,
          includeSignatures: true,
          reportTitle: `LAPORAN RESMI LENGKAP ${tournament.name.toUpperCase()}`,
        });
        break;
      case 'MATCHES':
        setOptions({
          ...options,
          includeOverview: true,
          includeStats: true,
          includeStandings: true,
          includeMatches: true,
          includePodium: false,
          includeRoster: false,
          includeAuditTrail: false,
          includeSignatures: true,
          reportTitle: `REKAPITULASI HASIL & SKOR PERTANDINGAN - ${tournament.name.toUpperCase()}`,
        });
        break;
      case 'PODIUM':
        setOptions({
          ...options,
          includeOverview: true,
          includeStats: true,
          includeStandings: true,
          includeMatches: false,
          includePodium: true,
          includeRoster: false,
          includeAuditTrail: false,
          includeSignatures: true,
          reportTitle: `BERITA ACARA & REKAPITULASI JUARA RESMI - ${tournament.name.toUpperCase()}`,
        });
        break;
      case 'ROSTER':
        setOptions({
          ...options,
          includeOverview: true,
          includeStats: true,
          includeStandings: false,
          includeMatches: false,
          includePodium: false,
          includeRoster: true,
          includeAuditTrail: false,
          includeSignatures: true,
          reportTitle: `DAFTAR REGU & VERIFIKASI DAFTAR ULANG - ${tournament.name.toUpperCase()}`,
        });
        break;
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setDownloadSuccess(null);
    try {
      const doc = generateTournamentPDF(
        tournament,
        categories,
        teams,
        matches,
        groups,
        courts,
        auditLogs,
        options
      );

      const cleanName = (tournament.name || 'Turnamen')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 30);
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Laporan_Sepak_Takraw_${cleanName}_${timestamp}.pdf`;

      doc.save(fileName);
      setDownloadSuccess(`File PDF "${fileName}" berhasil diunduh ke perangkat Anda.`);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      alert('Terjadi kesalahan saat membuat dokumen PDF: ' + (err?.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPDF = () => {
    try {
      const doc = generateTournamentPDF(
        tournament,
        categories,
        teams,
        matches,
        groups,
        courts,
        auditLogs,
        options
      );
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to preview PDF:', err);
      alert('Terjadi kesalahan saat membuka pratinjau PDF: ' + (err?.message || err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 border-b border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                Fitur Ekspor Resmi Panitia
              </span>
              <span className="text-[11px] text-slate-400">PDF Generator v2.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Ekspor Laporan & Statistik Turnamen (PDF)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Buat dokumen PDF resmi siap cetak berisi data lengkap turnamen, rekap skor per set, klasemen grup, daftar ulang regu, dan lembar pengesahan Technical Delegate.
            </p>
          </div>
        </div>

        {/* Live Metrics Overview */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Data Statistik Saat Ini yang Akan Diekspor</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-center">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Kategori</span>
              <span className="font-mono text-base font-bold text-white">{stats.totalCategories}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Regu Terdaftar</span>
              <span className="font-mono text-base font-bold text-amber-400">{stats.totalTeams}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Daftar Ulang</span>
              <span className="font-mono text-base font-bold text-emerald-400">{stats.checkedInTeams}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Total Atlet</span>
              <span className="font-mono text-base font-bold text-white">{stats.totalPlayers}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Laga Selesai</span>
              <span className="font-mono text-base font-bold text-blue-400">{stats.completedMatches}/{stats.totalMatches}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block">Total Set</span>
              <span className="font-mono text-base font-bold text-amber-300">{stats.totalSetsPlayed}</span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilihan Template Laporan Cepat (Presets):</span>
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('FULL')}
              className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-white group-hover:text-amber-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Laporan Lengkap</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Semua data & statistik resmi</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('MATCHES')}
              className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-white group-hover:text-blue-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Hasil & Skor</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Jadwal, skor set & wasit</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('PODIUM')}
              className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-white group-hover:text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Berita Acara Juara</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Podium & klasemen akhir</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('ROSTER')}
              className="px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-white group-hover:text-emerald-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Roster & Kehadiran</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Daftar ulang & atlet tim</div>
            </button>
          </div>
        </div>

        {/* Customization Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scope & Title */}
          <div className="space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Cakupan & Judul Laporan</span>
            </h4>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Kategori Pertandingan:
              </label>
              <select
                value={options.categoryId || 'ALL'}
                onChange={(e) => setOptions({ ...options, categoryId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Semua Kategori ({categories.length} Kategori)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Judul Dokumen Resmi:
              </label>
              <input
                type="text"
                value={options.reportTitle || ''}
                onChange={(e) => setOptions({ ...options, reportTitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="Judul laporan pada dokumen PDF"
              />
            </div>
          </div>

          {/* Section Toggles */}
          <div className="space-y-3 bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bagian / Bab Dokumen yang Disertakan</span>
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includeStats}
                  onChange={(e) => setOptions({ ...options, includeStats: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Ringkasan Eksekutif & Statistik Turnamen (KPI)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includePodium}
                  onChange={(e) => setOptions({ ...options, includePodium: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Rekapitulasi Juara & Penetapan Podium (Emas/Perak/Perunggu)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includeStandings}
                  onChange={(e) => setOptions({ ...options, includeStandings: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Klasemen Babak Grup & Indikator Lolos Sistem Gugur</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includeMatches}
                  onChange={(e) => setOptions({ ...options, includeMatches: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Rekapitulasi Hasil Pertandingan Lengkap & Skor Per Set</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includeRoster}
                  onChange={(e) => setOptions({ ...options, includeRoster: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Daftar Regu, Atlet, & Verifikasi Kehadiran Daftar Ulang</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includeAuditTrail}
                  onChange={(e) => setOptions({ ...options, includeAuditTrail: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Catatan Log Integritas & Audit Trail Pengesahan Wasit</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={options.includeSignatures}
                  onChange={(e) => setOptions({ ...options, includeSignatures: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Lembar Pengesahan Resmi (Ketua Panpel, TD PSTI, Koord. Wasit)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {downloadSuccess && (
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
            <button
              onClick={() => setDownloadSuccess(null)}
              className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Format A4 Resmi PSTI · Dokumen Berpenomoran Halaman Otomatis</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePreviewPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Pratinjau PDF</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
              <span>{isGenerating ? 'Membuat PDF...' : 'Unduh Laporan PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Trophy,
  Sliders,
  Users,
  Shuffle,
  Calendar,
  ClipboardCheck,
  Award,
  ArrowRight,
} from 'lucide-react';

interface AdminGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminGuideModal: React.FC<AdminGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Inisialisasi Turnamen & Aturan Regulasi',
      icon: Sliders,
      desc: 'Tentukan identitas kejuaraan dan parameter teknis pertandingan yang fleksibel.',
      actions: [
        'Atur Nama, Lokasi, dan Tanggal Turnamen di Panel Admin.',
        'Buat Kategori (contoh: Inter Regu U15 Putra/Putri, U18 Putra/Putri).',
        'Sesuaikan Regulasi: Target skor per set (default 21 poin), aturan Deuce (batas cap 25), jumlah set (Best of 3), dan format Perebutan Juara 3 (Tanding vs Juara 3 Bersama).',
        'Tentukan urutan kriteria Tie-Breaker klasemen (Poin -> Head-to-Head -> Selisih Set -> Selisih Poin).',
      ],
      targetTab: 'admin',
    },
    {
      step: 2,
      title: 'Verifikasi Berkas Tim & Atlet',
      icon: Users,
      desc: 'Validasi kepatuhan kuota pemain dan batasan usia peserta.',
      actions: [
        'Buka tab "Verifikasi Tim" di Panel Admin.',
        'Periksa kelengkapan 3 pemain inti (Tekong, Apit Kanan, Apit Kiri) dan maksimal 2 cadangan.',
        'Verifikasi NIK/NISN atau dokumen akta lahir untuk kategori usia U15 & U18 (Putra/Putri).',
        'Ubah status pendaftaran dari SUBMITTED menjadi APPROVED (atau tolak dengan catatan perbaikan).',
        'Gunakan menu "Daftar Ulang Peserta" pada saat kedatangan tim di lokasi GOR untuk mencatat kehadiran fisik pelatih, atlet, dan seragam.',
      ],
      targetTab: 'admin',
    },
    {
      step: 3,
      title: 'Pengundian Grup Terbuka (Drawing Pool)',
      icon: Shuffle,
      desc: 'Bagi tim yang telah lolos verifikasi ke dalam grup secara transparan dan terukur.',
      actions: [
        'Pilih kategori yang akan diundi.',
        'Jalankan "Pengundian Acak Terbuka" dengan animasi transparan atau atur penempatan slot manual (A1, A2, B1, dst.).',
        'Periksa distribusi tim di setiap pool.',
        'Klik "Kunci & Publikasikan Undian" — sistem otomatis mencatat timestamp dan admin penanggung jawab ke dalam Audit Trail.',
      ],
      targetTab: 'admin',
    },
    {
      step: 4,
      title: 'Penyusunan Jadwal & Penugasan Wasit',
      icon: Calendar,
      desc: 'Petakan jadwal laga babak grup dan tugaskan wasit berlisensi.',
      actions: [
        'Gunakan tombol "Buat Jadwal Round-Robin Otomatis" untuk memasangkan setiap tim dalam grup.',
        'Sistem mendeteksi dan mencegah bentrok lapangan serta bentrok jam bermain tim yang sama.',
        'Pilih nama wasit berlisensi untuk setiap partai pertandingan.',
      ],
      targetTab: 'admin',
    },
    {
      step: 5,
      title: 'Pencatatan Skor & Pengesahan Hasil',
      icon: ClipboardCheck,
      desc: 'Wasit menginput skor di lapangan, Admin mengesahkan secara resmi.',
      actions: [
        'Wasit membuka meja digital scoreboard di HP/Tablet (/wasit) dan mencatat skor poin, rotasi servis Tekong (tiap 3 poin), dan pemenang set.',
        'Setelah laga tuntas, wasit mengirim draf hasil ke panitia.',
        'Admin memeriksa lembar skor pada antrean verifikasi dan menekan "Sahkan Hasil".',
        'Hasil yang SAH otomatis memutakhirkan Klasemen Grup dan memajukan pemenang di Bagan Gugur (Bracket Auto-Advance).',
        'Jika ada kesalahan, admin menggunakan prosedur "Koreksi Resmi" yang wajib menyertakan alasan tertulis di Audit Log.',
      ],
      targetTab: 'admin',
    },
    {
      step: 6,
      title: 'Penetapan Juara & Cetak Berita Acara',
      icon: Award,
      desc: 'Penerbitan daftar juara resmi dan rekapitulasi hasil turnamen.',
      actions: [
        'Setelah babak Final dan Perebutan Juara 3 disahkan, buka menu "Daftar Juara".',
        'Sistem otomatis menampilkan Juara 1 (Emas), Juara 2 (Perak), dan Juara 3 (Perunggu).',
        'Gunakan tombol "Unduh PDF" atau buka tab "Laporan & Statistik PDF" di Panel Admin untuk mengekspor dokumen PDF master resmi lengkap dengan statistik, rekap skor per set, klasemen grup, dan lembar pengesahan Technical Delegate PSTI.',
      ],
      targetTab: 'podium',
    },
  ];

  const currentStepData = steps[activeStep - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Panduan Operasional Turnamen Sepak Takraw
              </h2>
              <p className="text-xs text-slate-400">
                Alur Kerja Pengurus Cabang: Dari Inisialisasi hingga Penetapan Juara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Selector Horizontal */}
        <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5 overflow-x-auto text-xs">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCurrent = s.step === activeStep;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] tracking-tight whitespace-nowrap">Tahap {s.step}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-lg border border-amber-500/30">
              0{currentStepData.step}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{currentStepData.title}</h3>
              <p className="text-sm text-slate-300 mt-1">{currentStepData.desc}</p>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Daftar Tindakan Utama (Checklist Operasional):
            </h4>
            <div className="space-y-2.5">
              {currentStepData.actions.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Sepak Takraw ISTAF */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">Catatan Regulasi Penting:</strong>
            Semua parameter nilai dalam aplikasi ini (poin set 21 atau 15, jumlah grup, tie-breaker, perebutan juara 3) bersifat dinamis diatur melalui menu Pengaturan Regulasi, sehingga dapat diterapkan baik untuk regulasi ISTAF 2024 terbaru maupun ketentuan khusus panitia daerah.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Kembali
              </button>
            )}
            {activeStep < steps.length && (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-3 py-1.5 text-xs text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Selanjutnya (Tahap {activeStep + 1})
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onNavigateTab(currentStepData.targetTab);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-md"
          >
            <span>Buka Modul Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

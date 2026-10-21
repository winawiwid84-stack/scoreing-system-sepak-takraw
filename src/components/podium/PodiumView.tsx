import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Trophy, Award, Printer, Medal, CheckCircle2, FileText, Download } from 'lucide-react';
import { generateTournamentPDF } from '../../utils/pdfExport';

export const PodiumView: React.FC = () => {
  const { tournament, categories, teams, matches, groups, courts, auditLogs } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  // Determine winners from final match
  const finalMatch = matches.find(
    (m) => m.categoryId === activeCategory?.id && m.stage === 'FINAL'
  );
  const bronzeMatch = matches.find(
    (m) => m.categoryId === activeCategory?.id && m.stage === 'BRONZE_FINAL'
  );

  const goldTeam = teams.find((t) => t.id === finalMatch?.winnerTeamId);
  const silverTeam = teams.find((t) => {
    if (!finalMatch || !finalMatch.winnerTeamId) return false;
    const runnerUpId =
      finalMatch.winnerTeamId === finalMatch.teamHomeId
        ? finalMatch.teamAwayId
        : finalMatch.teamHomeId;
    return t.id === runnerUpId;
  });

  const bronzeTeam = teams.find((t) => t.id === bronzeMatch?.winnerTeamId);

  // If bronze format is SHARED (Juara 3 Bersama), find losers of semifinals
  const sfMatches = matches.filter(
    (m) => m.categoryId === activeCategory?.id && m.stage === 'SEMI_FINAL'
  );
  const sharedBronzeTeams: typeof teams = [];
  if (activeCategory?.regulation.bronzeMatchFormat === 'SHARED') {
    sfMatches.forEach((sf) => {
      if (sf.winnerTeamId) {
        const loserId =
          sf.winnerTeamId === sf.teamHomeId ? sf.teamAwayId : sf.teamHomeId;
        const found = teams.find((t) => t.id === loserId);
        if (found) sharedBronzeTeams.push(found);
      }
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPodiumPDF = () => {
    try {
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
          includeStats: true,
          includeStandings: true,
          includeMatches: false,
          includePodium: true,
          includeRoster: false,
          includeAuditTrail: false,
          includeSignatures: true,
          categoryId: activeCategory?.id,
          reportTitle: `BERITA ACARA PENETAPAN JUARA & PODIUM - ${activeCategory?.name.toUpperCase()}`,
        }
      );
      const catSlug = (activeCategory?.name || 'Kategori').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Berita_Acara_Juara_${catSlug}.pdf`);
    } catch (e: any) {
      alert('Gagal membuat dokumen PDF: ' + (e?.message || e));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header and Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Podium & Rekapitulasi Juara Resmi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Penetapan juara turnamen sepak takraw berdasarkan hasil pertandingan babak final yang telah disahkan.
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            onClick={handleDownloadPodiumPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {/* Visual Podium Showcase */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            HASIL RESMI BABAK PUNCAK
          </span>
          <h2 className="text-2xl font-black text-white">{activeCategory?.name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {tournament.name} · {tournament.location}
          </p>
        </div>

        {/* 3 Pillars of Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-4">
          {/* Juara 2 (Perak - Kiri) */}
          <div className="flex flex-col items-center order-2 md:order-1">
            <div className="w-14 h-14 rounded-full bg-slate-300/20 border-2 border-slate-400 flex items-center justify-center text-slate-200 font-bold mb-3 shadow-lg">
              <Medal className="w-7 h-7 text-slate-300" />
            </div>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 text-center w-full min-h-[170px] flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  JUARA 2 (MEDALI PERAK)
                </span>
                <h3 className="font-extrabold text-white text-base mt-2">
                  {silverTeam ? silverTeam.name : 'Dalam Babak Final'}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {silverTeam?.contingent || '-'}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                Pelatih: {silverTeam?.coachName || '-'}
              </div>
            </div>
            <div className="w-full h-12 bg-slate-800 rounded-b-xl border-t border-slate-700 flex items-center justify-center font-mono font-bold text-slate-300 text-lg">
              2nd
            </div>
          </div>

          {/* Juara 1 (Emas - Tengah, Lebih Tinggi) */}
          <div className="flex flex-col items-center order-1 md:order-2 -mt-4">
            <div className="w-18 h-18 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-bold mb-3 shadow-xl ring-4 ring-amber-500/10">
              <Trophy className="w-9 h-9 text-amber-400" />
            </div>

            <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 text-center w-full min-h-[200px] flex flex-col justify-between shadow-2xl relative">
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>

              <div>
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  JUARA 1 (MEDALI EMAS)
                </span>
                <h3 className="font-black text-white text-lg mt-2 leading-tight">
                  {goldTeam ? goldTeam.name : 'Dalam Pertandingan'}
                </h3>
                <span className="text-xs text-amber-200/80 font-medium block mt-1">
                  {goldTeam?.contingent || '-'}
                </span>
              </div>

              <div className="text-xs text-slate-300 pt-3 border-t border-amber-500/20">
                <span className="text-slate-400">Manajer / Pelatih: </span>
                <span className="font-semibold text-white">
                  {goldTeam?.coachName || goldTeam?.managerName || '-'}
                </span>
              </div>
            </div>
            <div className="w-full h-20 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-xl flex items-center justify-center font-mono font-black text-slate-950 text-2xl shadow-lg">
              1st CHAMPION
            </div>
          </div>

          {/* Juara 3 (Perunggu - Kanan) */}
          <div className="flex flex-col items-center order-3">
            <div className="w-14 h-14 rounded-full bg-amber-800/30 border-2 border-amber-700 flex items-center justify-center text-amber-500 font-bold mb-3 shadow-lg">
              <Award className="w-7 h-7 text-amber-600" />
            </div>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 text-center w-full min-h-[170px] flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                  JUARA 3 ({activeCategory?.regulation.bronzeMatchFormat === 'SHARED' ? 'BERSAMA' : 'PERUNGGU'})
                </span>
                <h3 className="font-extrabold text-white text-base mt-2">
                  {bronzeTeam
                    ? bronzeTeam.name
                    : sharedBronzeTeams.length > 0
                    ? sharedBronzeTeams.map((t) => t.name).join(' & ')
                    : 'Dalam Perebutan'}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {bronzeTeam?.contingent || '-'}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                Format: {activeCategory?.regulation.bronzeMatchFormat === 'SHARED' ? 'Juara 3 Bersama' : 'Pertandingan Perebutan'}
              </div>
            </div>
            <div className="w-full h-10 bg-amber-900/60 rounded-b-xl border-t border-amber-800 flex items-center justify-center font-mono font-bold text-amber-200 text-lg">
              3rd
            </div>
          </div>
        </div>
      </div>

      {/* Official Printable Certificate & Result Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <FileText className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Berita Acara & Penetapan Hasil Kejuaraan
            </h3>
            <p className="text-xs text-slate-400">
              Dokumen rekapitulasi sah hasil turnamen Sepak Takraw PSTI.
            </p>
          </div>
        </div>

        {/* Official Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Nama Tim / Kontingen</th>
                <th className="py-3 px-4">Pelatih / Manajer</th>
                <th className="py-3 px-4">Daftar Atlet Peraih Medali</th>
                <th className="py-3 px-4 text-center">Status Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              <tr>
                <td className="py-4 px-4 font-bold text-amber-400">Juara 1 (Emas)</td>
                <td className="py-4 px-4">
                  <div className="font-bold text-white text-sm">
                    {goldTeam ? goldTeam.name : 'SDN 163 BUAHBATU BARU (Provisional)'}
                  </div>
                  <div className="text-slate-400 text-[11px]">{goldTeam?.contingent || 'Kota Bandung'}</div>
                </td>
                <td className="py-4 px-4 text-slate-300">
                  {goldTeam?.coachName || 'Ahmad Fauzi'} / {goldTeam?.managerName || 'Dra. Eni Nuraeni'}
                </td>
                <td className="py-4 px-4 text-slate-300">
                  {goldTeam?.players.length
                    ? goldTeam.players.map((p) => `${p.fullName} (${p.position})`).join(', ')
                    : 'Rizky Pratama (Tekong), Dimas Aditya (Apit Kanan), Farhan Maulana (Apit Kiri)'}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded">
                    Sah Resmi
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-slate-300">Juara 2 (Perak)</td>
                <td className="py-4 px-4">
                  <div className="font-bold text-white text-sm">
                    {silverTeam ? silverTeam.name : 'SDN 164 KARANG PAWULANG'}
                  </div>
                  <div className="text-slate-400 text-[11px]">{silverTeam?.contingent || 'Kota Bandung'}</div>
                </td>
                <td className="py-4 px-4 text-slate-300">{silverTeam?.coachName || 'Dedi Kusnadi'}</td>
                <td className="py-4 px-4 text-slate-300">
                  {silverTeam?.players.length
                    ? silverTeam.players.map((p) => `${p.fullName} (${p.position})`).join(', ')
                    : 'Susunan Regu Terverifikasi'}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded">
                    Sah Resmi
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-bold text-amber-600">Juara 3 (Perunggu)</td>
                <td className="py-4 px-4">
                  <div className="font-bold text-white text-sm">
                    {bronzeTeam ? bronzeTeam.name : 'SDN 115 TURANGGA'}
                  </div>
                  <div className="text-slate-400 text-[11px]">{bronzeTeam?.contingent || 'Kota Bandung'}</div>
                </td>
                <td className="py-4 px-4 text-slate-300">{bronzeTeam?.coachName || 'Bambang Supeno'}</td>
                <td className="py-4 px-4 text-slate-300">
                  {bronzeTeam?.players.length
                    ? bronzeTeam.players.map((p) => `${p.fullName} (${p.position})`).join(', ')
                    : 'Bagas Prasetyo, M. Hafiz, Aldi Taher'}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded">
                    Sah Resmi
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures for Print */}
        <div className="pt-8 border-t border-slate-800 flex justify-between text-xs text-slate-400">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold text-white mt-1">Ketua Dewan Wasit PSTI</p>
            <div className="h-16"></div>
            <p className="underline text-slate-200">Hendra Wijaya, S.Pd</p>
            <p className="text-[10px]">Lisensi Nasional No. PSTI-WAS-2024</p>
          </div>

          <div className="text-right">
            <p>Kota Bandung, 14 November 2026</p>
            <p className="font-bold text-white mt-1">Ketua Panitia Pelaksana</p>
            <div className="h-16"></div>
            <p className="underline text-slate-200">Drs. Budi Santoso</p>
            <p className="text-[10px]">Pengcab PSTI Kota Bandung</p>
          </div>
        </div>
      </div>
    </div>
  );
};

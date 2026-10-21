/**
 * Utility for generating downloadable official PDF tournament reports for organizers.
 * Uses jsPDF and jspdf-autotable for client-side, zero-dependency PDF creation.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Tournament,
  Category,
  Team,
  Match,
  Court,
  TournamentGroup,
  AuditLog,
} from '../types';
import { calculateGroupStandings } from './scoring';

export interface ExportReportOptions {
  includeOverview: boolean;
  includeStats: boolean;
  includeStandings: boolean;
  includeMatches: boolean;
  includePodium: boolean;
  includeRoster: boolean;
  includeAuditTrail: boolean;
  includeSignatures: boolean;
  categoryId?: string; // 'ALL' or specific category id
  reportTitle?: string;
  notes?: string;
}

export interface TournamentStatistics {
  totalCategories: number;
  totalTeams: number;
  approvedTeams: number;
  checkedInTeams: number;
  totalPlayers: number;
  verifiedPlayers: number;
  totalMatches: number;
  completedMatches: number;
  ongoingMatches: number;
  pendingVerificationMatches: number;
  totalSetsPlayed: number;
  totalPointsScored: number;
  totalCourts: number;
  activeCourts: number;
}

export function computeTournamentStatistics(
  categories: Category[],
  teams: Team[],
  matches: Match[],
  courts: Court[]
): TournamentStatistics {
  const approvedTeams = teams.filter((t) => t.registrationStatus === 'APPROVED').length;
  const checkedInTeams = teams.filter((t) => t.checkInStatus === 'HADIR').length;

  let totalPlayers = 0;
  let verifiedPlayers = 0;
  teams.forEach((t) => {
    totalPlayers += t.players.length;
    verifiedPlayers += t.players.filter((p) => p.isVerified).length;
  });

  const completedMatches = matches.filter((m) => m.status === 'COMPLETED').length;
  const ongoingMatches = matches.filter((m) => m.status === 'ON_GOING').length;
  const pendingVerificationMatches = matches.filter(
    (m) => m.status === 'AWAITING_VERIFICATION'
  ).length;

  let totalSetsPlayed = 0;
  let totalPointsScored = 0;
  matches.forEach((m) => {
    m.sets.forEach((s) => {
      if (s.isFinished || s.homeScore > 0 || s.awayScore > 0) {
        totalSetsPlayed++;
        totalPointsScored += (s.homeScore || 0) + (s.awayScore || 0);
      }
    });
  });

  return {
    totalCategories: categories.length,
    totalTeams: teams.length,
    approvedTeams,
    checkedInTeams,
    totalPlayers,
    verifiedPlayers,
    totalMatches: matches.length,
    completedMatches,
    ongoingMatches,
    pendingVerificationMatches,
    totalSetsPlayed,
    totalPointsScored,
    totalCourts: courts.length,
    activeCourts: courts.filter((c) => c.isActive).length,
  };
}

export function generateTournamentPDF(
  tournament: Tournament,
  categories: Category[],
  teams: Team[],
  matches: Match[],
  groups: TournamentGroup[],
  courts: Court[],
  auditLogs: AuditLog[],
  options: ExportReportOptions
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = margin;

  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const accentColor: [number, number, number] = [217, 119, 6]; // Amber 600
  const secondaryColor: [number, number, number] = [71, 85, 105]; // Slate 600
  const lightBg: [number, number, number] = [248, 250, 252];

  const stats = computeTournamentStatistics(categories, teams, matches, courts);
  const selectedCategories =
    !options.categoryId || options.categoryId === 'ALL'
      ? categories
      : categories.filter((c) => c.id === options.categoryId);

  // Helper for adding headers
  const addSectionHeader = (title: string, subtitle?: string) => {
    if (currentY > pageHeight - 35) {
      doc.addPage();
      currentY = margin + 5;
    } else {
      currentY += 6;
    }

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(margin, currentY, 3, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title, margin + 6, currentY + 5.5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(subtitle, margin + 6, currentY + 9.5);
      currentY += 12;
    } else {
      currentY += 8;
    }
  };

  // 1. OFFICIAL COVER / HEADER BLOCK
  // Header background bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent accent stripe
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(tournament.name || 'LAPORAN RESMI TURNAMEN SEPAK TAKRAW', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    `Penyelenggara: ${tournament.organizer} | Lokasi: ${tournament.location}`,
    margin,
    18
  );
  doc.text(
    `Waktu Pelaksanaan: ${tournament.startDate} s/d ${tournament.endDate} | Dokumen Resmi Panitia Pelaksana`,
    margin,
    23
  );

  currentY = 36;

  // 2. DOCUMENT METADATA BADGE
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(options.reportTitle || 'LAPORAN REKAPITULASI HASIL & STATISTIK RESMI TURNAMEN', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const exportDate = new Date().toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
  doc.text(`Waktu Cetak: ${exportDate} WIB | Status: DOKUMEN RESMI (VERIFIKASI SISTEM SCORING)`, margin + 4, currentY + 10.5);

  currentY += 18;

  // 3. STATISTICAL SUMMARY MATRIX (KPIs)
  if (options.includeStats) {
    addSectionHeader(
      'RINGKASAN EKSEKUTIF & STATISTIK TURNAMEN',
      'Indikator capaian operasional, partisipasi peserta, dan volume pertandingan'
    );

    const statsData = [
      [
        { content: 'Total Kategori Laga', styles: { fontStyle: 'bold' } },
        `${stats.totalCategories} Kategori`,
        { content: 'Total Regu Terdaftar', styles: { fontStyle: 'bold' } },
        `${stats.totalTeams} Regu (${stats.approvedTeams} Disetujui)`,
      ],
      [
        { content: 'Tingkat Kehadiran (Daftar Ulang)', styles: { fontStyle: 'bold' } },
        `${stats.checkedInTeams} / ${stats.totalTeams} Regu (${
          stats.totalTeams > 0
            ? Math.round((stats.checkedInTeams / stats.totalTeams) * 100)
            : 0
        }%)`,
        { content: 'Total Atlet Terdaftar', styles: { fontStyle: 'bold' } },
        `${stats.totalPlayers} Atlet (${stats.verifiedPlayers} Terverifikasi)`,
      ],
      [
        { content: 'Total Pertandingan Terjadwal', styles: { fontStyle: 'bold' } },
        `${stats.totalMatches} Pertandingan`,
        { content: 'Pertandingan Selesai', styles: { fontStyle: 'bold' } },
        `${stats.completedMatches} Selesai (${
          stats.totalMatches > 0
            ? Math.round((stats.completedMatches / stats.totalMatches) * 100)
            : 0
        }%)`,
      ],
      [
        { content: 'Pertandingan Live / Menunggu Pengesahan', styles: { fontStyle: 'bold' } },
        `${stats.ongoingMatches} Berjalan / ${stats.pendingVerificationMatches} Menunggu Sah`,
        { content: 'Volume Set & Poin Dimainkan', styles: { fontStyle: 'bold' } },
        `${stats.totalSetsPlayed} Set (${stats.totalPointsScored.toLocaleString()} Total Poin)`,
      ],
      [
        { content: 'Fasilitas Lapangan Digunakan', styles: { fontStyle: 'bold' } },
        `${stats.activeCourts} Aktif dari ${stats.totalCourts} Lapangan Resmi`,
        { content: 'Kontak Panitia / PIC', styles: { fontStyle: 'bold' } },
        `${tournament.contactPerson} (${tournament.contactPhone || '-'})`,
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          {
            content: 'METRIK OPERASIONAL',
            styles: { halign: 'left', fillColor: primaryColor },
          },
          {
            content: 'NILAI / DATA',
            styles: { halign: 'left', fillColor: primaryColor },
          },
          {
            content: 'METRIK PESERTA & TEKNIS',
            styles: { halign: 'left', fillColor: primaryColor },
          },
          {
            content: 'NILAI / DATA',
            styles: { halign: 'left', fillColor: primaryColor },
          },
        ],
      ],
      body: statsData as any,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fontSize: 8,
        fontStyle: 'bold',
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 50, fillColor: [248, 250, 252] },
        1: { cellWidth: 41 },
        2: { cellWidth: 50, fillColor: [248, 250, 252] },
        3: { cellWidth: 41 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // 4. PODIUM / JUARA RESMI (If available or requested)
  if (options.includePodium) {
    addSectionHeader(
      'REKAPITULASI JUARA & PODIUM RESMI',
      'Penetapan peraih medali emas, perak, dan perunggu berdasarkan hasil final resmi'
    );

    const podiumRows: any[] = [];

    selectedCategories.forEach((cat) => {
      const finalMatch = matches.find(
        (m) => m.categoryId === cat.id && m.stage === 'FINAL'
      );
      const bronzeMatch = matches.find(
        (m) => m.categoryId === cat.id && m.stage === 'BRONZE_FINAL'
      );

      const goldTeam = teams.find((t) => t.id === finalMatch?.winnerTeamId);
      let silverTeam: Team | undefined;
      if (finalMatch && finalMatch.winnerTeamId) {
        const runnerUpId =
          finalMatch.winnerTeamId === finalMatch.teamHomeId
            ? finalMatch.teamAwayId
            : finalMatch.teamHomeId;
        silverTeam = teams.find((t) => t.id === runnerUpId);
      }

      let bronzeLabel = '-';
      if (cat.regulation.bronzeMatchFormat === 'SHARED') {
        const sfMatches = matches.filter(
          (m) => m.categoryId === cat.id && m.stage === 'SEMI_FINAL'
        );
        const sharedNames: string[] = [];
        sfMatches.forEach((sf) => {
          if (sf.winnerTeamId) {
            const loserId =
              sf.winnerTeamId === sf.teamHomeId ? sf.teamAwayId : sf.teamHomeId;
            const found = teams.find((t) => t.id === loserId);
            if (found) sharedNames.push(`${found.name} (${found.contingent})`);
          }
        });
        bronzeLabel = sharedNames.length > 0 ? sharedNames.join(' & ') : 'Belum selesai';
      } else {
        const bTeam = teams.find((t) => t.id === bronzeMatch?.winnerTeamId);
        bronzeLabel = bTeam ? `${bTeam.name} (${bTeam.contingent})` : 'Belum selesai';
      }

      podiumRows.push([
        cat.name,
        goldTeam ? `${goldTeam.name} (${goldTeam.contingent})` : 'Belum selesai',
        silverTeam ? `${silverTeam.name} (${silverTeam.contingent})` : 'Belum selesai',
        bronzeLabel,
        finalMatch?.status === 'COMPLETED' ? 'RESMI' : 'SEMENTARA',
      ]);
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'KATEGORI LAGA',
          'JUARA 1 (MEDALI EMAS)',
          'JUARA 2 (MEDALI PERAK)',
          'JUARA 3 (MEDALI PERUNGGU)',
          'STATUS',
        ],
      ],
      body: podiumRows,
      theme: 'striped',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.2,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 42 },
        2: { cellWidth: 42 },
        3: { cellWidth: 45 },
        4: { cellWidth: 15, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // 5. KLASEMEN BABAK GRUP
  if (options.includeStandings) {
    selectedCategories.forEach((cat) => {
      const catGroups = groups.filter((g) => g.categoryId === cat.id);
      if (catGroups.length === 0) return;

      addSectionHeader(
        `KLASEMEN BABAK GRUP: ${cat.name.toUpperCase()}`,
        `Aturan: Poin Menang +${cat.regulation.pointsWin}, Kalah +${cat.regulation.pointsLoss} | Top ${cat.advancingPerGroup} Tim Maju ke Gugur`
      );

      catGroups.forEach((group) => {
        const teamsInGroup = teams.filter((t) => group.teamIds.includes(t.id));
        const matchesInGroup = matches.filter(
          (m) => m.categoryId === cat.id && m.groupId === group.id
        );
        const standings = calculateGroupStandings(
          teamsInGroup,
          matchesInGroup,
          cat.regulation,
          cat.advancingPerGroup
        );

        const rows = standings.map((item) => [
          item.rank.toString(),
          item.teamName,
          item.contingent,
          item.played.toString(),
          item.won.toString(),
          item.lost.toString(),
          `${item.setsWon}-${item.setsLost}`,
          item.setDifference > 0 ? `+${item.setDifference}` : item.setDifference.toString(),
          `${item.pointsWon}-${item.pointsLost}`,
          item.pointDifference > 0 ? `+${item.pointDifference}` : item.pointDifference.toString(),
          item.points.toString(),
          item.isQualified ? 'LOLOS (GUGUR)' : '-',
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [
            [
              { content: `GRUP ${group.name}`, colSpan: 12, styles: { fillColor: [51, 65, 85] } },
            ],
            [
              'NO',
              'NAMA REGU',
              'KONTINGEN',
              'MN',
              'M',
              'K',
              'SET (M-K)',
              'SLS SET',
              'POIN (M-K)',
              'SLS POIN',
              'PTS',
              'STATUS',
            ],
          ],
          body: rows,
          theme: 'grid',
          styles: {
            fontSize: 7,
            cellPadding: 1.8,
            halign: 'center',
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 8, fontStyle: 'bold' },
            1: { cellWidth: 38, halign: 'left', fontStyle: 'bold' },
            2: { cellWidth: 30, halign: 'left' },
            3: { cellWidth: 9 },
            4: { cellWidth: 8 },
            5: { cellWidth: 8 },
            6: { cellWidth: 16 },
            7: { cellWidth: 12 },
            8: { cellWidth: 18 },
            9: { cellWidth: 12 },
            10: { cellWidth: 10, fontStyle: 'bold', fillColor: [254, 243, 199] },
            11: { cellWidth: 13, fontSize: 6.5 },
          },
          margin: { left: margin, right: margin },
        });

        currentY = (doc as any).lastAutoTable.finalY + 4;
      });
    });
  }

  // 6. REKAPITULASI HASIL & SKOR PERTANDINGAN
  if (options.includeMatches) {
    addSectionHeader(
      'REKAPITULASI HASIL & SKOR PERTANDINGAN LENGKAP',
      'Catatan hasil per set, wasit yang bertugas, serta status pengesahan resmi'
    );

    const matchRows: any[] = [];
    const sortedMatches = [...matches].sort((a, b) => {
      // Sort by date then time
      const dateA = `${a.scheduledDate} ${a.scheduledTime}`;
      const dateB = `${b.scheduledDate} ${b.scheduledTime}`;
      return dateA.localeCompare(dateB);
    });

    sortedMatches.forEach((m) => {
      if (options.categoryId && options.categoryId !== 'ALL' && m.categoryId !== options.categoryId) {
        return;
      }

      const cat = categories.find((c) => c.id === m.categoryId);
      const homeTeam = teams.find((t) => t.id === m.teamHomeId);
      const awayTeam = teams.find((t) => t.id === m.teamAwayId);
      const court = courts.find((c) => c.id === m.courtId);

      const homeName = homeTeam?.name || m.teamHomePlaceholder || 'TBD';
      const awayName = awayTeam?.name || m.teamAwayPlaceholder || 'TBD';

      // Set score text e.g. "21-18, 19-21, 21-15 (2-1)"
      let scoreText = '-';
      if (m.sets.length > 0) {
        const setStrings = m.sets
          .filter((s) => s.isFinished || s.homeScore > 0 || s.awayScore > 0)
          .map((s) => `${s.homeScore}-${s.awayScore}`);
        if (setStrings.length > 0) {
          scoreText = `${setStrings.join(', ')} (${m.homeSetsWon}-${m.awaySetsWon})`;
        }
      }

      let winnerText = '-';
      if (m.winnerTeamId) {
        const wTeam = teams.find((t) => t.id === m.winnerTeamId);
        winnerText = wTeam ? wTeam.name : 'Pemenang';
      }

      const stageLabels: Record<string, string> = {
        GROUP_STAGE: `Grup ${m.groupName || ''}`,
        ROUND_OF_16: '16 Besar',
        QUARTER_FINAL: 'Perempat Final',
        SEMI_FINAL: 'Semifinal',
        BRONZE_FINAL: 'Perebutan Juara 3',
        FINAL: 'FINAL',
      };

      matchRows.push([
        m.matchCode,
        cat ? cat.name.replace('Inter Regu ', '') : '-',
        stageLabels[m.stage] || m.stage,
        `${m.scheduledDate} ${m.scheduledTime}`,
        court ? court.name.replace('Lapangan ', 'Lap. ') : '-',
        `${homeName} vs ${awayName}`,
        scoreText,
        winnerText,
        m.refereeName || '-',
        m.isVerified ? 'SAH' : m.status === 'COMPLETED' ? 'SELESAI' : m.status,
      ]);
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'KODE',
          'KATEGORI',
          'BABAK',
          'JADWAL',
          'LAP.',
          'LAGA (HOME vs AWAY)',
          'SKOR SET',
          'PEMENANG',
          'WASIT',
          'STATUS',
        ],
      ],
      body: matchRows,
      theme: 'striped',
      styles: {
        fontSize: 6.8,
        cellPadding: 1.8,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 12, fontStyle: 'bold' },
        1: { cellWidth: 22 },
        2: { cellWidth: 18 },
        3: { cellWidth: 20 },
        4: { cellWidth: 14 },
        5: { cellWidth: 38, fontStyle: 'bold' },
        6: { cellWidth: 24, halign: 'center' },
        7: { cellWidth: 18 },
        8: { cellWidth: 16 },
        9: { cellWidth: 10, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // 7. DAFTAR REGU, DAFTAR ULANG & ATLET
  if (options.includeRoster) {
    addSectionHeader(
      'DAFTAR REGU PESERTA & STATUS VERIFIKASI KEHADIRAN',
      'Data kontingen, ofisial, status verifikasi berkas, dan kehadiran daftar ulang (check-in)'
    );

    const teamRows: any[] = [];
    teams.forEach((team, idx) => {
      const cat = categories.find((c) => c.id === team.categoryId);
      const verifiedAthletes = team.players.filter((p) => p.isVerified).length;
      const playerSummary = team.players
        .map((p) => `#${p.jerseyNumber} ${p.fullName} (${p.position.split(' ')[0]})`)
        .join('\n');

      teamRows.push([
        (idx + 1).toString(),
        team.name,
        team.contingent,
        cat ? cat.name : '-',
        team.coachName || team.managerName || '-',
        team.checkInStatus === 'HADIR'
          ? `HADIR (${team.checkInTime ? team.checkInTime.slice(11, 16) : ''})`
          : team.checkInStatus || 'BELUM',
        `${verifiedAthletes} / ${team.players.length} Atlet`,
        playerSummary || '-',
      ]);
    });

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'NO',
          'NAMA REGU',
          'KONTINGEN',
          'KATEGORI',
          'PELATIH / OFISIAL',
          'KEHADIRAN',
          'VERIFIKASI',
          'SUSUNAN PEMAIN (JERSEY & POSISI)',
        ],
      ],
      body: teamRows,
      theme: 'grid',
      styles: {
        fontSize: 6.8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 30, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 25 },
        4: { cellWidth: 22 },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 16, halign: 'center' },
        7: { cellWidth: 47, fontSize: 6 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // 8. LOG AUDIT & INTEGRITAS (If selected)
  if (options.includeAuditTrail && auditLogs.length > 0) {
    addSectionHeader(
      'LOG AUDIT TRAIL & INTEGRITAS HASIL RESMI',
      'Riwayat pengesahan hasil, perubahan regulasi, dan koreksi skor oleh admin'
    );

    const logRows = auditLogs.slice(0, 20).map((l) => [
      l.timestamp.slice(0, 19).replace('T', ' '),
      l.performedBy,
      l.actionType,
      l.entityName,
      l.reason || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['WAKTU (WIB)', 'PENGGUNA / ROLE', 'JENIS TINDAKAN', 'OBJEK / ENTITAS', 'CATATAN / ALASAN']],
      body: logRows,
      theme: 'striped',
      styles: {
        fontSize: 6.8,
        cellPadding: 1.8,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 26, fontStyle: 'bold' },
        2: { cellWidth: 32 },
        3: { cellWidth: 34 },
        4: { cellWidth: 62 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // 9. OFFICIAL SIGN-OFF / LEMBAR PENGESAHAN (LEGALITAS PANITIA)
  if (options.includeSignatures) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = margin + 10;
    } else {
      currentY += 8;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    const dateToday = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const locationCity = tournament.location.includes(',')
      ? tournament.location.split(',')[1].trim()
      : 'Bandung';

    doc.text(
      `Ditetapkan di: ${locationCity}`,
      pageWidth - margin - 50,
      currentY,
      { align: 'right' }
    );
    doc.text(
      `Pada tanggal: ${dateToday}`,
      pageWidth - margin - 50,
      currentY + 4.5,
      { align: 'right' }
    );

    currentY += 12;

    const colWidth = (pageWidth - margin * 2) / 3;

    // Signatures row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);

    doc.text('Mengetahui / Mengesahkan,', margin + 5, currentY);
    doc.text('Ketua Panitia Pelaksana', margin + 5, currentY + 4.5);

    doc.text('Technical Delegate (TD)', margin + colWidth + 5, currentY);
    doc.text('PSTI Jawa Barat / Pusat', margin + colWidth + 5, currentY + 4.5);

    doc.text('Koordinator Wasit & Juri', margin + colWidth * 2 + 5, currentY);
    doc.text('Turnamen Sepak Takraw', margin + colWidth * 2 + 5, currentY + 4.5);

    currentY += 26; // Signature line space

    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 5, currentY, margin + colWidth - 10, currentY);
    doc.line(margin + colWidth + 5, currentY, margin + colWidth * 2 - 10, currentY);
    doc.line(margin + colWidth * 2 + 5, currentY, pageWidth - margin - 5, currentY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`(${tournament.contactPerson || 'Nama Ketua Panitia'})`, margin + 5, currentY + 4.5);
    doc.text('(Technical Delegate PSTI)', margin + colWidth + 5, currentY + 4.5);
    doc.text('(Koordinator Perwasitan)', margin + colWidth * 2 + 5, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('NIP / SK Panitia', margin + 5, currentY + 8);
    doc.text('Lisensi Wasit Nasional / TD', margin + colWidth + 5, currentY + 8);
    doc.text('Lisensi Wasit Nasional PSTI', margin + colWidth * 2 + 5, currentY + 8);
  }

  // 10. FOOTER ON EVERY PAGE (Page Numbering & Official Verification)
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, pageHeight - 9, pageWidth, 9, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(203, 213, 225);

    const footerLeft = `${tournament.name} | Sistem Scoring & Rekapitulasi Resmi PSTI`;
    const footerRight = `Halaman ${i} dari ${pageCount}`;

    doc.text(footerLeft, margin, pageHeight - 3.5);
    doc.text(footerRight, pageWidth - margin, pageHeight - 3.5, { align: 'right' });
  }

  return doc;
}

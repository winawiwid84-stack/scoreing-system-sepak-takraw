import {
  CategoryRegulation,
  GroupStandingItem,
  Match,
  SetScore,
  Team,
  TieBreakerRule,
} from '../types';

export interface SetValidationResult {
  isFinished: boolean;
  winnerSide?: 'HOME' | 'AWAY';
  statusText: string;
}

/**
 * Validates whether a set is completed based on ISTAF regulation settings
 */
export function validateSepakTakrawSet(
  homeScore: number,
  awayScore: number,
  regulation: Pick<CategoryRegulation, 'targetPointsPerSet' | 'deuceEnabled' | 'deuceMaxPoints'>
): SetValidationResult {
  const { targetPointsPerSet, deuceEnabled, deuceMaxPoints } = regulation;
  const leadDiff = Math.abs(homeScore - awayScore);

  // Belum ada yang mencapai target minimal
  if (homeScore < targetPointsPerSet && awayScore < targetPointsPerSet) {
    return { isFinished: false, statusText: 'Set sedang berlangsung' };
  }

  // Jika aturan deuce aktif
  if (deuceEnabled) {
    const deuceThreshold = targetPointsPerSet - 1; // e.g. 20-20 for 21 target
    if (homeScore >= deuceThreshold && awayScore >= deuceThreshold) {
      // Menang jika memimpin 2 poin
      if (leadDiff >= 2) {
        const winner = homeScore > awayScore ? 'HOME' : 'AWAY';
        return {
          isFinished: true,
          winnerSide: winner,
          statusText: `Selesai (Deuce +2: ${homeScore}-${awayScore})`,
        };
      }
      // Atau menyentuh batas maksimal deuce (sudden death cap)
      if (homeScore >= deuceMaxPoints || awayScore >= deuceMaxPoints) {
        const winner = homeScore > awayScore ? 'HOME' : 'AWAY';
        return {
          isFinished: true,
          winnerSide: winner,
          statusText: `Selesai (Batas Deuce Cap ${deuceMaxPoints})`,
        };
      }
      return { isFinished: false, statusText: `Deuce Berjalan (${homeScore}-${awayScore})` };
    }
  }

  // Selesai reguler (mencapai target dan unggul minimal 2 poin atau 1 jika deuce tidak aktif)
  const reqDiff = deuceEnabled ? 2 : 1;
  if (homeScore >= targetPointsPerSet || awayScore >= targetPointsPerSet) {
    if (leadDiff >= reqDiff) {
      const winner = homeScore > awayScore ? 'HOME' : 'AWAY';
      return { isFinished: true, winnerSide: winner, statusText: `Set Selesai (${homeScore}-${awayScore})` };
    }
  }

  return { isFinished: false, statusText: 'Set sedang berlangsung' };
}

/**
 * Calculates Group Standings dynamically using the Category's configured Tie-Breaker Order.
 * Only verified & completed matches count towards the official standings.
 */
export function calculateGroupStandings(
  teamsInGroup: Team[],
  matchesInGroup: Match[],
  regulation: CategoryRegulation,
  advancingQuota: number = 2
): GroupStandingItem[] {
  // 1. Initialize stats per team
  const statsMap: Record<string, GroupStandingItem> = {};

  teamsInGroup.forEach((team) => {
    statsMap[team.id] = {
      teamId: team.id,
      teamName: team.name,
      contingent: team.contingent,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      setsWon: 0,
      setsLost: 0,
      setDifference: 0,
      setRatio: 0,
      pointsWon: 0,
      pointsLost: 0,
      pointDifference: 0,
      pointRatio: 0,
      rank: 1,
      isQualified: false,
    };
  });

  // 2. Tally results only from VERIFIED completed matches
  matchesInGroup.forEach((match) => {
    if (!match.isVerified || match.status !== 'COMPLETED' || !match.winnerTeamId) {
      return;
    }
    const home = statsMap[match.teamHomeId || ''];
    const away = statsMap[match.teamAwayId || ''];
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    home.setsWon += match.homeSetsWon;
    home.setsLost += match.awaySetsWon;
    away.setsWon += match.awaySetsWon;
    away.setsLost += match.homeSetsWon;

    if (match.winnerTeamId === home.teamId) {
      home.won += 1;
      home.points += regulation.pointsWin;
      away.lost += 1;
      away.points += regulation.pointsLoss;
    } else if (match.winnerTeamId === away.teamId) {
      away.won += 1;
      away.points += regulation.pointsWin;
      home.lost += 1;
      home.points += regulation.pointsLoss;
    }

    // Tally points inside each set
    match.sets.forEach((set) => {
      home.pointsWon += set.homeScore;
      home.pointsLost += set.awayScore;
      away.pointsWon += set.awayScore;
      away.pointsLost += set.homeScore;
    });
  });

  // 3. Compute differences and ratios
  const list = Object.values(statsMap).map((item) => {
    const setDiff = item.setsWon - item.setsLost;
    const setRatio = item.setsLost === 0 ? item.setsWon : parseFloat((item.setsWon / item.setsLost).toFixed(3));
    const ptDiff = item.pointsWon - item.pointsLost;
    const ptRatio = item.pointsLost === 0 ? item.pointsWon : parseFloat((item.pointsWon / item.pointsLost).toFixed(3));

    return {
      ...item,
      setDifference: setDiff,
      setRatio: setRatio,
      pointDifference: ptDiff,
      pointRatio: ptRatio,
    };
  });

  // 4. Sort according to tie-breaker rules
  const rules = regulation.tieBreakerOrder || ['POINTS', 'HEAD_TO_HEAD', 'SET_DIFFERENCE', 'POINT_DIFFERENCE'];

  list.sort((a, b) => {
    for (const rule of rules) {
      if (rule === 'POINTS' && b.points !== a.points) {
        return b.points - a.points;
      }
      if (rule === 'HEAD_TO_HEAD' && b.points === a.points) {
        // Find direct match between A and B
        const directMatch = matchesInGroup.find(
          (m) =>
            m.isVerified &&
            ((m.teamHomeId === a.teamId && m.teamAwayId === b.teamId) ||
              (m.teamHomeId === b.teamId && m.teamAwayId === a.teamId))
        );
        if (directMatch && directMatch.winnerTeamId) {
          return directMatch.winnerTeamId === a.teamId ? -1 : 1;
        }
      }
      if (rule === 'SET_DIFFERENCE' && b.setDifference !== a.setDifference) {
        return b.setDifference - a.setDifference;
      }
      if (rule === 'SET_RATIO' && b.setRatio !== a.setRatio) {
        return b.setRatio - a.setRatio;
      }
      if (rule === 'POINT_DIFFERENCE' && b.pointDifference !== a.pointDifference) {
        return b.pointDifference - a.pointDifference;
      }
      if (rule === 'POINT_RATIO' && b.pointRatio !== a.pointRatio) {
        return b.pointRatio - a.pointRatio;
      }
    }
    // If still tied across all configured rules, flag as needing admin decision
    a.needsDecision = true;
    b.needsDecision = true;
    return 0;
  });

  // Assign ranks and qualification status
  return list.map((item, index) => ({
    ...item,
    rank: index + 1,
    isQualified: index < advancingQuota,
  }));
}

/**
 * Generate standard Round-Robin pairs for a group of teams
 */
export function generateRoundRobinPairings(teamIds: string[]): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  const n = teamIds.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs;
}

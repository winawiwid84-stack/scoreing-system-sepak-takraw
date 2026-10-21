export interface MatchScoreToast {
  id: string;
  matchId: string;
  matchCode: string;
  categoryId: string;
  categoryName: string;
  courtName: string;
  homeTeamName: string;
  awayTeamName: string;
  setNumber: number;
  homeScore: number;
  awayScore: number;
  prevHomeScore?: number;
  prevAwayScore?: number;
  scoringSide?: 'HOME' | 'AWAY' | 'STATUS_CHANGE';
  scoringTeamName?: string;
  changeType: 'POINT_SCORED' | 'SET_WON' | 'MATCH_SUBMITTED' | 'MATCH_VERIFIED' | 'SCORE_CORRECTED';
  homeSetsWon: number;
  awaySetsWon: number;
  isSetFinished?: boolean;
  message: string;
  timestamp: number;
  refereeName?: string;
}

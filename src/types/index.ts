export type UserRole = 'ADMIN' | 'WASIT' | 'PELATIH' | 'ATLET' | 'UMUM';

export type RegistrationStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED';

export type MatchStatus =
  | 'SCHEDULED'
  | 'READY'
  | 'ON_GOING'
  | 'AWAITING_VERIFICATION'
  | 'COMPLETED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'WALKOVER';

export type TieBreakerRule =
  | 'POINTS'
  | 'HEAD_TO_HEAD'
  | 'SET_DIFFERENCE'
  | 'SET_RATIO'
  | 'POINT_DIFFERENCE'
  | 'POINT_RATIO'
  | 'MANUAL_DECISION';

export type BronzeMatchFormat = 'MATCH' | 'SHARED'; // MATCH: Perebutan Juara 3, SHARED: Juara 3 Bersama

export type TournamentStage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'BRONZE_FINAL'
  | 'FINAL';

export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isApproved: boolean; // Wasit & Pelatih need admin approval
  teamId?: string; // If pelatih or atlet
  licenseNumber?: string; // If wasit
  contingentName?: string; // If pelatih / atlet
  registeredAt?: string;
  playerInfo?: {
    jerseyNumber: number;
    position: string;
    birthDate: string;
    identityNumber: string;
  };
}

export interface Player {
  id: string;
  teamId: string;
  fullName: string;
  identityNumber: string; // NIK or NISN
  birthDate: string;
  jerseyNumber: number;
  position: 'Tekong' | 'Apit Kanan (Feeder)' | 'Apit Kiri (Killer/Striker)';
  isStarter: boolean;
  documentName?: string;
  isVerified: boolean;
  verificationNotes?: string;
  isPresent?: boolean;
  jerseyChecked?: boolean;
}

export interface Team {
  id: string;
  categoryId: string;
  coachId?: string;
  name: string;
  contingent: string; // e.g. Kota Bandung, Kab. Purwakarta
  managerName?: string;
  coachName?: string;
  contactPhone?: string;
  registrationStatus: RegistrationStatus;
  rejectionReason?: string;
  groupSlotCode?: string; // e.g. 'A1', 'A2', 'B1'
  players: Player[];
  createdAt: string;
  checkInStatus?: 'BELUM_HADIR' | 'HADIR' | 'TIDAK_HADIR';
  checkInTime?: string;
  checkInBy?: string;
  checkInRepresentative?: string;
  checkInNotes?: string;
}

export interface CategoryRegulation {
  numberOfSets: number; // e.g. 3 (Best of 3)
  targetPointsPerSet: number; // e.g. 21 (ISTAF 2024+ regulation)
  deuceEnabled: boolean;
  deuceMaxPoints: number; // e.g. 25
  tiebreakPoints: number; // Set 3 tiebreak point target, e.g. 21
  bronzeMatchFormat: BronzeMatchFormat; // 'MATCH' or 'SHARED'
  pointsWin: number; // Default 2
  pointsLoss: number; // Default 0
  pointsWalkoverWin: number;
  pointsWalkoverLoss: number;
  tieBreakerOrder: TieBreakerRule[];
  minPlayersPerTeam: number; // default 3
  maxPlayersPerTeam: number; // default 5
}

export interface Category {
  id: string;
  tournamentId: string;
  name: string; // e.g. "Inter Regu Kadet Putra"
  ageGroup: 'Kadet' | 'Junior' | 'Senior' | 'Umum';
  gender: 'PUTRA' | 'PUTRI' | 'CAMPURAN';
  maxTeams: number;
  regulation: CategoryRegulation;
  groupCount: number; // default 4 groups (A, B, C, D)
  advancingPerGroup: number; // default 2 teams advance to knockout
  isDrawLocked: boolean;
  drawLockedAt?: string;
  drawLockedBy?: string;
}

export interface Court {
  id: string;
  tournamentId: string;
  name: string; // e.g. "Lapangan 1 - Utama"
  locationDesc?: string;
  isActive: boolean;
}

export interface SetScore {
  setNumber: number;
  homeScore: number;
  awayScore: number;
  isFinished: boolean;
  winnerSide?: 'HOME' | 'AWAY';
  durationMinutes?: number;
}

export interface Match {
  id: string;
  matchCode: string; // e.g. "MK-01", "SF-01", "FN-01"
  tournamentId: string;
  categoryId: string;
  stage: TournamentStage;
  groupId?: string; // if group stage
  groupName?: string;
  courtId?: string;
  refereeId?: string;
  refereeName?: string;
  
  teamHomeId?: string;
  teamAwayId?: string;
  teamHomePlaceholder?: string; // e.g. "Juara Grup A" or "Pemenang SF-01"
  teamAwayPlaceholder?: string; // e.g. "Runner-up Grup B"
  
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  
  status: MatchStatus;
  
  sets: SetScore[];
  homeSetsWon: number;
  awaySetsWon: number;
  winnerTeamId?: string;
  
  serviceSide?: 'HOME' | 'AWAY';
  refereeNotes?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  
  // Bracket linkage
  bracketRound?: number;
  bracketPosition?: number;
  nextMatchId?: string;
  nextMatchSide?: 'HOME' | 'AWAY';
  loserMatchId?: string; // for Bronze final
  loserMatchSide?: 'HOME' | 'AWAY';
}

export interface TournamentGroup {
  id: string;
  categoryId: string;
  name: string; // "A", "B", "C", "D"
  teamIds: string[];
}

export interface AuditLog {
  id: string;
  actionType:
    | 'DRAW_CONDUCTED'
    | 'DRAW_UNLOCKED'
    | 'SCORE_SUBMITTED'
    | 'SCORE_VERIFIED'
    | 'SCORE_CORRECTION'
    | 'SCHEDULE_CHANGED'
    | 'REGULATION_UPDATED'
    | 'TEAM_STATUS_CHANGED';
  entityName: string;
  entityId: string;
  performedBy: string;
  userRole: UserRole;
  timestamp: string;
  reason: string;
  oldValue?: string;
  newValue?: string;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  organizer: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  bannerUrl: string;
  isPublished: boolean;
  contactPerson: string;
  contactPhone: string;
}

export interface GroupStandingItem {
  teamId: string;
  teamName: string;
  contingent: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setDifference: number;
  setRatio: number;
  pointsWon: number;
  pointsLost: number;
  pointDifference: number;
  pointRatio: number;
  rank: number;
  isQualified: boolean;
  needsDecision?: boolean;
}

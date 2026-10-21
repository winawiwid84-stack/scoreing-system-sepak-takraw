import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Match, SetScore } from '../../types';
import { validateSepakTakrawSet } from '../../utils/scoring';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  Radio,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronDown,
  Layers,
  ArrowRight,
  Shield,
  MapPin,
  RefreshCw,
  Trophy,
  Columns,
  Rows,
  Timer,
  Square,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DualScoreboardViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const DualScoreboardView: React.FC<DualScoreboardViewProps> = ({ onNavigateTab }) => {
  const {
    tournament,
    matches,
    teams,
    categories,
    courts,
    currentUser,
    updateLiveSetScore,
    toggleServiceSide,
    updateMatch,
  } = useTournament();

  // Fullscreen state: tracks native browser fullscreen OR in-app simulated fullscreen
  const [isInAppFullscreen, setIsInAppFullscreen] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFullscreen = isNativeFullscreen || isInAppFullscreen;

  // Split-screen Layout Mode:
  // 'split-side': 2 Lapangan Berdampingan (Horizontal Split 50:50)
  // 'split-stack': 2 Lapangan Bertumpuk (Vertical Split Atas-Bawah)
  // 'court1': Layar Penuh Fokus Lapangan 1
  // 'court2': Layar Penuh Fokus Lapangan 2
  const [viewMode, setViewMode] = useState<'split-side' | 'split-stack' | 'court1' | 'court2'>(
    'split-side'
  );

  // Interactive Scoring Controls Mode (allow quick +1 / -1 from this view)
  const [operatorMode, setOperatorMode] = useState<boolean>(
    currentUser.role === 'ADMIN' || currentUser.role === 'WASIT'
  );

  // Audio Buzzer / Sound enabled state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  // 60-second Tactical Timeout state
  const [timeoutModal, setTimeoutModal] = useState<{
    active: boolean;
    courtName: string;
    teamName: string;
    secondsLeft: number;
  } | null>(null);

  // Timeout usage tracker per match per set
  const [usedTimeouts, setUsedTimeouts] = useState<Record<string, { home: boolean; away: boolean }>>({});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to browser fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = !!document.fullscreenElement;
      setIsNativeFullscreen(isNative);
      if (!isNative && !isInAppFullscreen) {
        setIsInAppFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // 'F' or 'f' to toggle fullscreen
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      // 'Escape' exits in-app fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
      // 'S' or 's' to cycle split screen modes
      if (e.key === 's' || e.key === 'S') {
        setViewMode((prev) => {
          if (prev === 'split-side') return 'split-stack';
          if (prev === 'split-stack') return 'court1';
          if (prev === 'court1') return 'court2';
          return 'split-side';
        });
      }
      // '1' for Court 1 focus
      if (e.key === '1') {
        setViewMode('court1');
      }
      // '2' for Court 2 focus
      if (e.key === '2') {
        setViewMode('court2');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, isInAppFullscreen]);

  // Timeout Countdown Timer
  useEffect(() => {
    if (!timeoutModal || !timeoutModal.active) return;
    if (timeoutModal.secondsLeft <= 0) {
      playSoundEffect('buzzer');
      setTimeoutModal(null);
      return;
    }

    const timer = setInterval(() => {
      setTimeoutModal((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          playSoundEffect('buzzer');
          return null;
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeoutModal]);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const enterFullscreen = async () => {
    // Attempt native browser fullscreen; fallback gracefully to simulated in-app fullscreen
    try {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsNativeFullscreen(true);
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
          setIsNativeFullscreen(true);
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
          setIsNativeFullscreen(true);
        } else {
          setIsInAppFullscreen(true);
        }
      } else {
        setIsInAppFullscreen(true);
      }
    } catch (err) {
      // In case iframe sandbox forbids native fullscreen, activate in-app full window
      console.warn('Native requestFullscreen denied, falling back to In-App Fullscreen:', err);
      setIsInAppFullscreen(true);
    }
    // Set in-app flag as well to guarantee fixed full screen styling
    setIsInAppFullscreen(true);
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
    setIsNativeFullscreen(false);
    setIsInAppFullscreen(false);
  };

  // Sound effect generator using Web Audio API (Whistle / Buzzer)
  const playSoundEffect = (type: 'point' | 'buzzer' | 'whistle') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'point') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'whistle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else {
        // Buzzer for set/match finish or timeout
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.75);
      }
    } catch (e) {
      // Ignore audio failure if user hasn't interacted
    }
  };

  // Court definitions
  const court1Def = courts.find(
    (c) => c.id === 'court-01' || c.name.toLowerCase().includes('1')
  ) || {
    id: 'court-01',
    tournamentId: tournament.id,
    name: 'Lapangan 1 (Center Court)',
    locationDesc: 'Hall Utama Tribun Timur GOR Lodaya',
    isActive: true,
  };

  const court2Def = courts.find(
    (c) => c.id === 'court-02' || c.name.toLowerCase().includes('2')
  ) || {
    id: 'court-02',
    tournamentId: tournament.id,
    name: 'Lapangan 2 (Indoor Samping)',
    locationDesc: 'Hall Sayap Barat Karpet Hijau',
    isActive: true,
  };

  // All matches for Court 1 and Court 2
  const court1Matches = matches.filter(
    (m) => m.courtId === court1Def.id || m.courtId === 'court-01'
  );
  const court2Matches = matches.filter(
    (m) => m.courtId === court2Def.id || m.courtId === 'court-02'
  );

  // Selected match ID state per court
  const [selectedCourt1MatchId, setSelectedCourt1MatchId] = useState<string>('');
  const [selectedCourt2MatchId, setSelectedCourt2MatchId] = useState<string>('');

  // Auto-select on-going match or next scheduled match
  useEffect(() => {
    const live1 = court1Matches.find((m) => m.status === 'ON_GOING');
    const scheduled1 = court1Matches.find((m) => m.status === 'SCHEDULED');
    const first1 = court1Matches[0];
    if (!selectedCourt1MatchId || !court1Matches.some((m) => m.id === selectedCourt1MatchId)) {
      setSelectedCourt1MatchId(live1?.id || scheduled1?.id || first1?.id || '');
    }

    const live2 = court2Matches.find((m) => m.status === 'ON_GOING');
    const scheduled2 = court2Matches.find((m) => m.status === 'SCHEDULED');
    const first2 = court2Matches[0];
    if (!selectedCourt2MatchId || !court2Matches.some((m) => m.id === selectedCourt2MatchId)) {
      setSelectedCourt2MatchId(live2?.id || scheduled2?.id || first2?.id || '');
    }
  }, [matches, court1Matches.length, court2Matches.length]);

  const activeMatch1 = matches.find((m) => m.id === selectedCourt1MatchId);
  const activeMatch2 = matches.find((m) => m.id === selectedCourt2MatchId);

  // Quick point modification for a court match
  const handleAddPoint = (match: Match, side: 'HOME' | 'AWAY') => {
    const cat = categories.find((c) => c.id === match.categoryId);
    const reg = cat?.regulation || {
      targetPointsPerSet: 21,
      deuceEnabled: true,
      deuceMaxPoints: 25,
      numberOfSets: 3,
    };

    const currentSets = match.sets || [];
    const activeSetNumber =
      currentSets.find((s) => !s.isFinished)?.setNumber ||
      (currentSets.length > 0 ? Math.min(currentSets.length + 1, reg.numberOfSets) : 1);

    const activeSet = currentSets.find((s) => s.setNumber === activeSetNumber);
    let home = activeSet ? activeSet.homeScore : 0;
    let away = activeSet ? activeSet.awayScore : 0;

    if (side === 'HOME') home += 1;
    else away += 1;

    // Service rotation according to ISTAF rule
    const total = home + away;
    const isDeuce = home >= reg.targetPointsPerSet - 1 && away >= reg.targetPointsPerSet - 1;
    if (isDeuce || total % 3 === 0) {
      toggleServiceSide(match.id);
    }

    const check = validateSepakTakrawSet(home, away, reg);
    updateLiveSetScore(match.id, activeSetNumber, home, away, check.isFinished, check.winnerSide);
    playSoundEffect(check.isFinished ? 'buzzer' : 'point');
  };

  const handleDeductPoint = (match: Match, side: 'HOME' | 'AWAY') => {
    const cat = categories.find((c) => c.id === match.categoryId);
    const reg = cat?.regulation || {
      targetPointsPerSet: 21,
      deuceEnabled: true,
      deuceMaxPoints: 25,
      numberOfSets: 3,
    };

    const currentSets = match.sets || [];
    const activeSetNumber =
      currentSets.find((s) => !s.isFinished)?.setNumber ||
      (currentSets.length > 0 ? Math.min(currentSets.length + 1, reg.numberOfSets) : 1);

    const activeSet = currentSets.find((s) => s.setNumber === activeSetNumber);
    let home = activeSet ? activeSet.homeScore : 0;
    let away = activeSet ? activeSet.awayScore : 0;

    if (side === 'HOME' && home > 0) home -= 1;
    if (side === 'AWAY' && away > 0) away -= 1;

    const check = validateSepakTakrawSet(home, away, reg);
    updateLiveSetScore(match.id, activeSetNumber, home, away, check.isFinished, check.winnerSide);
  };

  const handleStartMatch = (matchId: string) => {
    updateMatch(matchId, {
      status: 'ON_GOING',
      serviceSide: 'HOME',
      sets: [
        {
          setNumber: 1,
          homeScore: 0,
          awayScore: 0,
          isFinished: false,
        },
      ],
    });
    playSoundEffect('buzzer');
  };

  const handleCallTimeout = (courtName: string, teamName: string, matchId: string, side: 'home' | 'away') => {
    setUsedTimeouts((prev) => ({
      ...prev,
      [matchId]: {
        home: side === 'home' ? true : prev[matchId]?.home || false,
        away: side === 'away' ? true : prev[matchId]?.away || false,
      },
    }));
    playSoundEffect('whistle');
    setTimeoutModal({
      active: true,
      courtName,
      teamName,
      secondsLeft: 60,
    });
  };

  // Helper to render a Court Scoreboard Panel
  const renderCourtPanel = (
    courtTitle: string,
    courtSubtitle: string,
    courtBadgeColor: string,
    match: Match | undefined,
    availableMatches: Match[],
    selectedMatchId: string,
    onSelectMatch: (id: string) => void,
    isFocusSingleMode: boolean = false
  ) => {
    if (!match) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
            <Radio className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{courtTitle}</h3>
            <p className="text-xs text-slate-400 mt-1">{courtSubtitle}</p>
          </div>
          <p className="text-xs text-slate-500 max-w-xs">
            Belum ada pertandingan yang sedang berjalan pada lapangan ini.
          </p>
          {availableMatches.length > 0 && (
            <div className="pt-2">
              <label className="text-[11px] text-slate-400 block mb-1">
                Pilih Jadwal untuk Lapangan Ini:
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => onSelectMatch(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 cursor-pointer"
              >
                <option value="">-- Pilih Pertandingan --</option>
                {availableMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.matchCode} - {m.stage.replace('_', ' ')} ({m.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    }

    const cat = categories.find((c) => c.id === match.categoryId);
    const homeTeam = teams.find((t) => t.id === match.teamHomeId);
    const awayTeam = teams.find((t) => t.id === match.teamAwayId);
    const reg = cat?.regulation || {
      targetPointsPerSet: 21,
      deuceEnabled: true,
      deuceMaxPoints: 25,
      numberOfSets: 3,
    };

    const currentSets = match.sets || [];
    const activeSet =
      currentSets.find((s) => !s.isFinished) ||
      (currentSets.length > 0 ? currentSets[currentSets.length - 1] : null);

    const activeSetNumber = activeSet ? activeSet.setNumber : 1;
    const homeScore = activeSet ? activeSet.homeScore : 0;
    const awayScore = activeSet ? activeSet.awayScore : 0;

    const isDeuce =
      homeScore >= reg.targetPointsPerSet - 1 && awayScore >= reg.targetPointsPerSet - 1;
    const isMatchCompleted = match.status === 'COMPLETED';
    const isLive = match.status === 'ON_GOING';

    const matchTimeouts = usedTimeouts[match.id] || { home: false, away: false };

    return (
      <div
        className={`bg-slate-900/95 border-2 ${
          isLive ? 'border-amber-500/70 shadow-2xl shadow-amber-500/10' : 'border-slate-800'
        } rounded-3xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
          isFocusSingleMode ? 'min-h-[580px]' : ''
        }`}
      >
        {/* Glow ambient background for live matches */}
        {isLive && (
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Panel Header */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${courtBadgeColor} shadow-md`}
              >
                {courtTitle}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {courtSubtitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isLive ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-extrabold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>LIVE ON AIR</span>
                </div>
              ) : isMatchCompleted ? (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SELESAI</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>JADWAL: {match.scheduledTime || 'TBD'}</span>
                </div>
              )}

              {/* Match selector dropdown */}
              {availableMatches.length > 1 && (
                <select
                  value={selectedMatchId}
                  onChange={(e) => onSelectMatch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-300 hover:text-white text-[11px] rounded-lg px-2 py-1 max-w-[140px] truncate cursor-pointer"
                  title="Ganti pertandingan yang ditampilkan pada lapangan ini"
                >
                  {availableMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.matchCode} ({m.status})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Match Category & Stage Info Strip */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 py-2.5 px-1">
            <div className="flex items-center gap-2 font-mono">
              <span className="font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                {match.matchCode}
              </span>
              <span className="text-slate-300 font-semibold">{cat?.name}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {match.stage.replace('_', ' ')} {match.groupName ? `(Grup ${match.groupName})` : ''} ·
              Wasit: {match.refereeName || 'Belum Ditugaskan'}
            </div>
          </div>
        </div>

        {/* Start Match prompt if SCHEDULED */}
        {match.status === 'SCHEDULED' && (
          <div className="my-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
            <div className="text-slate-300 text-xs font-medium">
              Laga dijadwalkan pukul <span className="font-bold text-amber-400">{match.scheduledTime} WIB</span>.
            </div>
            <p className="text-xs text-slate-400">
              Siap memulai pertandingan dan pencatatan skor langsung pada {courtTitle}?
            </p>
            {operatorMode && (
              <button
                onClick={() => handleStartMatch(match.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Laga (Kick-Off)</span>
              </button>
            )}
          </div>
        )}

        {/* MAIN SCOREBOARD DISPLAY - 2 TEAMS */}
        <div className="my-3 space-y-3">
          {/* Active Set & Deuce Bar */}
          <div className="flex items-center justify-between bg-slate-950/90 border border-slate-800/80 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                SET AKTIF: <span className="text-amber-400 font-black">SET {activeSetNumber}</span>
              </span>
              {isDeuce && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-black uppercase tracking-wider animate-bounce">
                  DEUCE (Maks {reg.deuceMaxPoints})
                </span>
              )}
            </div>

            <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Set Menang:</span>
              <span className="font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded text-sm">
                {match.homeSetsWon} - {match.awaySetsWon}
              </span>
            </div>
          </div>

          {/* Teams Side-by-Side Scoring Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Team Home Card */}
            <div
              className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all border-2 ${
                match.serviceSide === 'HOME' && isLive
                  ? 'bg-gradient-to-b from-amber-500/15 via-slate-950 to-slate-950 border-amber-400 shadow-xl shadow-amber-400/10'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-wider">
                    REGU A (HOME)
                  </span>
                  {match.serviceSide === 'HOME' && isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      SERVIS
                    </span>
                  )}
                </div>

                <h3 className={`font-black text-white leading-tight line-clamp-2 ${isFocusSingleMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                  {homeTeam?.name || match.teamHomePlaceholder || 'Tim Home'}
                </h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {homeTeam?.contingent || 'Kontingen'}
                </span>

                {/* Timeout Indicator */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    T.O (60s):{' '}
                    <strong className={matchTimeouts.home ? 'text-red-400' : 'text-emerald-400'}>
                      {matchTimeouts.home ? 'Terpakai' : 'Tersedia (1)'}
                    </strong>
                  </span>
                  {operatorMode && isLive && !matchTimeouts.home && (
                    <button
                      onClick={() =>
                        handleCallTimeout(
                          courtTitle,
                          homeTeam?.name || 'Regu Home',
                          match.id,
                          'home'
                        )
                      }
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 cursor-pointer"
                    >
                      Minta T.O
                    </button>
                  )}
                </div>
              </div>

              {/* GIANT SCORE NUMBER */}
              <div className="my-3 text-center">
                <div
                  className={`font-mono font-black text-amber-400 tracking-tight tabular-nums select-none drop-shadow-[0_4px_20px_rgba(251,191,36,0.3)] ${
                    isFocusSingleMode
                      ? 'text-8xl sm:text-9xl md:text-[130px] leading-none'
                      : 'text-7xl sm:text-8xl'
                  }`}
                >
                  {homeScore}
                </div>
              </div>

              {/* Operator Quick Buttons */}
              {operatorMode && isLive && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleAddPoint(match, 'HOME')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    +1 POIN
                  </button>
                  <button
                    onClick={() => handleDeductPoint(match, 'HOME')}
                    className="w-full py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Koreksi (-1)
                  </button>
                </div>
              )}
            </div>

            {/* Team Away Card */}
            <div
              className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all border-2 ${
                match.serviceSide === 'AWAY' && isLive
                  ? 'bg-gradient-to-b from-amber-500/15 via-slate-950 to-slate-950 border-amber-400 shadow-xl shadow-amber-400/10'
                  : 'bg-slate-950/80 border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-extrabold text-amber-400/90 uppercase tracking-wider">
                    REGU B (AWAY)
                  </span>
                  {match.serviceSide === 'AWAY' && isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      SERVIS
                    </span>
                  )}
                </div>

                <h3 className={`font-black text-white leading-tight line-clamp-2 ${isFocusSingleMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                  {awayTeam?.name || match.teamAwayPlaceholder || 'Tim Away'}
                </h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {awayTeam?.contingent || 'Kontingen'}
                </span>

                {/* Timeout Indicator */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    T.O (60s):{' '}
                    <strong className={matchTimeouts.away ? 'text-red-400' : 'text-emerald-400'}>
                      {matchTimeouts.away ? 'Terpakai' : 'Tersedia (1)'}
                    </strong>
                  </span>
                  {operatorMode && isLive && !matchTimeouts.away && (
                    <button
                      onClick={() =>
                        handleCallTimeout(
                          courtTitle,
                          awayTeam?.name || 'Regu Away',
                          match.id,
                          'away'
                        )
                      }
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 cursor-pointer"
                    >
                      Minta T.O
                    </button>
                  )}
                </div>
              </div>

              {/* GIANT SCORE NUMBER */}
              <div className="my-3 text-center">
                <div
                  className={`font-mono font-black text-amber-400 tracking-tight tabular-nums select-none drop-shadow-[0_4px_20px_rgba(251,191,36,0.3)] ${
                    isFocusSingleMode
                      ? 'text-8xl sm:text-9xl md:text-[130px] leading-none'
                      : 'text-7xl sm:text-8xl'
                  }`}
                >
                  {awayScore}
                </div>
              </div>

              {/* Operator Quick Buttons */}
              {operatorMode && isLive && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleAddPoint(match, 'AWAY')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-lg rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    +1 POIN
                  </button>
                  <button
                    onClick={() => handleDeductPoint(match, 'AWAY')}
                    className="w-full py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Koreksi (-1)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Set Score History Strip */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">RIWAYAT SET:</span>
            <div className="flex items-center gap-2 font-mono">
              {currentSets.length === 0 && <span className="text-slate-500">Belum ada skor set</span>}
              {currentSets.map((s) => (
                <div
                  key={s.setNumber}
                  className={`px-2 py-1 rounded-md text-[11px] border font-bold ${
                    s.isFinished
                      ? 'bg-slate-900 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  S{s.setNumber}: {s.homeScore}-{s.awayScore}
                </div>
              ))}
            </div>
          </div>

          {operatorMode && isLive && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleServiceSide(match.id)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Ganti Servis Manual
              </button>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('wasit')}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Meja Wasit Penuh</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen ${
        isFullscreen
          ? 'bg-slate-950 text-white p-3 sm:p-5 fixed inset-0 z-50 overflow-y-auto flex flex-col justify-between'
          : 'space-y-6 text-slate-100 py-2'
      }`}
    >
      {/* Top Banner Control Bar for Scoreboard */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <img
              src="/assets/aistudio/logo_psti_bdg_3f5f75d3.png"
              alt="Logo PSTI Kota Bandung"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-red-400">
                LIVE SCOREBOARD RESMI
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              PSTI Kota Bandung · GOR Lodaya
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Hall Utama (Lapangan 1) & Sayap Barat (Lapangan 2)</span>
            </p>
          </div>
        </div>

        {/* Center: Live Digital Clock */}
        <div className="bg-slate-950 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase block">
            WAKTU RESMI LAPANGAN
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-amber-400 tracking-wider">
            {currentTime || '00:00:00 WIB'}
          </div>
        </div>

        {/* Right: Actions, Split Screen Switcher & Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Split Screen Mode Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split-side')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'split-side'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Screen Berdampingan 50:50 (Horizontal)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split 50:50</span>
            </button>

            <button
              onClick={() => setViewMode('split-stack')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'split-stack'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Screen Bertumpuk Atas-Bawah (Vertical)"
            >
              <Rows className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bertumpuk</span>
            </button>

            <button
              onClick={() => setViewMode('court1')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'court1'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Layar Penuh Lapangan 1"
            >
              Lap. 1
            </button>

            <button
              onClick={() => setViewMode('court2')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'court2'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Layar Penuh Lapangan 2"
            >
              Lap. 2
            </button>
          </div>

          {/* Operator Mode Toggle */}
          <button
            onClick={() => setOperatorMode(!operatorMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              operatorMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Aktifkan kontrol tombol skor cepat di layar"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {operatorMode ? 'Kontrol Wasit: ON' : 'Mode Publik'}
            </span>
          </button>

          {/* Sound Whistle Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-950 text-amber-400 border-slate-800'
                : 'bg-slate-950 text-slate-600 border-slate-800'
            }`}
            title={soundEnabled ? 'Suara Peluit Aktif' : 'Suara Dimatikan'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* FULLSCREEN BUTTON */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all select-none cursor-pointer ${
              isFullscreen
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 ring-2 ring-red-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
            title="Layar Penuh (Tekan 'F' pada keyboard)"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Keluar Layar Penuh (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Layar Penuh (Fullscreen)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DUAL SCOREBOARD MAIN GRID */}
      <div
        className={`my-4 ${
          viewMode === 'split-side'
            ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 flex-1'
            : viewMode === 'split-stack'
            ? 'grid grid-cols-1 gap-6 flex-1'
            : 'grid grid-cols-1 max-w-5xl mx-auto w-full flex-1'
        }`}
      >
        {/* PANEL 1: LAPANGAN 1 (CENTER COURT) */}
        {(viewMode === 'split-side' || viewMode === 'split-stack' || viewMode === 'court1') &&
          renderCourtPanel(
            court1Def.name,
            court1Def.locationDesc || 'Hall Utama GOR Lodaya',
            'bg-amber-500 text-slate-950',
            activeMatch1,
            court1Matches,
            selectedCourt1MatchId,
            setSelectedCourt1MatchId,
            viewMode === 'court1'
          )}

        {/* PANEL 2: LAPANGAN 2 (INDOOR SAMPING) */}
        {(viewMode === 'split-side' || viewMode === 'split-stack' || viewMode === 'court2') &&
          renderCourtPanel(
            court2Def.name,
            court2Def.locationDesc || 'Sayap Barat Karpet Hijau',
            'bg-emerald-500 text-slate-950',
            activeMatch2,
            court2Matches,
            selectedCourt2MatchId,
            setSelectedCourt2MatchId,
            viewMode === 'court2'
          )}
      </div>

      {/* Tactical Timeout Countdown Modal */}
      {timeoutModal && timeoutModal.active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
              <Timer className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                TIME-OUT RESMI (60 DETIK)
              </span>
              <h3 className="text-2xl font-black text-white mt-2">{timeoutModal.teamName}</h3>
              <p className="text-xs text-slate-400">{timeoutModal.courtName}</p>
            </div>

            {/* Countdown Big Digits */}
            <div className="py-2">
              <div className="font-mono text-7xl font-black text-amber-400 tracking-tight tabular-nums">
                {timeoutModal.secondsLeft}
              </div>
              <span className="text-xs text-slate-400">detik tersisa</span>
            </div>

            <button
              onClick={() => setTimeoutModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Tutup & Lanjutkan Laga
            </button>
          </div>
        </div>
      )}

      {/* Bottom Information & Guide */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Regulasi Skor Resmi ISTAF 2026: Servis bergulir tiap 3 poin, target 21 poin per set (maks deuce 25 poin).
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span>Pintasan: <strong>F</strong> (Fullscreen) · <strong>S</strong> (Split Screen) · <strong>1/2</strong> (Pilih Lapangan) · <strong>ESC</strong> (Keluar)</span>
        </div>
      </div>
    </div>
  );
};

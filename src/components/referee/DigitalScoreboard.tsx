import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Match, SetScore } from '../../types';
import { validateSepakTakrawSet } from '../../utils/scoring';
import {
  ArrowLeft,
  RotateCcw,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Maximize2,
  Minimize2,
  Radio,
} from 'lucide-react';

interface DigitalScoreboardProps {
  match: Match;
  onBack: () => void;
  onOpenLiveScoreboard?: () => void;
}

export const DigitalScoreboard: React.FC<DigitalScoreboardProps> = ({
  match,
  onBack,
  onOpenLiveScoreboard,
}) => {
  const {
    teams,
    categories,
    courts,
    updateLiveSetScore,
    toggleServiceSide,
    submitMatchResult,
  } = useTournament();

  const category = categories.find((c) => c.id === match.categoryId);
  const homeTeam = teams.find((t) => t.id === match.teamHomeId);
  const awayTeam = teams.find((t) => t.id === match.teamAwayId);
  const court = courts.find((c) => c.id === match.courtId);

  // Regulation specs
  const reg = category?.regulation || {
    targetPointsPerSet: 21,
    deuceEnabled: true,
    deuceMaxPoints: 25,
    numberOfSets: 3,
  };

  // Determine active set: find first unfinished set or default to 1
  const existingSets = match.sets || [];
  const activeSetNumber =
    existingSets.find((s) => !s.isFinished)?.setNumber ||
    (existingSets.length > 0 ? Math.min(existingSets.length + 1, reg.numberOfSets) : 1);

  const [currentSet, setCurrentSet] = useState<number>(activeSetNumber);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [refereeNotes, setRefereeNotes] = useState<string>(match.refereeNotes || '');
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      if (document.fullscreenElement) {
        try {
          if (document.exitFullscreen) await document.exitFullscreen();
        } catch (e) {}
      }
      setIsFullscreen(false);
    } else {
      try {
        if (containerRef.current) {
          if (containerRef.current.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          }
        }
      } catch (e) {
        console.warn('Native fullscreen disallowed, activating in-app fullscreen:', e);
      }
      setIsFullscreen(true);
    }
  };

  useEffect(() => {
    const handleFS = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFS);
    return () => document.removeEventListener('fullscreenchange', handleFS);
  }, [isFullscreen]);

  // Sync state when switching set or loading match
  useEffect(() => {
    const existing = existingSets.find((s) => s.setNumber === currentSet);
    if (existing) {
      setHomeScore(existing.homeScore);
      setAwayScore(existing.awayScore);
    } else {
      setHomeScore(0);
      setAwayScore(0);
    }
  }, [currentSet, match]);

  // Validate current set state
  const validation = validateSepakTakrawSet(homeScore, awayScore, reg);

  // Point modifications
  const addPoint = (side: 'HOME' | 'AWAY') => {
    if (match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION') {
      alert('Pertandingan ini telah selesai / dalam pengesahan dan tidak dapat diubah di meja wasit.');
      return;
    }

    let newHome = homeScore;
    let newAway = awayScore;

    if (side === 'HOME') {
      newHome += 1;
      setHomeScore(newHome);
    } else {
      newAway += 1;
      setAwayScore(newAway);
    }

    // Auto rotate service according to ISTAF rule:
    // ISTAF standard: service rotates every 3 points, except on deuce when it rotates every 1 point.
    const totalPoints = newHome + newAway;
    const isDeuceMode = newHome >= reg.targetPointsPerSet - 1 && newAway >= reg.targetPointsPerSet - 1;
    if (isDeuceMode || totalPoints % 3 === 0) {
      toggleServiceSide(match.id);
    }

    // Check if set finishes
    const check = validateSepakTakrawSet(newHome, newAway, reg);
    updateLiveSetScore(
      match.id,
      currentSet,
      newHome,
      newAway,
      check.isFinished,
      check.winnerSide
    );
  };

  const deductPoint = (side: 'HOME' | 'AWAY') => {
    if (match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION') return;
    let newHome = homeScore;
    let newAway = awayScore;

    if (side === 'HOME' && homeScore > 0) {
      newHome -= 1;
      setHomeScore(newHome);
    }
    if (side === 'AWAY' && awayScore > 0) {
      newAway -= 1;
      setAwayScore(newAway);
    }

    const check = validateSepakTakrawSet(newHome, newAway, reg);
    updateLiveSetScore(
      match.id,
      currentSet,
      newHome,
      newAway,
      check.isFinished,
      check.winnerSide
    );
  };

  const handleLockSet = () => {
    if (!validation.isFinished) {
      if (
        !confirm(
          `Set ini belum memenuhi target regulasi (${reg.targetPointsPerSet} poin atau selisih 2). Yakin ingin mengunci set sekarang?`
        )
      ) {
        return;
      }
    }

    const winner = homeScore > awayScore ? 'HOME' : 'AWAY';
    updateLiveSetScore(match.id, currentSet, homeScore, awayScore, true, winner);

    // If more sets needed and under max sets, move to next set
    if (currentSet < reg.numberOfSets) {
      setCurrentSet(currentSet + 1);
    }
  };

  const handleSubmitMatch = () => {
    if (match.homeSetsWon === match.awaySetsWon && match.homeSetsWon === 0) {
      alert('Belum ada set yang dimenangkan!');
      return;
    }

    if (
      confirm(
        'Kirimkan hasil pertandingan ini ke panitia/pengurus cabang untuk disahkan secara resmi?'
      )
    ) {
      submitMatchResult(match.id, refereeNotes);
      onBack();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 overflow-y-auto space-y-4'
          : 'max-w-4xl mx-auto px-2 sm:px-4 py-4 space-y-4'
      }`}
    >
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Jadwal</span>
        </button>

        <div className="text-center">
          <div className="text-xs font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
            <span>{match.matchCode} · {court?.name || 'Lapangan Belum Ditentukan'}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Observer
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {category?.name} · {match.stage.replace('_', ' ')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLiveScoreboard && (
            <button
              onClick={onOpenLiveScoreboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-amber-500/20 hover:from-red-500/30 hover:to-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              title="Buka Live Scoreboard Split Screen"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Split Screen</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title="Layar Penuh Wasit"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Keluar Layar Penuh</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Layar Penuh</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Catatan Wasit</span>
          </button>
        </div>
      </div>

      {/* Status Warning Banner */}
      {match.status === 'AWAITING_VERIFICATION' && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Hasil telah dikirim dan sedang menunggu pengesahan resmi oleh Admin.</span>
          </div>
        </div>
      )}

      {match.status === 'COMPLETED' && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Pertandingan ini telah disahkan resmi oleh panitia. Skor terkunci.</span>
        </div>
      )}

      {/* Set Selector Strip */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-2 gap-2">
        <div className="flex items-center gap-2">
          {Array.from({ length: reg.numberOfSets }).map((_, idx) => {
            const setNum = idx + 1;
            const setObj = existingSets.find((s) => s.setNumber === setNum);
            const isFinished = setObj?.isFinished;
            const isSelected = currentSet === setNum;

            return (
              <button
                key={setNum}
                onClick={() => setCurrentSet(setNum)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : isFinished
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <span>SET {setNum}</span>
                {isFinished && <CheckCircle2 className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Set Score Recap */}
        <div className="text-xs text-slate-300 font-mono hidden sm:flex items-center gap-3 pr-2">
          <span>Set Won:</span>
          <span className="font-bold text-amber-400">
            {match.homeSetsWon} - {match.awaySetsWon}
          </span>
        </div>
      </div>

      {/* Set Validation Notice */}
      <div className="text-center">
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
            validation.isFinished
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-300'
          }`}
        >
          {validation.statusText}
        </span>
      </div>

      {/* DIGITAL TOUCH SCOREBOARD (2-COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Home Card */}
        <div
          className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all ${
            match.serviceSide === 'HOME'
              ? 'border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/5'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                REGU A (TUAN RUMAH)
              </span>
              {match.serviceSide === 'HOME' && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  GILIRAN SERVIS (TEKONG)
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white line-clamp-2">
              {homeTeam?.name || match.teamHomePlaceholder || 'Tim Home'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {homeTeam?.contingent || 'Kontingen'}
            </p>
          </div>

          {/* Huge Number */}
          <div className="my-6 text-center">
            <div className="font-mono text-8xl font-black text-amber-400 tracking-tight tabular-nums select-none">
              {homeScore}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => addPoint('HOME')}
              disabled={match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION'}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-2xl rounded-xl shadow-lg active:scale-95 transition-all select-none"
            >
              +1 POIN
            </button>

            <button
              onClick={() => deductPoint('HOME')}
              disabled={match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION'}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Koreksi (-1 Poin)
            </button>
          </div>
        </div>

        {/* Team Away Card */}
        <div
          className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all ${
            match.serviceSide === 'AWAY'
              ? 'border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/5'
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                REGU B (PENANTANG)
              </span>
              {match.serviceSide === 'AWAY' && (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  GILIRAN SERVIS (TEKONG)
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white line-clamp-2">
              {awayTeam?.name || match.teamAwayPlaceholder || 'Tim Away'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {awayTeam?.contingent || 'Kontingen'}
            </p>
          </div>

          {/* Huge Number */}
          <div className="my-6 text-center">
            <div className="font-mono text-8xl font-black text-amber-400 tracking-tight tabular-nums select-none">
              {awayScore}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => addPoint('AWAY')}
              disabled={match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION'}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-2xl rounded-xl shadow-lg active:scale-95 transition-all select-none"
            >
              +1 POIN
            </button>

            <button
              onClick={() => deductPoint('AWAY')}
              disabled={match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION'}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Koreksi (-1 Poin)
            </button>
          </div>
        </div>
      </div>

      {/* Sets Recap Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
          Rekap Skor Tiap Set:
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {Array.from({ length: reg.numberOfSets }).map((_, idx) => {
            const setObj = existingSets.find((s) => s.setNumber === idx + 1);
            return (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block font-semibold">SET {idx + 1}</span>
                <span className="font-mono text-base font-bold text-white mt-1 block">
                  {setObj ? `${setObj.homeScore} - ${setObj.awayScore}` : '-'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {setObj?.isFinished
                    ? setObj.winnerSide === 'HOME'
                      ? 'Dimenangkan Tuan Rumah'
                      : 'Dimenangkan Penantang'
                    : 'Belum Selesai'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referee Controls Bottom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleServiceSide(match.id)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
          >
            Pindah Servis Manual
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLockSet}
            disabled={match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION'}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kunci Set {currentSet}</span>
          </button>

          <button
            onClick={handleSubmitMatch}
            disabled={match.status === 'COMPLETED' || match.status === 'AWAITING_VERIFICATION'}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Pengesahan Hasil</span>
          </button>
        </div>
      </div>

      {/* Modal Catatan Wasit */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Catatan Pertandingan Wasit</span>
            </h3>

            <p className="text-xs text-slate-400">
              Tuliskan peristiwa khusus, kartu kuning/merah, pergantian pemain, atau protes teknis untuk disertakan pada laporan resmi:
            </p>

            <textarea
              rows={4}
              value={refereeNotes}
              onChange={(e) => setRefereeNotes(e.target.value)}
              placeholder="Contoh: Terjadi deuce di set 2. Kartu kuning diberikan kepada pemain no 7 tim tamu karena mengulur waktu servis."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Tutup & Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

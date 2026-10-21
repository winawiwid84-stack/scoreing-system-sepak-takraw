import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { UserCheck, Shield, MapPin, Calendar, Award, CheckCircle } from 'lucide-react';

export const AthleteDashboard: React.FC = () => {
  const { currentUser, teams, categories, matches } = useTournament();

  const myTeam = teams.find((t) => t.id === currentUser.teamId) || teams[0];
  const category = categories.find((c) => c.id === myTeam?.categoryId);

  const myMatches = matches.filter(
    (m) => m.teamHomeId === myTeam?.id || m.teamAwayId === myTeam?.id
  );

  const playerInfo = currentUser.playerInfo || {
    jerseyNumber: 1,
    position: 'Tekong',
    birthDate: '2014-05-12',
    identityNumber: '3273011205140001',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Athlete Header */}
      <div className="bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-900/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Portal Atlet Terdaftar</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">{currentUser.fullName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Atlet Regu {myTeam ? myTeam.name : '-'} · {category?.name || 'Kategori Kadet'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Status: Atlet Disetujui</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Digital Athlete ID Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-800/40 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="w-32 h-32 text-purple-400" />
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                KARTU IDENTITAS ATLET (KTA)
              </span>
              <span className="font-mono text-[10px] text-slate-400">PSTI-2026-JR</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-mono font-black text-white text-3xl shadow-lg">
                {playerInfo.jerseyNumber}
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {currentUser.fullName}
                </h3>
                <span className="text-xs font-bold text-purple-300 block mt-0.5">
                  {playerInfo.position}
                </span>
                <span className="text-[11px] text-slate-400 block">{myTeam?.name}</span>
              </div>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">NISN/NIK:</span>
                <span className="font-mono text-white">{playerInfo.identityNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal Lahir:</span>
                <span className="text-white">{playerInfo.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kontingen:</span>
                <span className="text-white">{myTeam?.contingent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slot Grup:</span>
                <span className="font-mono font-bold text-amber-400">
                  {myTeam?.groupSlotCode || 'Pool A'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">
              Disahkan Panitia Kejuaraan Sepak Takraw 2026
            </span>
          </div>
        </div>

        {/* Schedule & Results */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white">Jadwal Tanding Regu Saya</h2>

          {myMatches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Belum ada jadwal pertandingan yang diagendakan.
            </div>
          ) : (
            <div className="space-y-3">
              {myMatches.map((m) => {
                const isHome = m.teamHomeId === myTeam?.id;
                const oppId = isHome ? m.teamAwayId : m.teamHomeId;
                const oppName =
                  teams.find((t) => t.id === oppId)?.name ||
                  (isHome ? m.teamAwayPlaceholder : m.teamHomePlaceholder) ||
                  'Lawan';

                return (
                  <div
                    key={m.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-mono font-bold text-amber-400">{m.matchCode}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-300">{m.stage.replace('_', ' ')}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Lawan: <span className="text-amber-300">{oppName}</span>
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>
                          {m.scheduledDate} · {m.scheduledTime} WIB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Skor Set</span>
                        <span className="font-mono text-base font-bold text-amber-400">
                          {isHome
                            ? `${m.homeSetsWon} - ${m.awaySetsWon}`
                            : `${m.awaySetsWon} - ${m.homeSetsWon}`}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : m.status === 'ON_GOING'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

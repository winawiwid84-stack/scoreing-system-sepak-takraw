import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Shuffle, Lock, Unlock, CheckCircle, AlertTriangle, Users, Printer } from 'lucide-react';

export const DrawingManager: React.FC = () => {
  const {
    categories,
    teams,
    groups,
    currentUser,
    executeRandomDraw,
    setManualSlot,
    lockDraw,
    unlockDraw,
  } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [unlockReason, setUnlockReason] = useState<string>('');
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [isDrawingAnimation, setIsDrawingAnimation] = useState<boolean>(false);

  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const catGroups = groups.filter((g) => g.categoryId === activeCategory?.id);

  // Eligible teams (APPROVED only)
  const approvedTeams = teams.filter(
    (t) => t.categoryId === activeCategory?.id && t.registrationStatus === 'APPROVED'
  );

  const handleStartDraw = () => {
    if (activeCategory.isDrawLocked) {
      alert('Pengundian sedang dikunci!');
      return;
    }
    setIsDrawingAnimation(true);
    setTimeout(() => {
      executeRandomDraw(activeCategory.id);
      setIsDrawingAnimation(false);
    }, 1200);
  };

  const handleLock = () => {
    if (confirm('Kunci hasil pengundian dan publikasikan ke seluruh peserta?')) {
      lockDraw(activeCategory.id, currentUser.fullName);
    }
  };

  const handleConfirmUnlock = () => {
    if (!unlockReason.trim()) {
      alert('Alasan pembukaan kunci wajib dicantumkan untuk catatan audit panitia!');
      return;
    }
    unlockDraw(activeCategory.id, currentUser.fullName, unlockReason);
    setUnlockReason('');
    setShowUnlockModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Category selector & Lock Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-amber-400" />
            <span>Pengundian Pool & Pembagian Grup (Drawing)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Penempatan tim ke dalam slot (A1, A2, B1, dst.) secara acak transparan atau penempatan manual oleh admin.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeCategory?.id === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lock / Unlock State Warning */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          activeCategory.isDrawLocked
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {activeCategory.isDrawLocked ? (
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Unlock className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <span className="font-bold block">
              {activeCategory.isDrawLocked
                ? 'Status: Pengundian Telah Dikunci & Dipublikasikan'
                : 'Status: Pengundian Terbuka (Belum Dikunci)'}
            </span>
            <span className="text-[11px] text-slate-400">
              {activeCategory.isDrawLocked
                ? `Dikunci oleh ${activeCategory.drawLockedBy || 'Admin'} pada ${
                    activeCategory.drawLockedAt
                      ? new Date(activeCategory.drawLockedAt).toLocaleString('id-ID')
                      : '-'
                  }`
                : 'Anda dapat menjalankan undian acak otomatis atau mengubah slot tim secara manual.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCategory.isDrawLocked ? (
            <button
              onClick={() => setShowUnlockModal(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-xs transition-colors"
            >
              Buka Kunci Undian
            </button>
          ) : (
            <>
              <button
                onClick={handleStartDraw}
                disabled={isDrawingAnimation || approvedTeams.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isDrawingAnimation ? 'animate-spin' : ''}`} />
                <span>{isDrawingAnimation ? 'Mengundi Slot...' : 'Jalankan Undian Acak'}</span>
              </button>

              <button
                onClick={handleLock}
                disabled={catGroups.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Undian</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Eligible Teams Info Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Users className="w-4 h-4 text-amber-400" />
          <span>
            Total Regu Terverifikasi (APPROVED):{' '}
            <strong className="text-white font-mono">{approvedTeams.length}</strong> dari{' '}
            {activeCategory.maxTeams} kuota maksimal.
          </span>
        </div>

        <div className="text-slate-400 text-[11px]">
          Target: {activeCategory.groupCount} Grup (A, B, C, D)
        </div>
      </div>

      {/* Groups Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {catGroups.map((group) => {
          const groupTeams = teams.filter((t) => group.teamIds.includes(t.id));

          return (
            <div
              key={group.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {group.name}
                    </span>
                    <h3 className="font-bold text-white text-xs">POOL / GRUP {group.name}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {groupTeams.length} Regu
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  {groupTeams.map((team, idx) => (
                    <div
                      key={team.id}
                      className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px]">
                          {team.groupSlotCode || `${group.name}${idx + 1}`}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            <span>{team.name}</span>
                            {team.checkInStatus === 'HADIR' && (
                              <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                                Hadir
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{team.contingent}</div>
                        </div>
                      </div>

                      {/* Slot selector if unlocked */}
                      {!activeCategory.isDrawLocked && (
                        <select
                          value={team.groupSlotCode || ''}
                          onChange={(e) =>
                            setManualSlot(activeCategory.id, team.id, e.target.value)
                          }
                          className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded px-1.5 py-1 focus:outline-none"
                        >
                          <option value="A1">A1</option>
                          <option value="A2">A2</option>
                          <option value="A3">A3</option>
                          <option value="B1">B1</option>
                          <option value="B2">B2</option>
                          <option value="B3">B3</option>
                          <option value="C1">C1</option>
                          <option value="C2">C2</option>
                          <option value="C3">C3</option>
                          <option value="D1">D1</option>
                          <option value="D2">D2</option>
                          <option value="D3">D3</option>
                        </select>
                      )}
                    </div>
                  ))}

                  {groupTeams.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-xs italic">
                      Slot grup kosong.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
                Top 2 Maju ke Perempat Final
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Buka Kunci */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Buka Kunci Pengundian Grup</span>
            </h3>

            <p className="text-xs text-slate-300">
              Membuka kunci pengundian yang sudah dipublikasikan memerlukan alasan resmi tertulis yang akan dicatat di dalam Log Audit Panitia:
            </p>

            <textarea
              rows={3}
              required
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              placeholder="Contoh: Kesepakatan teknis perwakilan manajer tim karena ada perubahan kuota kontingen."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-md"
              >
                Konfirmasi Buka Kunci
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

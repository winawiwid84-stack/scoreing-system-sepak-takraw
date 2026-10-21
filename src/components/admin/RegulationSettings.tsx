import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { CategoryRegulation, TieBreakerRule } from '../../types';
import { Sliders, Save, CheckCircle, ShieldCheck, ArrowUp, ArrowDown } from 'lucide-react';

export const RegulationSettings: React.FC = () => {
  const { categories, updateRegulation } = useTournament();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const activeCategory = categories.find((c) => c.id === selectedCatId) || categories[0];

  const reg = activeCategory?.regulation;

  // Local state for editing regulation
  const [numberOfSets, setNumberOfSets] = useState<number>(reg?.numberOfSets || 3);
  const [targetPointsPerSet, setTargetPointsPerSet] = useState<number>(reg?.targetPointsPerSet || 21);
  const [deuceEnabled, setDeuceEnabled] = useState<boolean>(reg?.deuceEnabled ?? true);
  const [deuceMaxPoints, setDeuceMaxPoints] = useState<number>(reg?.deuceMaxPoints || 25);
  const [tiebreakPoints, setTiebreakPoints] = useState<number>(reg?.tiebreakPoints || 21);
  const [bronzeMatchFormat, setBronzeMatchFormat] = useState<'MATCH' | 'SHARED'>(
    reg?.bronzeMatchFormat || 'MATCH'
  );
  const [pointsWin, setPointsWin] = useState<number>(reg?.pointsWin || 2);
  const [pointsLoss, setPointsLoss] = useState<number>(reg?.pointsLoss || 0);
  const [tieBreakers, setTieBreakers] = useState<TieBreakerRule[]>(
    reg?.tieBreakerOrder || ['POINTS', 'HEAD_TO_HEAD', 'SET_DIFFERENCE', 'POINT_DIFFERENCE']
  );

  // Sync state when category changes
  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setNumberOfSets(cat.regulation.numberOfSets);
      setTargetPointsPerSet(cat.regulation.targetPointsPerSet);
      setDeuceEnabled(cat.regulation.deuceEnabled);
      setDeuceMaxPoints(cat.regulation.deuceMaxPoints);
      setTiebreakPoints(cat.regulation.tiebreakPoints);
      setBronzeMatchFormat(cat.regulation.bronzeMatchFormat);
      setPointsWin(cat.regulation.pointsWin);
      setPointsLoss(cat.regulation.pointsLoss);
      setTieBreakers(cat.regulation.tieBreakerOrder);
    }
  };

  const moveTieBreaker = (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...tieBreakers];
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setTieBreakers(list);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;

    updateRegulation(activeCategory.id, {
      numberOfSets: Number(numberOfSets),
      targetPointsPerSet: Number(targetPointsPerSet),
      deuceEnabled,
      deuceMaxPoints: Number(deuceMaxPoints),
      tiebreakPoints: Number(tiebreakPoints),
      bronzeMatchFormat,
      pointsWin: Number(pointsWin),
      pointsLoss: Number(pointsLoss),
      tieBreakerOrder: tieBreakers,
    });

    alert(
      `Regulasi untuk kategori ${activeCategory.name} berhasil diperbarui dan diterapkan ke seluruh sistem klasemen & scoring!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Category Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Pengaturan Regulasi & Format Pertandingan Dinamis</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sesuaikan aturan set, poin deuce, penentuan juara 3, dan urutan tie-breaker klasemen sesuai mandat panitia.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
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

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Set & Point Rules Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            1. Aturan Skor Set & Deuce ISTAF
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Format Jumlah Set
              </label>
              <select
                value={numberOfSets}
                onChange={(e) => setNumberOfSets(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value={3}>Best of 3 (Maksimal 3 Set)</option>
                <option value={5}>Best of 5 (Maksimal 5 Set)</option>
                <option value={1}>1 Set Tunggal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Poin per Set
              </label>
              <input
                type="number"
                min="10"
                max="30"
                value={targetPointsPerSet}
                onChange={(e) => setTargetPointsPerSet(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Standar ISTAF 2024: 21 (atau 15)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Aturan Deuce (Jeda 2 Poin)
              </label>
              <select
                value={deuceEnabled ? 'YES' : 'NO'}
                onChange={(e) => setDeuceEnabled(e.target.value === 'YES')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="YES">Aktif (Wajib Selisih 2)</option>
                <option value="NO">Nonaktif (Sudden Death)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Batas Maksimal Deuce (Cap)
              </label>
              <input
                type="number"
                min="15"
                max="35"
                value={deuceMaxPoints}
                onChange={(e) => setDeuceMaxPoints(Number(e.target.value))}
                disabled={!deuceEnabled}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono disabled:opacity-40"
              />
              <span className="text-[10px] text-slate-500">Maksimum batas deuce, misal: 25</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Poin Set Penentu (Tiebreak Set 3)
            </label>
            <input
              type="number"
              min="10"
              max="25"
              value={tiebreakPoints}
              onChange={(e) => setTiebreakPoints(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Bronze Match & Standings Point Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            2. Format Juara 3 & Bobot Poin Klasemen
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ketentuan Penetapan Juara 3
            </label>
            <select
              value={bronzeMatchFormat}
              onChange={(e) => setBronzeMatchFormat(e.target.value as 'MATCH' | 'SHARED')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="MATCH">
                Melalui Pertandingan Perebutan Tempat Ketiga (Bronze Final)
              </option>
              <option value="SHARED">
                Dua Juara 3 Bersama (Kedua tim kalah Semifinal meraih Perunggu)
              </option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Poin Kemenangan Klasemen
              </label>
              <input
                type="number"
                value={pointsWin}
                onChange={(e) => setPointsWin(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Standar: 2 poin</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Poin Kekalahan Klasemen
              </label>
              <input
                type="number"
                value={pointsLoss}
                onChange={(e) => setPointsLoss(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-slate-500">Standar: 0 poin</span>
            </div>
          </div>
        </div>

        {/* Tie-Breaker Ordering (Full Width) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              3. Urutan Prioritas Pemecah Seri (Tie-Breaker Hierarchy)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Jika dua tim atau lebih memiliki poin yang sama di klasemen grup, sistem secara otomatis mengevaluasi berdasarkan urutan prioritas di bawah ini:
            </p>
          </div>

          <div className="space-y-2">
            {tieBreakers.map((rule, idx) => (
              <div
                key={rule}
                className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white">
                    {rule === 'POINTS' && 'Poin Klasemen Tertinggi'}
                    {rule === 'HEAD_TO_HEAD' && 'Hasil Pertemuan Langsung (Head-to-Head)'}
                    {rule === 'SET_DIFFERENCE' && 'Selisih Set (Set Menang - Set Kalah)'}
                    {rule === 'SET_RATIO' && 'Rasio Set (Set Menang / Set Kalah)'}
                    {rule === 'POINT_DIFFERENCE' && 'Selisih Poin Angka (Poin Masuk - Poin Kebobolan)'}
                    {rule === 'POINT_RATIO' && 'Rasio Poin Angka'}
                    {rule === 'MANUAL_DECISION' && 'Keputusan Undian / Panitia Teknis'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveTieBreaker(idx, 'UP')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === tieBreakers.length - 1}
                    onClick={() => moveTieBreaker(idx, 'DOWN')}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Terapkan Regulasi</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

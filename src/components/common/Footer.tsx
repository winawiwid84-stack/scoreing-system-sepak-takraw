import React from 'react';
import { Trophy, Shield, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-8 px-4 sm:px-6 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            ST
          </div>
          <span className="text-white font-semibold">
            Sistem Scoring & Manajemen Turnamen Sepak Takraw
          </span>
        </div>

        <div className="text-center md:text-right text-[11px] space-y-1">
          <p>
            Mendukung Regulasi Resmi Federasi Sepaktakraw Internasional (ISTAF) & Pengprov/Pengcab PSTI.
          </p>
          <p className="text-slate-500">
            Hak Cipta © 2026 Panitia Pelaksana Kejuaraan Sepak Takraw. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { UserRole } from '../../types';
import {
  Trophy,
  Shield,
  Clock,
  ClipboardList,
  UserCheck,
  Globe,
  RotateCcw,
  BookOpen,
  ChevronDown,
  User,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenGuide: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenGuide,
  onOpenAuth,
}) => {
  const {
    currentUser,
    switchRole,
    resetToDemoData,
    isFirebaseConnected,
    isProductionMode,
    setIsProductionMode,
  } = useTournament();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'ADMIN', label: 'Admin / Pengcab', icon: Shield, color: 'text-amber-400' },
    { role: 'WASIT', label: 'Wasit Pertandingan', icon: Clock, color: 'text-emerald-400' },
    { role: 'PELATIH', label: 'Pelatih / Manajer', icon: ClipboardList, color: 'text-blue-400' },
    { role: 'ATLET', label: 'Atlet Peserta', icon: UserCheck, color: 'text-purple-400' },
    { role: 'UMUM', label: 'Umum / Publik', icon: Globe, color: 'text-slate-300' },
  ];

  const currentRoleObj = roles.find((r) => r.role === currentUser.role) || roles[0];
  const CurrentIcon = currentRoleObj.icon;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Bar: Adaptive between Official Production vs Testing Mode */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        {isProductionMode ? (
          /* Official Production Header Banner */
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistem Resmi PSTI Kota Bandung
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">·</span>
              <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">
                GOR Lodaya Bandung
              </span>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[11px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFirebaseConnected ? 'bg-emerald-400' : 'bg-emerald-500'
                }`}
              ></span>
              <span className="text-slate-400">Database:</span>
              <span className="text-emerald-400 font-medium">Cloud Firestore Online</span>
            </div>
          </div>
        ) : (
          /* Demo Simulation Warning & Production Mode Activator */
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                Mode Demo / Simulasi:
              </span>
              <span className="font-medium text-white">{currentRoleObj.label}</span>
              <span className="text-slate-400 hidden sm:inline">({currentUser.fullName})</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[11px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFirebaseConnected ? 'bg-emerald-400' : 'bg-emerald-500'
                }`}
              ></span>
              <span className="text-slate-400">Firebase:</span>
              <span className="text-emerald-400 font-medium">Online</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isProductionMode ? (
            /* In Production Mode: clean, official role badge and admin mode toggle */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 rounded-md text-[11px] text-slate-300">
                <CurrentIcon className={`w-3 h-3 ${currentRoleObj.color}`} />
                <span className="font-semibold text-white">{currentUser.fullName}</span>
                <span className="text-slate-400">({currentUser.role})</span>
              </div>

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    if (confirm('Beralih sementara ke Mode Uji Coba (Demo)?')) {
                      setIsProductionMode(false);
                    }
                  }}
                  title="Kembali ke mode uji coba"
                  className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 rounded transition-colors"
                >
                  Mode Uji Coba
                </button>
              )}
            </div>
          ) : (
            /* In Demo Mode: Role selector, Demo Reset, and One-Click Activate Production */
            <>
              <button
                onClick={() => {
                  if (
                    confirm(
                      'Aktifkan Mode Produksi Resmi? (Bilah demo dan login 1-klik akan disembunyikan untuk keperluan turnamen resmi)'
                    )
                  ) {
                    setIsProductionMode(true);
                  }
                }}
                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-md text-xs font-bold transition-all"
              >
                🚀 Beralih ke Mode Resmi
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  <span>Ganti Role Demo</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Pilih Hak Akses Pengguna
                    </div>
                    {roles.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentUser.role === item.role;
                      return (
                        <button
                          key={item.role}
                          onClick={() => {
                            switchRole(item.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-amber-500/10 text-amber-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (confirm('Kembalikan semua data ke sampel turnamen resmi 2026?')) {
                    resetToDemoData();
                  }
                }}
                title="Reset data ke contoh resmi"
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span className="hidden md:inline">Reset Demo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Top Navigation conforming to Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single text wordmark */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md shadow-amber-500/10 shrink-0">
            <img
              src="/assets/aistudio/logo_psti_bdg_3f5f75d3.png"
              alt="Logo PSTI Kota Bandung"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            PSTI Scoring Hub
          </span>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'home' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Portal Turnamen
          </button>

          <button
            onClick={() => setCurrentTab('jadwal')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'jadwal' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Jadwal & Skor
          </button>

          <button
            onClick={() => setCurrentTab('scoreboard')}
            className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all px-2.5 py-1 rounded-lg ${
              currentTab === 'scoreboard'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Live Scoreboard</span>
          </button>

          <button
            onClick={() => setCurrentTab('klasemen')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'klasemen' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Klasemen Grup
          </button>

          <button
            onClick={() => setCurrentTab('bagan')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'bagan' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Bagan Gugur
          </button>

          <button
            onClick={() => setCurrentTab('podium')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'podium' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Daftar Juara
          </button>

          {/* Role-specific Workspace Tab */}
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold text-xs transition-colors`}
            >
              Panel Admin
            </button>
          )}

          {currentUser.role === 'WASIT' && (
            <button
              onClick={() => setCurrentTab('wasit')}
              className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-colors`}
            >
              Meja Wasit
            </button>
          )}

          {currentUser.role === 'PELATIH' && (
            <button
              onClick={() => setCurrentTab('pelatih')}
              className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold text-xs transition-colors`}
            >
              Tim Saya
            </button>
          )}

          {currentUser.role === 'ATLET' && (
            <button
              onClick={() => setCurrentTab('atlet')}
              className={`whitespace-nowrap shrink-0 px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold text-xs transition-colors`}
            >
              Profil Atlet
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Panduan Admin</span>
          </button>

          <button
            onClick={() => setCurrentTab('auth')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md ${
              currentTab === 'auth'
                ? 'bg-white text-slate-950 ring-2 ring-amber-400'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>
              {currentUser.role === 'UMUM' && currentUser.id.startsWith('usr-guest')
                ? 'Login / Registrasi'
                : `Akun: ${currentUser.fullName.split(' ')[0]}`}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Subnavigation Strip */}
      <div className="md:hidden flex items-center overflow-x-auto gap-2 px-4 py-2 border-t border-slate-900 bg-slate-950 text-xs no-scrollbar">
        <button
          onClick={() => setCurrentTab('auth')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'auth' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400 border border-amber-500/30'
          }`}
        >
          Login & Daftar
        </button>
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'home' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          Portal
        </button>
        <button
          onClick={() => setCurrentTab('jadwal')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'jadwal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          Jadwal
        </button>
        <button
          onClick={() => setCurrentTab('scoreboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'scoreboard'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-amber-300 border border-amber-500/30'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>Scoreboard (Split/Full)</span>
        </button>
        <button
          onClick={() => setCurrentTab('klasemen')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'klasemen' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          Klasemen
        </button>
        <button
          onClick={() => setCurrentTab('bagan')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'bagan' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          Bagan
        </button>
        <button
          onClick={() => setCurrentTab('podium')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentTab === 'podium' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
          }`}
        >
          Juara
        </button>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'admin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-400 border border-amber-500/30'
            }`}
          >
            Admin
          </button>
        )}
        {currentUser.role === 'WASIT' && (
          <button
            onClick={() => setCurrentTab('wasit')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'wasit' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-emerald-400 border border-emerald-500/30'
            }`}
          >
            Scoring Wasit
          </button>
        )}
        {currentUser.role === 'PELATIH' && (
          <button
            onClick={() => setCurrentTab('pelatih')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'pelatih' ? 'bg-blue-500 text-slate-950 font-bold' : 'text-blue-400 border border-blue-500/30'
            }`}
          >
            Tim Pelatih
          </button>
        )}
        {currentUser.role === 'ATLET' && (
          <button
            onClick={() => setCurrentTab('atlet')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
              currentTab === 'atlet' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-purple-400 border border-purple-500/30'
            }`}
          >
            Profil Atlet
          </button>
        )}
      </div>
    </header>
  );
};

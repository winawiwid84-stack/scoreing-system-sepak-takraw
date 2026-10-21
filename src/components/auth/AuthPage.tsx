import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { UserRole } from '../../types';
import {
  Shield,
  LogIn,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  UserCheck,
  ClipboardList,
  Globe,
  Sparkles,
  ArrowRight,
  LogOut,
  Search,
} from 'lucide-react';

interface AuthPageProps {
  onNavigateTab: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    users,
    login,
    logout,
    registerAccount,
    resetPassword,
    checkAccountStatus,
    loginWithGoogle,
    logoutFirebase,
    isFirebaseConnected,
    firebaseAuthEmail,
    isProductionMode,
    setIsProductionMode,
  } = useTournament();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    setLoginSuccess('');
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginSuccess(res.message);
      setTimeout(() => {
        if (res.user?.role === 'ADMIN') onNavigateTab('admin');
        else if (res.user?.role === 'WASIT') onNavigateTab('wasit');
        else if (res.user?.role === 'PELATIH') onNavigateTab('pelatih');
        else if (res.user?.role === 'ATLET') onNavigateTab('atlet');
        else onNavigateTab('home');
      }, 700);
    }
  };

  const isGuest = currentUser.role === 'UMUM' && currentUser.id.startsWith('usr-guest');
  const isLoggedIn = !isGuest && currentUser.id;

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'status'>(
    isLoggedIn ? 'login' : 'login'
  );

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('PELATIH');
  const [regLicense, setRegLicense] = useState('');
  const [regContingent, setRegContingent] = useState('Kota Bandung');
  const [regJersey, setRegJersey] = useState<number>(1);
  const [regPosition, setRegPosition] = useState<'Tekong' | 'Apit Kanan (Feeder)' | 'Apit Kiri (Killer/Striker)'>('Tekong');
  const [regNik, setRegNik] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('2014-05-12');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Check Status State
  const [statusEmail, setStatusEmail] = useState('');
  const [foundAccountStatus, setFoundAccountStatus] = useState<any | null>(null);

  // Quick Demo Logins
  const demoAccounts = [
    {
      role: 'ADMIN',
      label: 'Admin Pengcab PSTI',
      email: 'admin@psti.id',
      pass: 'admin123',
      name: 'Drs. Budi Santoso',
      icon: Shield,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      tabRedirect: 'admin',
    },
    {
      role: 'WASIT',
      label: 'Wasit Nasional',
      email: 'wasit1@psti.id',
      pass: 'wasit123',
      name: 'Hendra Wijaya, S.Pd',
      icon: Clock,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      tabRedirect: 'wasit',
    },
    {
      role: 'PELATIH',
      label: 'Pelatih Kontingen',
      email: 'pelatih@buahbatu.sch.id',
      pass: 'pelatih123',
      name: 'Ahmad Fauzi',
      icon: ClipboardList,
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      tabRedirect: 'pelatih',
    },
    {
      role: 'ATLET',
      label: 'Atlet Peserta',
      email: 'atlet@buahbatu.sch.id',
      pass: 'atlet123',
      name: 'Rizky Pratama',
      icon: UserCheck,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      tabRedirect: 'atlet',
    },
    {
      role: 'UMUM',
      label: 'Pengunjung Umum',
      email: 'umum@psti.id',
      pass: 'umum123',
      name: 'Masyarakat Umum',
      icon: Globe,
      color: 'text-slate-300 border-slate-700 bg-slate-800',
      tabRedirect: 'home',
    },
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    const res = login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      setLoginSuccess(res.message);
      setTimeout(() => {
        if (res.user?.role === 'ADMIN') onNavigateTab('admin');
        else if (res.user?.role === 'WASIT') onNavigateTab('wasit');
        else if (res.user?.role === 'PELATIH') onNavigateTab('pelatih');
        else if (res.user?.role === 'ATLET') onNavigateTab('atlet');
        else onNavigateTab('home');
      }, 700);
    }
  };

  const handleQuickLogin = (acc: (typeof demoAccounts)[0]) => {
    setLoginEmail(acc.email);
    setLoginPassword(acc.pass);
    const res = login(acc.email, acc.pass);
    if (res.success) {
      setLoginSuccess(res.message);
      setTimeout(() => onNavigateTab(acc.tabRedirect), 500);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Kata sandi minimal harus 6 karakter!');
      return;
    }

    const payload: any = {
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      role: regRole,
    };

    if (regRole === 'WASIT') {
      payload.licenseNumber = regLicense || 'PSTI-WAS-DAE-' + Math.floor(1000 + Math.random() * 9000);
    } else if (regRole === 'PELATIH') {
      payload.contingentName = regContingent;
    } else if (regRole === 'ATLET') {
      payload.contingentName = regContingent;
      payload.playerInfo = {
        jerseyNumber: Number(regJersey),
        position: regPosition,
        birthDate: regBirthDate,
        identityNumber: regNik,
      };
    }

    const res = registerAccount(payload);
    if (!res.success) {
      setRegError(res.message);
    } else {
      setRegSuccess(res.message);
      if (res.user?.isApproved) {
        setTimeout(() => {
          if (regRole === 'ADMIN') onNavigateTab('admin');
          else onNavigateTab('home');
        }, 1000);
      }
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail || !newPassword) return;

    if (newPassword.length < 6) {
      setForgotMsg({ text: 'Kata sandi baru minimal 6 karakter!', isError: true });
      return;
    }

    const res = resetPassword(forgotEmail, newPassword);
    setForgotMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setLoginEmail(forgotEmail);
      setLoginPassword(newPassword);
      setTimeout(() => setActiveTab('login'), 1200);
    }
  };

  const handleCheckStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const found = checkAccountStatus(statusEmail);
    setFoundAccountStatus(found || 'NOT_FOUND');
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-8 animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-2 shadow-xl shadow-amber-500/10 border border-slate-700 mx-auto">
          <img
            src="/assets/aistudio/logo_psti_bdg_3f5f75d3.png"
            alt="Logo PSTI Kota Bandung"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PSTI Kota Bandung · Portal Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
            Sistem Autentikasi Terintegrasi untuk Panitia Pengcab, Wasit Pertandingan, Pelatih, Atlet, dan Pengunjung Umum.
          </p>
        </div>
      </div>

      {/* If already logged in, show active session banner */}
      {isLoggedIn && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-lg border border-amber-500/30">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{currentUser.fullName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentUser.role === 'ADMIN') onNavigateTab('admin');
                else if (currentUser.role === 'WASIT') onNavigateTab('wasit');
                else if (currentUser.role === 'PELATIH') onNavigateTab('pelatih');
                else if (currentUser.role === 'ATLET') onNavigateTab('atlet');
                else onNavigateTab('home');
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Buka Dashboard {currentUser.role}
            </button>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Auth Card Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-4 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
                setLoginSuccess('');
              }}
              className={`py-2.5 rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk (Login)
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setRegError('');
                setRegSuccess('');
              }}
              className={`py-2.5 rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Akun
            </button>

            <button
              onClick={() => {
                setActiveTab('forgot');
                setForgotMsg(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                activeTab === 'forgot'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lupa Sandi
            </button>

            <button
              onClick={() => {
                setActiveTab('status');
                setFoundAccountStatus(null);
              }}
              className={`py-2.5 rounded-xl transition-all ${
                activeTab === 'status'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cek Status
            </button>
          </div>

          {/* TAB 1: FORM LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-amber-400" />
                  <span>Masuk ke Akun Anda</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan email dan kata sandi akun resmi Anda atau gunakan login Google Firebase.
                </p>
              </div>

              {/* Cloud DB Status Card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className="text-slate-300 font-medium">Cloud Database:</span>
                  <span className="text-amber-400 font-semibold">Firebase Firestore</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">gifted-cascade-4t3g1</span>
              </div>

              {/* Google Firebase Login Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google (Firebase Auth)'}</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">atau dengan akun terdaftar</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Pengguna
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@psti.id atau email@sekolah.sch.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Kata Sandi (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi Anda"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 mt-2 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Belum memiliki akun? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Daftar Akun Baru
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: FORM REGISTRASI */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>Pendaftaran Akun Peserta & Panitia</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Pilih hak akses sesuai peruntukan Anda dalam penyelenggaraan kejuaraan.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Cecep Hidayat, M.Pd"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Aktif
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@sekolah.sch.id"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+62 812-3456-7890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Role Selector Card */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Peran / Hak Akses yang Diajukan (Role)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { role: 'PELATIH', label: 'Pelatih / Manajer', desc: 'Daftar & kelola regu' },
                      { role: 'WASIT', label: 'Wasit Pertandingan', desc: 'Input live scoring' },
                      { role: 'ATLET', label: 'Atlet Peserta', desc: 'Kartu digital KTA' },
                      { role: 'UMUM', label: 'Pengunjung Umum', desc: 'Lihat info publik' },
                      { role: 'ADMIN', label: 'Admin / Pengcab', desc: 'Penyelenggara turnamen' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setRegRole(item.role as UserRole)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          regRole === item.role
                            ? 'bg-amber-500/10 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="block font-bold text-xs text-amber-300">{item.label}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Specific Fields */}
                {regRole === 'WASIT' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-emerald-400">
                      Nomor Lisensi Wasit PSTI (Bila Ada)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PSTI-WAS-NAS-2025-012"
                      value={regLicense}
                      onChange={(e) => setRegLicense(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                {(regRole === 'PELATIH' || regRole === 'ATLET') && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-blue-400">
                      Asal Sekolah / Klub / Kontingen
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="misal: SMPN 39 BANDUNG / SDN 163"
                      value={regContingent}
                      onChange={(e) => setRegContingent(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                {regRole === 'ATLET' && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                          Posisi Sepak Takraw
                        </label>
                        <select
                          value={regPosition}
                          onChange={(e: any) => setRegPosition(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                        >
                          <option value="Tekong">Tekong (Servis)</option>
                          <option value="Apit Kanan (Feeder)">Apit Kanan (Feeder)</option>
                          <option value="Apit Kiri (Killer/Striker)">Apit Kiri (Killer)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                          Nomor Punggung
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={regJersey}
                          onChange={(e) => setRegJersey(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                          NISN / NIK Atlet
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="3273..."
                          value={regNik}
                          onChange={(e) => setRegNik(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          required
                          value={regBirthDate}
                          onChange={(e) => setRegBirthDate(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 6 karakter"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Konfirmasi Sandi
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ulangi kata sandi"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Approval Notice */}
                {(regRole === 'WASIT' || regRole === 'PELATIH') && (
                  <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                    <span className="font-bold block mb-0.5">Catatan Persetujuan Panitia:</span>
                    Role {regRole} memiliki hak akses pencatatan dan pengelolaan resmi. Akun akan ditinjau dan disetujui terlebih dahulu oleh Admin Pengcab PSTI sebelum dapat aktif.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95 mt-2 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftarkan Akun Sekarang</span>
              </button>
            </form>
          )}

          {/* TAB 3: LUPA KATA SANDI */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Pemulihan Kata Sandi</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan email akun yang terdaftar untuk membuat kata sandi baru.
                </p>
              </div>

              {forgotMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    forgotMsg.isError
                      ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  }`}
                >
                  {forgotMsg.isError ? (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>{forgotMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@instansi.id"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95"
              >
                Setel Ulang Kata Sandi
              </button>
            </form>
          )}

          {/* TAB 4: CEK STATUS AKUN */}
          {activeTab === 'status' && (
            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-amber-400" />
                  <span>Cek Status Verifikasi Akun</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Cari tahu apakah akun Wasit atau Pelatih Anda telah disahkan oleh Admin Pengcab PSTI.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Masukkan email Anda..."
                  value={statusEmail}
                  onChange={(e) => setStatusEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Periksa
                </button>
              </div>

              {foundAccountStatus === 'NOT_FOUND' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                  Email tidak terdaftar di pangkalan data turnamen.
                </div>
              )}

              {foundAccountStatus && foundAccountStatus !== 'NOT_FOUND' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{foundAccountStatus.fullName}</h4>
                      <span className="text-xs text-slate-400">{foundAccountStatus.email}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        foundAccountStatus.isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {foundAccountStatus.isApproved ? 'Disetujui & Aktif' : 'Menunggu Approval Panitia'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 border-t border-slate-900 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Peran:</span>
                      <span className="font-semibold text-amber-400">{foundAccountStatus.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kontak:</span>
                      <span>{foundAccountStatus.phone || '-'}</span>
                    </div>
                  </div>

                  {foundAccountStatus.isApproved && (
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(foundAccountStatus.email);
                        setActiveTab('login');
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg mt-1"
                    >
                      Buka Form Login Akun Ini
                    </button>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Right Column: Production Official Notice OR Quick Demo Accounts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {isProductionMode ? (
            /* Production Mode: Official PSTI System Notice */
            <div className="bg-slate-900 border border-emerald-900/50 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Sistem Resmi PSTI Kota Bandung</h3>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-xs text-emerald-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Mode Produksi Aktif (Non-Demo)
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  Sistem beroperasi untuk turnamen sesungguhnya di GOR Sepak Takraw Lodaya Bandung. Akses 1-klik tanpa kata sandi dinonaktifkan demi integritas data dan keamanan hasil pertandingan.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300 pt-1">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Admin & Panitia Pengcab</span>
                    <span className="text-[11px] text-slate-400">
                      Gunakan Google Login resmi atau email panitia yang telah disetujui.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Wasit Pertandingan</span>
                    <span className="text-[11px] text-slate-400">
                      Wajib mendaftar dengan nomor lisensi resmi dan menunggu persetujuan Admin Pengcab.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Pelatih / Manajer Regu</span>
                    <span className="text-[11px] text-slate-400">
                      Mendaftar akun kontingen untuk mengajukan formasi atlet dan memantau status verifikasi.
                    </span>
                  </div>
                </div>
              </div>

              {currentUser.role === 'ADMIN' && (
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (confirm('Beralih sementara ke Mode Uji Coba (Demo)?')) {
                        setIsProductionMode(false);
                      }
                    }}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 text-xs font-medium rounded-xl border border-slate-800 transition-colors"
                  >
                    Buka Mode Uji Coba (Simulasi Demo)
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Demo Mode: Quick Demo Login Cards */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Akses Cepat Akun Demo (1-Klik)</h3>
                </div>
                <button
                  onClick={() => setIsProductionMode(true)}
                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                >
                  Tutup Demo
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Klik salah satu akun di bawah ini untuk langsung masuk dan menguji antarmuka sistem sesuai hak aksesnya:
              </p>

              <div className="space-y-2.5">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = currentUser.email === acc.email;

                  return (
                    <button
                      key={acc.email}
                      onClick={() => handleQuickLogin(acc)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-md'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${acc.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {acc.label} · <span className="font-mono text-slate-500">{acc.email}</span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security & RBAC Guidelines */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              Keamanan & Hak Akses Berbasis Peran
            </span>
            <p className="text-[11px] leading-relaxed">
              Seluruh sesi pengguna dilindungi autentikasi token internal. Petugas lapangan (Wasit) hanya dapat mengedit partai yang ditugaskan, sementara pengesahan resmi dan pengundian dilindungi audit log permanen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

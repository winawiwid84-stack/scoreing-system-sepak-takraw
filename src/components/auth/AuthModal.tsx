import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { User, UserRole } from '../../types';
import { X, UserPlus, LogIn, Shield, CheckCircle, Clock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, setCurrentUser, registerAccount } = useTournament();
  const [activeTab, setActiveTab] = useState<'profile' | 'switch' | 'register'>('profile');

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('PELATIH');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Nama lengkap dan email wajib diisi!');
      return;
    }

    registerAccount({
      fullName,
      email,
      phone,
      role,
    });

    setFullName('');
    setEmail('');
    setPhone('');
    setActiveTab('switch');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Kelola Sesi & Hak Akses</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profil Sesi
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'switch'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ganti Akun
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Tab 1: Profil */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl border border-amber-500/30">
                {currentUser.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentUser.fullName}</h3>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-semibold text-amber-400">
                    Role: {currentUser.role}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Akun Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">ID Pengguna:</span>
                <span className="font-mono text-slate-200">{currentUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kontak:</span>
                <span className="text-slate-200">{currentUser.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Persetujuan:</span>
                <span className="text-emerald-400 font-semibold">Aktif & Disetujui</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('switch')}
              className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              Pindah ke Akun Lain
            </button>
          </div>
        )}

        {/* Tab 2: Switch User */}
        {activeTab === 'switch' && (
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            <p className="text-xs text-slate-400 mb-2">
              Pilih akun yang telah terdaftar untuk menguji antarmuka sesuai perannya:
            </p>
            {users.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    onClose();
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-sm">{u.fullName}</div>
                    <div className="text-slate-400 mt-0.5">{u.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-amber-400 text-[11px]">{u.role}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-[10px] text-slate-400">
                        {u.isApproved ? 'Disetujui' : 'Menunggu Approval'}
                      </span>
                    </div>
                  </div>
                  <LogIn className="w-4 h-4 text-slate-500" />
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Register New User */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="misal: Hendra Pratama, S.Pd"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@instansi.id"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812-..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Peran yang Diajukan (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="PELATIH">Pelatih / Manajer Tim</option>
                <option value="WASIT">Wasit Pertandingan</option>
                <option value="ATLET">Atlet Peserta</option>
                <option value="UMUM">Pengunjung Umum</option>
                <option value="ADMIN">Admin / Pengurus Cabang</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Pendaftaran untuk Wasit dan Pelatih memerlukan persetujuan Admin Turnamen.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors shadow-md mt-2"
            >
              Ajukan Pendaftaran
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

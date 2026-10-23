/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Phone,
  Clock,
  Car,
  ShieldCheck,
  Building2,
  ExternalLink,
  Info,
  CheckCircle2,
  Key,
} from 'lucide-react';

// GOR Lodaya Bandung Coordinates (PSTI Kota Bandung Center)
const VENUE_COORDINATES = { lat: -6.931215, lng: 107.618642 };

interface VenueLocationPoint {
  id: string;
  name: string;
  category: 'lapangan' | 'wasit' | 'medis' | 'fasilitas';
  coords: { lat: number; lng: number };
  description: string;
  pinColor: string;
}

const VENUE_POINTS: VenueLocationPoint[] = [
  {
    id: 'lapangan-1',
    name: 'Lapangan 1 (Court Utama)',
    category: 'lapangan',
    coords: { lat: -6.93118, lng: 107.61862 },
    description: 'Lapangan pertandingan utama inter-regu dengan karpet standar ISTAF dan video referee.',
    pinColor: '#f59e0b',
  },
  {
    id: 'lapangan-2',
    name: 'Lapangan 2 (Court B)',
    category: 'lapangan',
    coords: { lat: -6.93125, lng: 107.61866 },
    description: 'Lapangan pertandingan kedua nomor U15 dan babak penyisihan grup.',
    pinColor: '#3b82f6',
  },
  {
    id: 'meja-wasit',
    name: 'Meja Wasit & Dewan Hakim PSTI',
    category: 'wasit',
    coords: { lat: -6.93115, lng: 107.61858 },
    description: 'Pusat verifikasi skor resmi, inspeksi bola takraw, dan pengesahan berita acara.',
    pinColor: '#10b981',
  },
  {
    id: 'ruang-medis',
    name: 'Pos Medis & Fisioterapi Atlet',
    category: 'medis',
    coords: { lat: -6.9313, lng: 107.61872 },
    description: 'Penanganan cedera kram, sprain pergelangan kaki, dan tandu evakuasi.',
    pinColor: '#ef4444',
  },
  {
    id: 'parkir-kontingen',
    name: 'Area Parkir & Drop-Off Bus Kontingen',
    category: 'fasilitas',
    coords: { lat: -6.93105, lng: 107.6185 },
    description: 'Pintu gerbang masuk Jalan Lodaya untuk akses kendaraan tim kontingen.',
    pinColor: '#8b5cf6',
  },
];

export const VenueMap: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [selectedPoint, setSelectedPoint] = useState<VenueLocationPoint>(VENUE_POINTS[0]);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [customKeyInput, setCustomKeyInput] = useState<string>('');
  const [showKeyEditor, setShowKeyEditor] = useState<boolean>(false);

  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  const filteredPoints =
    filterCategory === 'all'
      ? VENUE_POINTS
      : VENUE_POINTS.filter((p) => p.category === filterCategory);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${VENUE_COORDINATES.lat},${VENUE_COORDINATES.lng}`;

  return (
    <div className="space-y-6">
      {/* Quota Banner according to Google Maps Platform skill */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm rounded-lg">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Peta & Panduan Lokasi Resmi
              </span>
              <span className="text-xs text-slate-400">Google Maps Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Gelanggang Olahraga (GOR) Lodaya Bandung
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Pusat pelaksanaan Kejuaraan Sepak Takraw PSTI. Lihat titik lapangan pertandingan, meja wasit
              dewan juri, pos medis, dan panduan navigasi kendaraan kontingen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Petunjuk Arah Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setShowKeyEditor(!showKeyEditor)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{apiKey ? 'API Key Terpasang' : 'Atur API Key Maps'}</span>
            </button>
          </div>
        </div>

        {/* Custom API Key input if needed */}
        {showKeyEditor && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400">Google Maps API Key:</span>
            <input
              type="text"
              placeholder="Masukkan API Key Google Maps..."
              value={customKeyInput}
              onChange={(e) => setCustomKeyInput(e.target.value)}
              className="flex-1 min-w-[240px] px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => {
                if (customKeyInput.trim()) {
                  setApiKey(customKeyInput.trim());
                  setShowKeyEditor(false);
                }
              }}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400"
            >
              Terapkan Key
            </button>
          </div>
        )}
      </div>

      {/* Main Map & Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Map Container */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* Map Sub-Header Controls */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Filter Titik:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'lapangan', label: 'Lapangan' },
                  { id: 'wasit', label: 'Wasit & Hakim' },
                  { id: 'medis', label: 'Medis' },
                  { id: 'fasilitas', label: 'Fasilitas' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterCategory(item.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      filterCategory === item.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-400">
              Koordinat: <span className="text-amber-400 font-mono">-6.931215, 107.618642</span>
            </div>
          </div>

          {/* Interactive Map View with Explicit Height avoiding CF2 */}
          <div className="relative w-full h-[480px] bg-slate-950">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultCenter={VENUE_COORDINATES}
                  defaultZoom={18}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  className="w-full h-full"
                >
                  {filteredPoints.map((pt) => (
                    <AdvancedMarker
                      key={pt.id}
                      position={pt.coords}
                      title={pt.name}
                      onClick={() => setSelectedPoint(pt)}
                    >
                      <Pin
                        background={pt.pinColor}
                        borderColor="#ffffff"
                        glyphColor="#ffffff"
                      />
                    </AdvancedMarker>
                  ))}
                </Map>
              </APIProvider>
            ) : (
              /* Fallback Interactive Embed / Satellite View if API key is in setup */
              <div className="w-full h-full relative">
                <iframe
                  title="Peta GOR Lodaya Bandung"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=-6.931215,107.618642&z=17&output=embed`}
                ></iframe>

                {/* Overlay helper banner */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-xl text-xs text-slate-200 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Komplek Olahraga Lodaya, Jl. Lodaya No.20, Malabar, Kota Bandung</span>
                  </div>
                  <a
                    href={googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg whitespace-nowrap hover:bg-amber-300"
                  >
                    Buka Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Point Inspector Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-start gap-3">
            <div
              className="w-4 h-4 rounded-full mt-1 shrink-0"
              style={{ backgroundColor: selectedPoint.pinColor }}
            ></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{selectedPoint.name}</h4>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold">
                  {selectedPoint.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedPoint.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Venue Specs, Court Rules & Contact Info */}
        <div className="space-y-4">
          {/* Venue Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Informasi Arena Pertandingan</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Alamat GOR:</span>
                  Jl. Lodaya No. 20, Malabar, Kec. Lengkong, Kota Bandung, Jawa Barat 40262
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Jam Operasional Venue:</span>
                  07:30 - 18:00 WIB (Selama hari turnamen)
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Car className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Akses Parkir & Drop-Off:</span>
                  Tersedia parkir bus kontingen di area timur dan motor/mobil di pelataran utama GOR.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">Standar Lapangan:</span>
                  Ukuran 13.4m x 6.1m, tinggi net 1.52m (Putra) / 1.42m (Putri), karpet vinyl resmi ISTAF.
                </div>
              </div>
            </div>
          </div>

          {/* Quick List of Important Points */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Titik Lokasi Penting di Venue</span>
            </h3>

            <div className="space-y-2">
              {VENUE_POINTS.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => setSelectedPoint(pt)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                    selectedPoint.id === pt.id
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: pt.pinColor }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-bold text-xs text-white">{pt.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{pt.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

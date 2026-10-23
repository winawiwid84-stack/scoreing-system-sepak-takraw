/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PublicPortal } from './components/public/PublicPortal';
import { StandingsTable } from './components/standings/StandingsTable';
import { TournamentBracket } from './components/bracket/TournamentBracket';
import { PodiumView } from './components/podium/PodiumView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RefereeDashboard } from './components/referee/RefereeDashboard';
import { CoachDashboard } from './components/coach/CoachDashboard';
import { AthleteDashboard } from './components/athlete/AthleteDashboard';
import { AdminGuideModal } from './components/docs/AdminGuideModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { ScoreToastContainer } from './components/notifications/ScoreToastContainer';
import { DualScoreboardView } from './components/scoreboard/DualScoreboardView';
import { VenueMap } from './components/venue/VenueMap';
import { GoogleWorkspaceHub } from './components/workspace/GoogleWorkspaceHub';

const MainContent: React.FC = () => {
  const {
    currentUser,
    scoreToasts,
    dismissScoreToast,
    clearAllScoreToasts,
    soundEnabled,
    setSoundEnabled,
  } = useTournament();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAuth={() => setCurrentTab('auth')}
      />

      {/* Main Body View */}
      <main
        className={`flex-1 w-full ${
          currentTab === 'scoreboard'
            ? 'max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6 py-3'
            : 'max-w-7xl mx-auto px-4 sm:px-6 py-6'
        }`}
      >
        {currentTab === 'home' && <PublicPortal onNavigateTab={setCurrentTab} />}
        {currentTab === 'jadwal' && <PublicPortal onNavigateTab={setCurrentTab} />}
        {currentTab === 'scoreboard' && <DualScoreboardView onNavigateTab={setCurrentTab} />}
        {currentTab === 'klasemen' && <StandingsTable />}
        {currentTab === 'bagan' && <TournamentBracket />}
        {currentTab === 'podium' && <PodiumView />}
        {currentTab === 'venue' && <VenueMap />}
        {currentTab === 'workspace' && <GoogleWorkspaceHub />}
        {currentTab === 'admin' && <AdminDashboard />}
        {currentTab === 'wasit' && <RefereeDashboard onNavigateTab={setCurrentTab} />}
        {currentTab === 'pelatih' && <CoachDashboard />}
        {currentTab === 'atlet' && <AthleteDashboard />}
        {currentTab === 'auth' && <AuthPage onNavigateTab={setCurrentTab} />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Step-by-Step Guide Modal */}
      <AdminGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateTab={(tab) => {
          setCurrentTab(tab);
          setIsGuideOpen(false);
        }}
      />

      {/* Auth / Account Profile Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Real-Time Match Score Change Toast Notifications (Firestore Observer) */}
      <ScoreToastContainer
        toasts={scoreToasts}
        onDismiss={dismissScoreToast}
        onClearAll={clearAllScoreToasts}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onSelectMatch={() => {
          setCurrentTab('wasit');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <TournamentProvider>
      <MainContent />
    </TournamentProvider>
  );
}

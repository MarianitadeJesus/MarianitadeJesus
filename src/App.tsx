import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from './components/ui/sonner';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { Sections } from './components/Sections';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { supabase } from './utils/supabase/client';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);
        setAccessToken(existingSession.access_token);
        setIsAdmin(existingSession.user?.email === 'marianitadejesusadmin');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? '');
      setIsAdmin(session?.user?.email === 'marianitadejesusadmin');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (newSession: any, newUser: any, adminStatus: boolean) => {
    setSession(newSession);
    setUser(newUser);
    setIsAdmin(adminStatus);
    setAccessToken(newSession.access_token);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setAccessToken('');
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <Header
        onLoginClick={() => openAuthModal('login')}
        onSignupClick={() => openAuthModal('signup')}
        onLogout={handleLogout}
        onAdminClick={isAdmin ? () => setAdminPanelOpen(true) : undefined}
        user={user}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <main className="relative">
        <Sections
          user={user}
          accessToken={accessToken}
          onLoginClick={() => openAuthModal('login')}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top */}
      <ScrollToTop />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      {/* Admin Panel */}
      {isAdmin && (
        <AdminPanel
          isOpen={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          accessToken={accessToken}
        />
      )}

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}
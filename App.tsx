
import React, { useState, useCallback } from 'react';
import ChoicePage from './components/ChoicePage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/RegisterPage';

enum Page {
  Choice,
  Login,
  Register,
  Dashboard,
}

// FIX: Removed 'guest' from UserType as it's not used and causes a type error with the Dashboard component.
type UserType = 'admin' | null;

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(Page.Choice);
  const [userType, setUserType] = useState<UserType>(null);
  const [isExiting, setIsExiting] = useState(false);

  const navigate = useCallback((targetPage: Page) => {
    setIsExiting(true);
    setTimeout(() => {
      setPage(targetPage);
      setIsExiting(false);
    }, 500);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setUserType('admin');
    navigate(Page.Dashboard);
  }, [navigate]);
  
  const handleRegisterSuccess = useCallback(() => {
    // In a real app, you would handle the registered user data
    setUserType('admin');
    navigate(Page.Dashboard);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setUserType(null);
    navigate(Page.Choice);
  }, [navigate]);

  const renderPage = () => {
    switch (page) {
      case Page.Login:
        return <LoginPage onBack={() => navigate(Page.Choice)} onLoginSuccess={() => handleLoginSuccess()} />;
      case Page.Register:
        return <RegisterPage onBack={() => navigate(Page.Choice)} onRegisterSuccess={handleRegisterSuccess} />;
      case Page.Dashboard:
        return <Dashboard userType={userType} onLogout={handleLogout} onSignIn={() => navigate(Page.Login)} />;
      case Page.Choice:
      default:
        return <ChoicePage onLogin={() => navigate(Page.Login)} onRegister={() => navigate(Page.Register)} />;
    }
  };
  
  const noiseOverlay = <div className={`noise-overlay fixed inset-0 pointer-events-none z-[9999] opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="1"/%3E%3C/svg%3E')]`}></div>;

  return (
    <div className="min-h-screen font-sans">
      {noiseOverlay}
      <div className={`transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
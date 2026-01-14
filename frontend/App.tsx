import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { OrdersView } from './components/OrdersView';
import { InventoryView } from './components/InventoryView';
import { FleetView } from './components/FleetView';
import { ClientsView } from './components/ClientsView';
import { BoatsView } from './components/BoatsView';
import { FinanceView } from './components/FinanceView';
import { MarinasView } from './components/MarinasView';
import { ScheduleView } from './components/ScheduleView';
import { SettingsView } from './components/SettingsView';
import { CRMView } from './components/CRMView';
import { SignupView } from './components/SignupView';
import { LoginView } from './components/LoginView';
import { UsersView } from './components/UsersView';
import { MaintenanceBudgetView } from './components/MaintenanceBudgetView';
import { WarrantyLookupView } from './components/WarrantyLookupView';
import { PartnersView } from './components/PartnersView';
import { InspectionView } from './components/InspectionView';
import { QuickSaleView } from './components/QuickSaleView';
import { OnboardingProvider } from './context/OnboardingContext';
import { GlobalTour } from './components/GlobalTour';
import { FiscalView } from './components/FiscalView';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { UserRole, User } from './types';
import { Menu, Anchor } from 'lucide-react';
import { ApiService } from './services/api';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { WorkshopView } from './components/WorkshopView';
import { EstimatorView } from './components/EstimatorView';
import { AIDiagnosticsView } from './components/AIDiagnosticsView';
import { MarinaMapView } from './components/MarinaMapView';
import { MechanicAppView } from './components/MechanicAppView';
import { AnalystChecklistView } from './components/AnalystChecklistView';
import { ArchitectureView } from './components/ArchitectureView';
import { SuperAdminView } from './components/SuperAdminView';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewData, setViewData] = useState<any>(null); // State to hold data passed between views
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Initialize storage with seed data on first load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Import dinâmico ou estático, aqui estamos no corpo da função
        const { ApiService } = await import('./services/api');
        const user = await ApiService.getMe();
        handleLogin(user);
      } catch (error) {
        console.error("Session restoration failed:", error);
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === UserRole.TECHNICIAN) {
      setCurrentView('tech-orders');
    } else if (user.role === UserRole.CLIENT) {
      setCurrentView('client-portal');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    setShowSignup(false);
  };

  const handleSetView = (view: string, data?: any) => {
    setCurrentView(view);
    setViewData(data || null); // Set or clear data
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={handleSetView} />;
      case 'schedule':
        return <ScheduleView />;
      case 'clients':
        return <ClientsView />;
      case 'boats':
        return <BoatsView />;
      case 'marinas':
        return <MarinasView />;
      case 'orders':
        return <OrdersView role={UserRole.ADMIN} />;
      case 'inventory':
        return <InventoryView />;
      case 'crm':
        return <CRMView />;
      case 'maintenance-budget':
        return <MaintenanceBudgetView />;
      case 'fleet':
        return <FleetView />;
      case 'users':
        return <UsersView />;

      // ERP Modules
      case 'workshop': return <WorkshopView />;
      case 'estimator': return <EstimatorView />;
      case 'ai-diagnostics': return <AIDiagnosticsView />;
      case 'marina-map': return <MarinaMapView />;
      case 'mechanic-app': return <MechanicAppView />;
      case 'analyst-checklist': return <AnalystChecklistView />;
      case 'architecture': return <ArchitectureView />;
      case 'super-admin': return <SuperAdminView />;

      // Technician Views
      case 'tech-orders':
        return <OrdersView role={UserRole.TECHNICIAN} />;

      // Client Views
      case 'client-portal':
        return <OrdersView role={UserRole.CLIENT} />;
      case 'client-fleet':
        return <FleetView />;

      case 'finance':
        return <FinanceView />;
      case 'fiscal':
        return <FiscalView initialData={viewData} />; // Pass viewData as initialData
      case 'settings':
        return <SettingsView />;
      case 'warranty-lookup':
        return <WarrantyLookupView />;
      case 'partners':
        return <PartnersView />;
      case 'inspection':
        return <InspectionView />;
      case 'quick-sale':
        return <QuickSaleView currentUser={currentUser} />;
      default:
        return <Dashboard setView={handleSetView} />;
    }
  };

  if (!currentUser) {
    if (showSignup) {
      return (
        <SignupView
          onSignupSuccess={() => setShowSignup(false)}
          onGoToLogin={() => setShowSignup(false)}
        />
      );
    }
    return <LoginView onLogin={handleLogin} onGoToSignup={() => setShowSignup(true)} />;
  }

  return (
    <OnboardingProvider currentUser={currentUser}>
      <GlobalTour currentUser={currentUser} />
      <div className="flex bg-slate-100 min-h-screen font-sans text-slate-900">
        <Sidebar
          currentView={currentView}
          setView={handleSetView}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          tenantPlan="ENTERPRISE"
        />

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Mobile Header */}
          <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center md:hidden shrink-0 z-30 shadow-sm">
            <h1 className="font-bold text-lg text-slate-800">Mare Alta</h1>
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-2">
              <Menu className="w-6 h-6" />
            </button>
          </header>

          <main className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar">
            {renderContent()}
          </main>
        </div>
      </div>
      <SpeedInsights />
    </OnboardingProvider>
  );
};

export default App;
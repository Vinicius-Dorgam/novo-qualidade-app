import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileWarning, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface User {
  full_name: string;
  email: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function Layout({ children, currentPageName }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'Inspeções', page: 'Inspecoes', icon: ClipboardCheck },
    { name: 'Planos de Ação', page: 'PlanosAcao', icon: FileWarning },
    { name: 'Configurações', page: 'Configuracoes', icon: Settings },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-200"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        :root { --primary: 217 91% 60%; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-slate-800">QualityControl</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 z-50 transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800">QualityControl</h1>
                  <p className="text-xs text-slate-500">Sistema de Inspeção</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{user.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 text-slate-500 hover:text-red-500 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isActive ? "text-blue-500" : "text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
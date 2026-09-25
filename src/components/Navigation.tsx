import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  LogOut,
  FolderOpen
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  [key: string]: any;
}

export const TopBar: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSignOut = () => {
    signOut(auth).catch((err) => console.error('Sign-out error:', err));
  };

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'list', label: 'المرشحون', icon: Users },
    { id: 'selections', label: 'طلبات العملاء', icon: ShieldCheck },
    { id: 'gallery', label: 'معرض السير الذاتية', icon: Briefcase }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0E294B] text-white border-b border-[#c9a84c]/30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* الشعار واسم النظام */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e4cb79] flex items-center justify-center text-[#0E294B] font-black text-xl shadow-md border border-white/20">
              A
            </div>
            <div>
              <div className="font-black text-base md:text-lg leading-tight flex items-center gap-2">
                <span>AYNGAL</span>
                <span className="text-[10px] bg-white/10 text-[#c9a84c] px-2 py-0.5 rounded font-bold border border-[#c9a84c]/20">
                  الإدارة
                </span>
              </div>
              <div className="text-[11px] text-stone-300">منظومة الاستقدام والتجارة</div>
            </div>
          </div>

          {/* روابط التنقل الرئيسية */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c9a84c] text-[#0E294B] shadow-xs'
                      : 'text-stone-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* معلومات المستخدم وتسجيل الخروج */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <span className="hidden sm:inline-block text-xs font-semibold text-stone-200 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                {currentUser.displayName || currentUser.email}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              title="تسجيل الخروج"
              className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/30 border border-rose-500/20 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export const BottomBar: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'list', label: 'المرشحون', icon: Users },
    { id: 'selections', label: 'الطلبات', icon: ShieldCheck },
    { id: 'gallery', label: 'المعرض', icon: Briefcase }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E294B] border-t border-[#c9a84c]/30 shadow-lg px-2 py-1 flex justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              isActive ? 'text-[#c9a84c]' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Icon size={18} className="mb-0.5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { AppUser } from "./lib/firebase";

// استيراد المكونات الأساسية
import { Dashboard } from "./components/Dashboard";
import { CandidateList } from "./components/CandidateList";
import { TopBar, BottomBar } from "./components/Navigation";
import { LoginScreen } from "./components/LoginScreen";

// استيراد المكونات الجديدة التي طلبناها
import CandidatesGallery from "./components/CandidatesGallery";
import AdminSelections from "./components/AdminSelections";

export default function App() {
  // 1. حالة المستخدم وتسجيل الدخول
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 2. حالة التوجيه (State-driven navigation)
  // نقرأ الرابط الافتراضي، وإذا كان فارغاً نفتح المعرض
  const getInitialView = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") || "gallery";
  };
  const [currentView, setCurrentView] = useState<string>(getInitialView);

  // التحقق من حالة الدخول
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // 3. التحقق من صلاحيات المالك (البريد الإلكتروني المعتمد)
  const isOwner = currentUser?.email?.toLowerCase() === "shuaib54454@gmail.com";

  // 5. دالة التبديل بين الصفحات (تغير الـ State وتحدث الرابط)
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.pushState({}, "", url.toString());
  };

  // 4. توجيه إجباري للعميل: إذا سجل دخول ولم يكن المالك، نثبته في صفحة المعرض
  useEffect(() => {
    if (authChecked && currentUser && !isOwner) {
      if (currentView !== "gallery") {
        handleNavigate("gallery");
      }
    }
  }, [currentUser, isOwner, authChecked, currentView]);

  // شاشة تحميل مؤقتة
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen font-bold text-[#0E294B] bg-[#fdfcfb]" dir="rtl">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  // إذا لم يسجل دخول، نعرض شاشة تسجيل الدخول
  if (!currentUser) {
    return <LoginScreen onSuccess={() => {}} />;
  }

  // ==========================================
  // واجهة العميل (Client View) - قراءة فقط
  // ==========================================
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] text-[#1a1c1e]" dir="rtl">
        <nav className="bg-[#0E294B] p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a84c] to-[#e4cb79] flex items-center justify-center text-[#0E294B] font-black text-lg shadow-sm">
              A
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold leading-tight">معرض السير الذاتية</h1>
              <p className="text-[11px] text-stone-300">مرحباً بك {currentUser.displayName || currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut(getAuth())}
            className="text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            تسجيل خروج
          </button>
        </nav>
        <main className="p-4 max-w-7xl mx-auto">
          <CandidatesGallery />
        </main>
      </div>
    );
  }

  // ==========================================
  // واجهة المالك (Owner / Admin View) - تحكم كامل
  // ==========================================
  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#1a1c1e] pb-16 md:pb-0" dir="rtl">
      {/* شريط التنقل العلوي للإدارة */}
      <TopBar 
        currentView={currentView} 
        onNavigate={handleNavigate}
      />

      {/* أزرار تجريبية للتبديل السريع للمالك */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-2.5 flex flex-wrap gap-2 md:gap-3 justify-center items-center shadow-xs">
        <a
          href="/"
          className="px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-black bg-gradient-to-r from-[#c9a84c] to-[#e4cb79] text-[#0E294B] shadow-xs hover:shadow transition-all flex items-center gap-1.5"
        >
          <span>⚡</span>
          <span>لوحة التحكم الكاملة (المالية، ماسح الجوازات، إضافة المرشح)</span>
        </a>

        <button
          onClick={() => handleNavigate('dashboard')}
          className={`px-3 py-1 rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer ${
            currentView === 'dashboard' ? 'bg-[#0E294B] text-white' : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          لوحة التحكم
        </button>
        <button
          onClick={() => handleNavigate('list')}
          className={`px-3 py-1 rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer ${
            currentView === 'list' ? 'bg-[#0E294B] text-white' : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          قائمة المرشحين
        </button>
        <button
          onClick={() => handleNavigate('gallery')}
          className={`px-3 py-1 rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer ${
            currentView === 'gallery' ? 'bg-[#0E294B] text-white' : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          معاينة المعرض
        </button>
        <button
          onClick={() => handleNavigate('selections')}
          className={`px-3 py-1 rounded-lg text-xs md:text-sm font-bold transition-colors cursor-pointer ${
            currentView === 'selections' ? 'bg-[#0E294B] text-white' : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          الطلبات الواردة
        </button>
      </div>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* الصفحات الإدارية */}
        {currentView === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
        {currentView === "list" && <CandidateList />}
        
        {/* الصفحات الجديدة التي تمت إضافتها */}
        {currentView === "gallery" && <CandidatesGallery />}
        {currentView === "selections" && <AdminSelections />}
      </main>
      
      {/* شريط التنقل السفلي للهواتف */}
      <BottomBar currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, Sparkles, AlertCircle, Loader2, ShieldCheck, Users } from 'lucide-react';

interface LoginScreenProps {
  onSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      onSuccess?.();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'تعذر إكمال تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E294B] flex items-center justify-center p-4 selection:bg-[#c9a84c]/20" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-[#c9a84c]/30 text-center text-right">
        {/* الشعار */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#e4cb79] flex items-center justify-center text-[#0E294B] font-black text-2xl shadow-lg border border-white/40">
          A
        </div>

        <h1 className="text-2xl font-black text-[#0E294B] text-center mb-1">AYNGAL</h1>
        <p className="text-xs text-[#c9a84c] font-bold text-center tracking-widest uppercase mb-4">
          تسهيل التجارة واستقدام الكفاءات
        </p>

        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
          مرحباً بكم في منصة AYNGAL. سجّل الدخول بحساب Google للوصول إلى معرض السير الذاتية ومتابعة طلبات الاستقدام.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-[#0E294B] hover:bg-[#153a66] text-[#fdfcfb] font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#c9a84c]" />
              <span>جاري تسجيل الدخول...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 text-[#c9a84c]" />
              <span>تسجيل الدخول بحساب Google</span>
            </>
          )}
        </button>

        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-around text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#c9a84c]" />
            <span>بوابة العملاء</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#c9a84c]" />
            <span>لوحة تحكم آمنة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

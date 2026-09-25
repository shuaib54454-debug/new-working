import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import {
  Users,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  FileCheck2,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  onNavigate?: (view: string) => void;
  [key: string]: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [candidatesCount, setCandidatesCount] = useState<number>(0);
  const [selectionsCount, setSelectionsCount] = useState<number>(0);
  const [pendingSelections, setPendingSelections] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Authentication token unavailable');

        const catalogResponse = await fetch('/api/candidates/catalog', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        const catalogPayload = await catalogResponse.json().catch(() => null);
        if (!catalogResponse.ok || !catalogPayload?.success || !Array.isArray(catalogPayload.candidates)) {
          throw new Error(catalogPayload?.error || 'Unable to load candidate catalog');
        }

        const selSnap = await getDocs(collection(db, 'selections')).catch(() => null);

        if (isMounted) {
          setCandidatesCount(catalogPayload.candidates.length);
          if (selSnap) {
            setSelectionsCount(selSnap.size);
            const pending = selSnap.docs.filter((d) => d.data().status === 'Pending').length;
            setPendingSelections(pending);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* بطاقة الترحيب والملخص */}
      <div className="bg-gradient-to-l from-[#0E294B] to-[#172a46] text-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#c9a84c]/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30 px-3 py-1 rounded-full text-xs font-bold mb-4">
            <span>لوحة التحكم الإدارية</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-2 text-white">
            مرحباً بك في AYNGAL لإدارة الاستقدام
          </h2>
          <p className="text-sm md:text-base text-stone-200 leading-relaxed mb-6">
            متابعة فورية للمرشحين وطلبات الاختيار المباشرة من العملاء وتسهيل الإجراءات.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('selections')}
              className="bg-[#c9a84c] hover:bg-[#d8b759] text-[#0E294B] px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>مراجعة طلبات العملاء ({pendingSelections})</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('gallery')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Briefcase size={16} />
              <span>معاينة معرض السير الذاتية</span>
            </button>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigate?.('list')}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 hover:border-[#c9a84c] shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500">إجمالي المرشحين</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0E294B] mb-2">
            {loading ? '...' : candidatesCount}
          </div>
          <div className="text-xs text-blue-600 font-semibold flex items-center gap-1">
            <span>عرض وإدارة السير الذاتية</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </div>
        </div>

        <div
          onClick={() => onNavigate?.('selections')}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 hover:border-[#c9a84c] shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500">الطلبات قيد المراجعة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mb-2">
            {loading ? '...' : pendingSelections}
          </div>
          <div className="text-xs text-amber-700 font-semibold flex items-center gap-1">
            <span>تتطلب اتخاذ قرار قبول أو رفض</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </div>
        </div>

        <div
          onClick={() => onNavigate?.('selections')}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 hover:border-[#c9a84c] shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500">إجمالي طلبات العملاء</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 mb-2">
            {loading ? '...' : selectionsCount}
          </div>
          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <span>سجل كافة الطلبات الواردة</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Briefcase, Globe, Calendar, Search, Loader2, ShieldCheck } from 'lucide-react';

interface CandidateListProps {
  [key: string]: any;
}

export const CandidateList: React.FC<CandidateListProps> = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'candidates'));
        const list = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        if (isMounted) setCandidates(list);
      } catch (err) {
        console.error('Error fetching candidate list:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCandidates();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = candidates.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = (c.fullName || c.fullNameArabic || c.firstName || '').toLowerCase();
    const job = (c.jobTitle || c.job || '').toLowerCase();
    return name.includes(term) || job.includes(term);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-[#0E294B]">
        <Loader2 className="w-10 h-10 animate-spin text-[#c9a84c] mb-3" />
        <span className="font-bold text-sm">جاري تحميل قائمة المرشحين...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0E294B]">سجل المرشحين والكوادر</h2>
          <p className="text-xs text-gray-500 mt-1">عرض وإدارة بيانات الكوادر المسجلة في النظام</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو المهنة..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#0E294B]/5 text-[#0E294B] font-bold border-b border-gray-200">
              <tr>
                <th className="p-4">المرشح</th>
                <th className="p-4">المهنة</th>
                <th className="p-4">الجنسية</th>
                <th className="p-4">تاريخ الميلاد</th>
                <th className="p-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    لا توجد بيانات مطابقة
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-bold text-[#172a46]">
                      {c.fullNameArabic || c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'مرشح'}
                    </td>
                    <td className="p-4 text-gray-700">{c.jobTitle || c.job || 'عاملة منزلية'}</td>
                    <td className="p-4 text-gray-700">{c.nationality || c.country || 'إثيوبيا'}</td>
                    <td className="p-4 text-gray-500">{c.birthDate || c.dateOfBirth || '-'}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800">
                        {c.status || c.stage || 'متاح'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

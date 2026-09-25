import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, serverTimestamp, query, setDoc, where } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { User, Briefcase, Globe, CheckCircle, Calendar, AlertCircle, Loader2, Info } from 'lucide-react';

// تعريف واجهة بيانات المرشح (بناءً على firebase-blueprint.json مع حماية البيانات الحساسة مثل رقم الجواز)
export interface Candidate {
  id: string;
  fullName: string;
  fullNameArabic?: string;
  nationality: string;
  jobTitle: string;
  gender: string;
  birthDate: string;
  status: string;
}

interface NotificationState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function CandidatesGallery() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // جلب بيانات المرشحين عند تحميل الصفحة
  useEffect(() => {
    let isMounted = true;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error('Authentication token unavailable');

        const response = await fetch('/api/candidates/catalog', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.success || !Array.isArray(payload.candidates)) {
          throw new Error(payload?.error || 'Unable to load candidate catalog');
        }

        const candidatesData: Candidate[] = payload.candidates.map((raw: Record<string, any>) => ({
          id: String(raw.id || ''),
          fullName: String(raw.fullName || 'مرشح'),
          fullNameArabic: String(raw.fullNameArabic || ''),
          nationality: String(raw.nationality || 'إثيوبيا'),
          jobTitle: String(raw.jobTitle || 'عاملة منزلية'),
          gender: raw.gender === 'male' ? 'ذكر' : raw.gender === 'female' ? 'أنثى' : 'غير محدد',
          birthDate: String(raw.birthDate || 'غير مسجل'),
          status: String(raw.status || 'متاح')
        }));

        if (isMounted) {
          setCandidates(candidatesData);
        }

        // جلب الطلبات السابقة للمستخدم الحالي لتمييز المرشحين الذين تم طلبهم مسبقاً
        if (auth.currentUser) {
          try {
            const userSelectionsQuery = query(
              collection(db, 'selections'),
              where('clientUid', '==', auth.currentUser.uid)
            );
            const selectionsSnapshot = await getDocs(userSelectionsQuery);
            const alreadySelected = new Set<string>();
            selectionsSnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data.candidateId) {
                alreadySelected.add(data.candidateId);
              }
            });
            if (isMounted) {
              setSelectedIds(alreadySelected);
            }
          } catch (err) {
            console.warn('Could not fetch prior selections:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching candidates:', error);
        handleFirestoreError(error, OperationType.LIST, 'candidates');
        if (isMounted) {
          setNotification({
            type: 'error',
            message: 'تعذر جلب قائمة المرشحين. يرجى التأكد من الاتصال بقاعدة البيانات.'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCandidates();

    return () => {
      isMounted = false;
    };
  }, []);

  // دالة اختيار المرشح وإرسال الطلب لقاعدة البيانات
  const handleSelectCandidate = async (candidate: Candidate) => {
    if (!auth.currentUser) {
      setNotification({
        type: 'error',
        message: 'الرجاء تسجيل الدخول أولاً لإرسال الطلب.'
      });
      return;
    }

    if (selectedIds.has(candidate.id)) {
      setNotification({
        type: 'info',
        message: `تم إرسال طلب للمرشح (${candidate.fullNameArabic || candidate.fullName}) مسبقاً وهو قيد المراجعة.`
      });
      return;
    }

    try {
      setSubmittingId(candidate.id);
      setNotification(null);

      const candidateDisplayName = candidate.fullNameArabic || candidate.fullName;

      // استخدم معرفاً حتمياً لمنع إنشاء أكثر من طلب لنفس العميل والمرشح.
      // إذا كان الطلب موجوداً مسبقاً، تمنع قواعد Firestore تحديثه من جهة العميل.
      const selectionId = `${auth.currentUser.uid}__${candidate.id}`;
      await setDoc(doc(db, 'selections', selectionId), {
        candidateId: candidate.id,
        candidateName: candidateDisplayName,
        clientUid: auth.currentUser.uid,
        clientEmail: auth.currentUser.email || '',
        status: 'Pending', // الحالة المبدئية: قيد المراجعة
        createdAt: serverTimestamp()
      });

      setSelectedIds((prev) => new Set(prev).add(candidate.id));
      setNotification({
        type: 'success',
        message: `تم إرسال طلبك لاختيار المرشح: ${candidateDisplayName} بنجاح! سيتم التواصل معكم.`
      });
    } catch (error) {
      console.error('Error submitting selection:', error);
      handleFirestoreError(error, OperationType.CREATE, 'selections');
      setNotification({
        type: 'error',
        message: 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-[#172a46] min-h-[300px]" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-[#c9a84c] mb-4" />
        <span className="font-bold text-lg">جاري تحميل السير الذاتية...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#fdfcfb] min-h-screen text-right" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0E294B] mb-6 text-center">معرض السير الذاتية</h2>

        {/* إشعار داخلي متوافق مع بيئة العمل بدون تجميد الصفحة */}
        {notification && (
          <div
            className={`max-w-2xl mx-auto mb-6 p-4 rounded-xl flex items-center gap-3 shadow-xs border transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
            {notification.type === 'info' && <Info className="w-5 h-5 shrink-0 text-blue-600" />}
            <span className="text-sm font-semibold flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold px-2 py-1 rounded bg-black/5 hover:bg-black/10 transition-colors"
            >
              إغلاق
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const isSelected = selectedIds.has(candidate.id);
            const isSubmitting = submittingId === candidate.id;

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-xl shadow-md border border-[#c9a84c]/30 p-5 hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* معلومات المرشح الأساسية */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-[#0E294B] text-[#c9a84c] p-3 rounded-full shrink-0">
                      <User size={24} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg text-[#1a1c1e] line-clamp-1">
                        {candidate.fullNameArabic || candidate.fullName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {candidate.gender === 'female' ? 'أنثى' : candidate.gender === 'male' ? 'ذكر' : candidate.gender}
                      </span>
                    </div>
                  </div>

                  {/* التفاصيل المهنية */}
                  <div className="space-y-3 mb-6 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-[#c9a84c] shrink-0" />
                      <span>
                        <strong>المهنة:</strong> {candidate.jobTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#c9a84c] shrink-0" />
                      <span>
                        <strong>الجنسية:</strong> {candidate.nationality}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#c9a84c] shrink-0" />
                      <span>
                        <strong>تاريخ الميلاد:</strong> {candidate.birthDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* زر الاختيار */}
                <button
                  type="button"
                  onClick={() => handleSelectCandidate(candidate)}
                  disabled={isSelected || isSubmitting}
                  className={`w-full flex justify-center items-center gap-2 py-2.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                      : isSubmitting
                      ? 'bg-[#0E294B]/70 text-white cursor-wait'
                      : 'bg-[#172a46] text-[#fdfcfb] hover:bg-[#0E294B]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#c9a84c]" />
                      <span>جاري إرسال الطلب...</span>
                    </>
                  ) : isSelected ? (
                    <>
                      <CheckCircle size={18} />
                      <span>تم إرسال الطلب</span>
                    </>
                  ) : (
                    <span>اختيار هذا المرشح</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {candidates.length === 0 && (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
            لا توجد سير ذاتية متاحة حالياً.
          </div>
        )}
      </div>
    </div>
  );
}

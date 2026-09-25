import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, AlertCircle, Loader2 } from 'lucide-react';

// تعريف واجهة الطلب (Selection)
export interface SelectionRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  clientUid: string;
  clientEmail: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: any; // Timestamp من Firestore أو قيمة تاريخ
}

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export default function AdminSelections() {
  const [selections, setSelections] = useState<SelectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // جلب الطلبات من قاعدة البيانات
  const fetchSelections = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'selections'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const selectionsData = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as SelectionRequest[];
      
      setSelections(selectionsData);
    } catch (error) {
      console.error("Error fetching selections:", error);
      handleFirestoreError(error, OperationType.LIST, 'selections');
      setNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تحميل الطلبات من قاعدة البيانات.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSelections();
  }, []);

  // دالة لتحديث حالة الطلب
  const handleUpdateStatus = async (selectionId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      setActionId(selectionId);
      setNotification(null);

      const selectionRef = doc(db, 'selections', selectionId);
      await updateDoc(selectionRef, {
        status: newStatus
      });
      
      // تحديث الحالة محلياً في الواجهة دون الحاجة لإعادة الجلب
      setSelections(prevSelections => 
        prevSelections.map(sel => 
          sel.id === selectionId ? { ...sel, status: newStatus } : sel
        )
      );

      const statusArabic = newStatus === 'Approved' ? 'مقبول' : 'مرفوض';
      setNotification({
        type: 'success',
        message: `تم تحديث حالة الطلب إلى "${statusArabic}" بنجاح.`
      });
      
    } catch (error) {
      console.error("Error updating status:", error);
      handleFirestoreError(error, OperationType.UPDATE, `selections/${selectionId}`);
      setNotification({
        type: 'error',
        message: 'حدث خطأ أثناء تحديث حالة الطلب.'
      });
    } finally {
      setActionId(null);
    }
  };

  // دالة مساعدة لتوليد شارة (Badge) الحالة بصرياً
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
            <CheckCircle size={16}/> مقبول
          </span>
        );
      case 'Rejected':
        return (
          <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm font-bold border border-red-200">
            <XCircle size={16}/> مرفوض
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">
            <Clock size={16}/> قيد الانتظار
          </span>
        );
    }
  };

  // دالة مساعدة لتنسيق التاريخ بأمان
  const formatTimestamp = (createdAt: any): string => {
    if (!createdAt) return 'غير متوفر';
    try {
      if (typeof createdAt?.toDate === 'function') {
        return createdAt.toDate().toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      const d = new Date(createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      // fallback
    }
    return 'غير متوفر';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-[#172a46] min-h-[300px]" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-[#c9a84c] mb-4" />
        <span className="font-bold text-lg">جاري تحميل الطلبات...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-[#fdfcfb] min-h-screen rtl text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-[#0E294B] mb-6 border-b-2 border-[#c9a84c] pb-2 inline-block">
          إدارة طلبات العملاء
        </h2>

        {/* إشعار داخلي للعمليات */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-xs border transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <span className="text-sm font-semibold flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold px-2 py-1 rounded bg-black/5 hover:bg-black/10 transition-colors"
            >
              إغلاق
            </button>
          </div>
        )}
        
        {selections.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-xl shadow-xs border border-gray-100">
            لا توجد طلبات مسجلة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {selections.map((selection) => {
              const isProcessing = actionId === selection.id;

              return (
                <div 
                  key={selection.id} 
                  className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                >
                  
                  {/* معلومات الطلب */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2">
                      <User size={20} className="text-[#c9a84c] shrink-0" />
                      <span className="text-sm font-bold text-gray-500">المرشح المطلوب:</span>
                      <span className="text-lg font-bold text-[#172a46]">{selection.candidateName || 'بدون اسم'}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-[#0E294B] shrink-0" />
                        <span><strong className="text-gray-700">العميل:</strong> {selection.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#0E294B] shrink-0" />
                        <span>
                          <strong className="text-gray-700">تاريخ الطلب:</strong>{' '}
                          {formatTimestamp(selection.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* الحالة وأزرار الإجراءات */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-gray-100">
                    {getStatusBadge(selection.status)}
                    
                    {selection.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(selection.id, 'Approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? <Loader2 size={15} className="animate-spin" /> : null}
                          قبول
                        </button>
                        <button 
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(selection.id, 'Rejected')}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? <Loader2 size={15} className="animate-spin" /> : null}
                          رفض
                        </button>
                      </div>
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

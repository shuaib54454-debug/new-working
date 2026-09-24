import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  UserCheck,
  Zap,
  Smartphone,
  Copy,
  Check
} from "lucide-react";
import { loginWithEmail, registerOwnerAccount, resetUserPassword } from "../lib/firebase";
import { googleSignIn } from "../lib/googleAuth";
import { useLanguage } from "../lib/LanguageContext";
import { ShuaybLogo } from "./ShuaybLogo";
import { Capacitor } from "@capacitor/core";

const OWNER_EMAIL = "shuaib54454@gmail.com";
const FIREBASE_CONSOLE_AUTH_URL = "https://console.firebase.google.com/project/crack-petal-506818-c8/authentication/providers";
const FIREBASE_CONSOLE_DOMAINS_URL = "https://console.firebase.google.com/project/crack-petal-506818-c8/authentication/settings";

interface LoginScreenProps {
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const { isAr, toggleLanguage } = useLanguage();
  const isNative = Capacitor.isNativePlatform();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [showConsoleGuide, setShowConsoleGuide] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rejectNonOwner = (value: string) => {
    if (value.trim().toLowerCase() !== OWNER_EMAIL) {
      throw new Error(
        isAr
          ? "هذا الحساب غير مصرح له. استخدم حساب المالك فقط (shuaib54454@gmail.com)."
          : "This account is not authorized. Use the owner account only (shuaib54454@gmail.com)."
      );
    }
  };

  const handleCopyConsoleLink = async () => {
    try {
      await navigator.clipboard.writeText(FIREBASE_CONSOLE_AUTH_URL);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleSendResetEmail = async () => {
    setError(null);
    setSuccessMessage(null);
    setSendingReset(true);
    try {
      await resetUserPassword(OWNER_EMAIL);
      setSuccessMessage(
        isAr
          ? "تم إرسال رابط تعيين كلمة المرور إلى بريد المالك (shuaib54454@gmail.com) بنجاح! يرجى فتح بريدك في هاتفك والضغط على الرابط لاختيار كلمة مرور لحسابك، ثم كتابتها هنا للدخول."
          : "Password setup link sent to (shuaib54454@gmail.com)! Open the email, click the link to set your password, then return here to sign in."
      );
    } catch (err: any) {
      const code = err?.code || "";
      const rawMsg = err?.message || "";
      if (code === "auth/operation-not-allowed" || rawMsg.includes("auth/operation-not-allowed")) {
        setIsOperationNotAllowed(true);
        setError(
          isAr
            ? "مزوّد كلمة المرور غير مفعّل في لوحة Firebase Console. يرجى تفعيله باتباع التعليمات أدناه."
            : "Email/Password provider is disabled in Firebase Console. Please enable it following the instructions below."
        );
      } else {
        setError(rawMsg || (isAr ? "تعذر إرسال الرابط. تحقق من اتصال الإنترنت." : "Failed to send reset email."));
      }
    } finally {
      setSendingReset(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsOperationNotAllowed(false);
    setIsUnauthorizedDomain(false);
    setSuccessMessage(null);
    setGoogleLoading(true);

    if (isNative) {
      // In Android WebView, Google strictly blocks popup OAuth (disallowed_useragent)
      setGoogleLoading(false);
      setError(
        isAr
          ? "تسجيل الدخول عبر نافذة Google المنبثقة محظور أمنياً داخل تطبيقات أندرويد WebView. يرجى استخدام تسجيل الدخول بكلمة المرور لتطبيق الهاتف (APK) الموضح أدناه."
          : "Google popup login is blocked by Google security inside Android WebViews. Please use the password sign-in for the APK below."
      );
      return;
    }

    try {
      const result = await googleSignIn();
      if (result?.user) {
        onSuccess();
      }
    } catch (err: any) {
      const code = err?.code || "";
      const msg = err?.message || "";
      if (code === "auth/unauthorized-domain" || msg.includes("auth/unauthorized-domain")) {
        console.warn("Google sign-in unauthorized domain:", err);
        setIsUnauthorizedDomain(true);
        setError(
          isAr
            ? `النطاق الحالي (${window.location.hostname}) غير مدرج ضمن النطاقات المصرح بها في Firebase. يرجى إضافته في إعدادات Firebase Console.`
            : `Current domain (${window.location.hostname}) is not added to Firebase Authorized Domains. Please add it in Firebase Console settings.`
        );
      } else if (code === "auth/popup-closed-by-user") {
        console.info("Google sign-in popup was closed by user.");
      } else {
        console.error("Google sign in error:", err);
        setError(msg || (isAr ? "فشل تسجيل الدخول بحساب Google" : "Google sign-in failed"));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsOperationNotAllowed(false);
    setIsUnauthorizedDomain(false);
    setSuccessMessage(null);
    setLoading(true);

    try {
      rejectNonOwner(email);

      if (mode === "login") {
        await loginWithEmail(email, password);
        onSuccess();
      } else if (mode === "register") {
        if (password.length < 6) {
          throw new Error(isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
        }
        if (password !== confirmPassword) {
          throw new Error(isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
        }
        try {
          await registerOwnerAccount(email, password);
          setSuccessMessage(isAr ? "تم إنشاء وتفعيل حساب المالك بنجاح!" : "Owner account created successfully!");
          onSuccess();
        } catch (regErr: any) {
          const regCode = regErr?.code || "";
          if (regCode === "auth/email-already-in-use" || regErr?.message?.includes("email-already-in-use")) {
            // Account already created via Google! Offer password reset setup
            setError(
              isAr
                ? "حساب المالك (shuaib54454@gmail.com) مسجل مسبقاً في النظام عبر Google. لتعيين كلمة مرور له للدخول من تطبيق الهاتف، اضغط على زر 'إرسال رابط تعيين كلمة المرور' أدناه."
                : "Owner account already exists via Google. Click 'Send password setup link' below to set your password for the mobile APK."
            );
          } else {
            throw regErr;
          }
        }
      } else {
        await resetUserPassword(OWNER_EMAIL);
        setSuccessMessage(
          isAr
            ? "تم إرسال رابط استعادة/تعيين كلمة المرور إلى بريد المالك (shuaib54454@gmail.com). افتح الرابط في هاتفك لتعيين كلمة المرور."
            : "Password setup/reset link sent to owner email (shuaib54454@gmail.com)."
        );
      }
    } catch (err: any) {
      const code = err?.code || "";
      const rawMsg = err?.message || "";

      if (code === "auth/operation-not-allowed" || rawMsg.includes("auth/operation-not-allowed")) {
        console.warn("Firebase Auth Notice: Email/Password provider is disabled in Firebase Console:", err);
        setIsOperationNotAllowed(true);
        setError(
          isAr
            ? "مزوّد تسجيل الدخول بكلمة المرور (Email/Password) غير مفعّل في لوحة تحكم Firebase Console. يرجى تفعيله باتباع الخطوات البسيطة أدناه لتمكين الدخول في تطبيق الهاتف."
            : "Email/Password provider is disabled in Firebase Console. Please enable it following the quick steps below to allow APK sign-in."
        );
      } else if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        rawMsg.includes("auth/invalid-credential")
      ) {
        console.warn("Firebase Auth credential validation failed:", code);
        setError(
          isAr
            ? "كلمة المرور غير صحيحة، أو لم يتم تعيين كلمة مرور لهذا الحساب بعد (لأنه أُنشئ عبر Google). اضغط على 'إرسال رابط تعيين كلمة المرور' أدناه لاختيار كلمة مرور لحسابك."
            : "Incorrect password, or no password has been created yet for this Google account. Click 'Send password setup link' below to set your password."
        );
      } else if (code === "auth/email-already-in-use" || rawMsg.includes("auth/email-already-in-use")) {
        setError(
          isAr
            ? "الحساب مسجل بالفعل في Firebase. استخدم تسجيل الدخول بكلمة المرور أو اطلب رابط تعيينها."
            : "Account already exists in Firebase. Please use Sign In or request a password setup link."
        );
      } else if (code === "auth/weak-password" || rawMsg.includes("auth/weak-password")) {
        setError(
          isAr
            ? "كلمة المرور ضعيفة جداً. يرجى استخدام 6 أحرف أو أرقام على الأقل."
            : "Password is too weak. Please use at least 6 characters."
        );
      } else if (code === "auth/invalid-email" || rawMsg.includes("auth/invalid-email")) {
        setError(isAr ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format");
      } else {
        console.error("Auth error:", err);
        setError(rawMsg || (isAr ? "حدث خطأ أثناء المصادقة" : "Authentication error occurred"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1d31] flex items-center justify-center p-4 text-stone-100" dir={isAr ? "rtl" : "ltr"}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-800 border border-[#c9a84c]/20 relative">
        {/* Language switch button */}
        <div className="absolute top-5 end-5">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1 text-xs font-bold rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
          >
            {isAr ? "English" : "العربية"}
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <ShuaybLogo size="xl" variant="icon" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#0E294B] tracking-wider">
            AYNGAL
          </h1>
          <p className="text-sm font-bold text-[#0E294B] mt-0.5" dir="rtl">
            جسر التجارة مع إثيوبيا
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#0284C7] mt-0.5 uppercase">
            تسهيل التجارة - TRADE FACILITATION
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-stone-50 border border-stone-200 px-3.5 py-1 text-[11px] font-bold text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            {isAr ? "حساب المالك المعتمد: shuaib54454@gmail.com" : "Owner account: shuaib54454@gmail.com"}
          </div>
        </div>

        {/* Native Mobile APK Notice Badge */}
        {isNative && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2 text-[#0E294B] font-bold">
              <Smartphone className="w-4 h-4 text-[#0284C7] shrink-0" />
              <span>{isAr ? "نسخة تطبيق الهاتف (Android APK)" : "Android Mobile APK"}</span>
            </div>
            <span className="text-[10px] bg-[#0E294B] text-white font-black px-2.5 py-0.5 rounded-full tracking-wide">
              {isAr ? "دخول المالك" : "Owner"}
            </span>
          </div>
        )}

        {/* Operation Not Allowed / Error Resolution Card */}
        {isOperationNotAllowed && (
          <div className="mb-5 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 space-y-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-900 text-sm">
                  {isAr
                    ? "مطلوب تفعيل خيار (Email/Password) لمرة واحدة فقط في Firebase"
                    : "Action Required: Enable Email/Password in Firebase Console"}
                </p>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  {isAr
                    ? "مشروع Firebase مفعّل عليه الدخول بحساب Google فقط حالياً. لتسجيل الدخول في تطبيق الهاتف (APK)، يلزم تفعيل مزوّد كلمة المرور في مشروع Firebase (خطوة تستغرق 30 ثانية):"
                    : "Your Firebase project currently only has Google sign-in enabled. To log into the APK, you need to enable Email/Password provider (takes 30 seconds):"}
                </p>
              </div>
            </div>

            {/* Step-by-step resolution */}
            <div className="p-3 bg-white rounded-xl border border-amber-200 text-[11px] text-stone-800 space-y-2">
              <ol className="list-decimal list-inside space-y-1.5 font-medium leading-relaxed">
                <li>
                  {isAr ? "افتح صفحة مزودي الدخول في Firebase:" : "Open Firebase sign-in providers:"}{" "}
                  <a
                    href={FIREBASE_CONSOLE_AUTH_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Firebase Auth Providers <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  {isAr
                    ? "اضغط على مزوّد: (Email/Password أو البريد الإلكتروني/كلمة المرور)."
                    : "Click on (Email/Password) provider."}
                </li>
                <li>
                  {isAr
                    ? "قم بتفعيل المفتاح الأول (Enable) ثم اضغط (Save أو حفظ)."
                    : "Toggle (Enable) to ON and click (Save)."}
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={FIREBASE_CONSOLE_AUTH_URL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-[#172a46] hover:bg-[#203a60] text-white font-bold text-center rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>{isAr ? "فتح لوحة تحكم Firebase مباشرة" : "Open Firebase Console"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleCopyConsoleLink}
                className="py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copiedLink ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ الرابط" : "Copy Link")}</span>
              </button>
            </div>

            {!isNative && (
              <div className="pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isAr ? "أو الدخول عبر Google على المتصفح" : "Or Sign in with Google on Web"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Unauthorized Domain Resolution Card */}
        {isUnauthorizedDomain && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  {isAr
                    ? "النطاق يحتاج إلى تصريح لمرة واحدة في Firebase Console"
                    : "Domain needs a 1-time authorization in Firebase Console"}
                </p>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  {isAr
                    ? `النطاق الحالي (${typeof window !== "undefined" ? window.location.hostname : "localhost"}) غير مضاف في قائمة النطاقات المصرح بها لمشروعك في Firebase.`
                    : `The current domain (${typeof window !== "undefined" ? window.location.hostname : "localhost"}) must be added to your Authorized Domains list.`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-[11px] space-y-2">
              <p className="font-bold text-stone-800">
                {isAr ? "الحل السريع (خطوتان بسيطتان):" : "Quick Fix (2 simple steps):"}
              </p>
              <div className="space-y-1.5 text-stone-700">
                <div className="flex items-center justify-between gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-mono font-bold text-stone-900">
                    {typeof window !== "undefined" ? window.location.hostname : "localhost"}
                  </span>
                  <a
                    href={FIREBASE_CONSOLE_DOMAINS_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    {isAr ? "إضافة النطاق في Firebase" : "Add to Firebase"} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[10px] text-stone-500">
                  {isAr
                    ? "أو قم بتفعيل (Email/Password) للدخول بكلمة المرور من أي جهاز دون الحاجة لأي إعدادات نطاقات."
                    : "Or enable Email/Password to sign in from any device without domain setup."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={FIREBASE_CONSOLE_DOMAINS_URL}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-[#172a46] text-white font-bold text-center rounded-xl text-xs hover:bg-[#223d65] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{isAr ? "فتح إعدادات النطاقات في Firebase" : "Open Authorized Domains"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={FIREBASE_CONSOLE_AUTH_URL}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-white border border-stone-300 text-stone-800 font-bold text-center rounded-xl text-xs hover:bg-stone-50 transition-all flex items-center justify-center gap-1"
              >
                <span>{isAr ? "تفعيل كلمة المرور" : "Enable Password"}</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              </a>
            </div>
          </div>
        )}

        {/* Standard Error Notice */}
        {error && !isOperationNotAllowed && !isUnauthorizedDomain && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Notice */}
        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Option on Web: Google Sign-In */}
        {!isNative && mode === "login" && (
          <div className="mb-5">
            <div className="rounded-2xl border-2 border-[#172a46]/15 bg-gradient-to-b from-[#172a46]/5 to-transparent p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {isAr ? "طريقة المصادقة السحابية المعتمدة للمتصفح" : "Active & Verified Cloud Sign-In"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#172a46] hover:bg-[#203a60] text-white font-black text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shrink-0 p-0.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span>
                  {googleLoading
                    ? (isAr ? "جاري التحقق والاتصال..." : "Verifying & Connecting...")
                    : (isAr ? "دخول فوري بحساب Google المعتمد" : "Sign in with Google (Owner Account)")}
                </span>
              </button>
              <p className="text-[11px] text-stone-500 mt-2 font-medium">
                {isAr ? "دخول فوري بضغطة واحدة لحساب shuaib54454@gmail.com" : "Instant 1-click access for shuaib54454@gmail.com"}
              </p>
            </div>

            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-stone-400 shrink-0">
                {isAr ? "أو الدخول بكلمة المرور" : "Or sign in with password"}
              </span>
              <div className="border-t border-stone-200 w-full" />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1.5">
              {isAr ? "بريد حساب المالك" : "Owner Email"}
            </label>
            <div className="relative">
              <Mail className="absolute top-3.5 start-3.5 w-4 h-4 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full ps-10 pe-3 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-800 outline-none focus:ring-2 focus:ring-[#c9a84c]"
                placeholder={OWNER_EMAIL}
                required
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-600">
                  {mode === "register"
                    ? (isAr ? "تعيين كلمة المرور الجديدة" : "Set New Password")
                    : (isAr ? "كلمة المرور" : "Password")}
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={sendingReset}
                    className="text-[11px] font-bold text-[#0284C7] hover:text-[#0E294B] underline"
                  >
                    {sendingReset
                      ? (isAr ? "جاري الإرسال..." : "Sending...")
                      : (isAr ? "لم تعيّن كلمة مرور بعد؟ اضغط هنا" : "No password yet? Click here")}
                  </button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute top-3.5 start-3.5 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  className="w-full ps-10 pe-11 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-800 outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  placeholder={mode === "register" ? "******" : (isAr ? "أدخل كلمة المرور" : "Enter password")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute top-2.5 end-2.5 p-1.5 text-stone-400 hover:text-stone-600"
                  aria-label={isAr ? "إظهار كلمة المرور" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                {isAr ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>
              <div className="relative">
                <KeyRound className="absolute top-3.5 start-3.5 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full ps-10 pe-3 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-800 outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  placeholder="******"
                  required
                />
              </div>
            </div>
          )}

          {/* Quick 1-click password setup button for APK users */}
          {mode === "login" && isNative && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={sendingReset}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  {sendingReset
                    ? (isAr ? "جاري إرسال الرابط لبريدك..." : "Sending link...")
                    : (isAr ? "📩 إرسال رابط تعيين كلمة المرور إلى بريدي فوراً" : "Send Password Setup Link to My Email")}
                </span>
              </button>
              <p className="text-[10px] text-stone-400 mt-1 text-center font-medium">
                {isAr ? "سيصلك رابط في Gmail لاختيار كلمة المرور والعودة للدخول بها" : "You will receive an email to set a password for the APK"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
              mode === "login"
                ? isNative
                  ? "bg-[#172a46] hover:bg-[#203a60] text-white font-black shadow-md"
                  : "bg-stone-100 hover:bg-stone-200 text-[#172a46] border border-stone-300"
                : "bg-[#172a46] hover:bg-[#203a60] text-white font-black shadow-md"
            }`}
          >
            {mode === "login" ? (
              <LogIn className="w-4 h-4 text-[#172a46]" />
            ) : mode === "register" ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {loading
              ? (isAr ? "جاري المعالجة..." : "Processing...")
              : mode === "login"
              ? (isAr ? "دخول المالك بكلمة المرور" : "Sign In with Password")
              : mode === "register"
              ? (isAr ? "إنشاء وحفظ كلمة المرور" : "Register Owner Password")
              : (isAr ? "إرسال رابط الاستعادة" : "Send Reset Link")}
          </button>
        </form>

        {/* Secondary Links and Modes */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
          {mode === "login" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-stone-600 hover:text-[#172a46] underline underline-offset-4"
              >
                {isAr ? "إنشاء كلمة مرور جديدة للمالك" : "Create owner password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-stone-500 hover:text-[#172a46] underline underline-offset-4"
              >
                {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-[#172a46] underline underline-offset-4"
            >
              {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
            </button>
          )}
        </div>

    </div>
    </div>
  );
};

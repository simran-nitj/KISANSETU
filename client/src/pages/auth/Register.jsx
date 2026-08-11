import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Smartphone, ShieldCheck, ArrowRight, Loader2, Tractor, ShoppingBag } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";
import { registerProfile } from "../../services/api";

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState("details"); // "details" | "otp"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CUSTOMER"); // "FARMER" | "CUSTOMER" — matches Prisma Role enum
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-register", {
        size: "invisible"
      });
    }
  }, []);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      setError("Couldn't send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      await confirmationResult.confirm(otp);

      const { data } = await registerProfile({ name: name.trim(), role });

      if (data.user.role === "FARMER") navigate("/farmer/dashboard");
      else navigate("/customer/marketplace");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Registration failed. Try again.");
      // Roll back the Firebase session so they aren't stuck half-authenticated
      await auth.signOut().catch(() => {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fbf4] px-5 py-12">
      <div className="w-full max-w-md rounded-lg border border-emerald-900/10 bg-white p-8 shadow-2xl shadow-emerald-950/10">
        <div className="text-center">
          <p className="text-xl font-black leading-none text-emerald-950">
            Kisan<span className="text-emerald-600">Setu</span>
          </p>
          <h1 className="mt-6 text-2xl font-black text-emerald-950">Create your account</h1>
          <p className="mt-2 text-sm font-medium text-stone-600">
            {step === "details"
              ? "Tell us who you are and we'll send a code to verify your number."
              : `Enter the code sent to +91 ${phone}`}
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("FARMER")}
                className={`flex flex-col items-center gap-2 rounded-md border p-4 text-sm font-black transition ${
                  role === "FARMER"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-stone-200 text-stone-500"
                }`}
              >
                <Tractor size={22} />
                Owner (Farmer)
              </button>
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`flex flex-col items-center gap-2 rounded-md border p-4 text-sm font-black transition ${
                  role === "CUSTOMER"
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-stone-200 text-stone-500"
                }`}
              >
                <ShoppingBag size={22} />
                Customer (Renter)
              </button>
            </div>

            <label className="flex items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
              <User className="text-emerald-700 shrink-0" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-transparent text-sm font-semibold outline-none"
                autoFocus
              />
            </label>

            <label className="flex items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
              <Smartphone className="text-emerald-700 shrink-0" size={20} />
              <span className="text-sm font-black text-stone-500">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit mobile number"
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Send code <ArrowRight size={18} /></>}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <label className="flex items-center gap-3 rounded-md bg-stone-50 px-4 py-3">
              <ShieldCheck className="text-emerald-700 shrink-0" size={20} />
              <input
                ref={otpInputRef}
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit OTP"
                className="w-full bg-transparent tracking-[0.4em] text-sm font-black outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("details");
                setOtp("");
                setError("");
              }}
              className="w-full text-center text-sm font-bold text-emerald-700"
            >
              Edit details
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-semibold text-stone-600">
          Already have an account?{" "}
          <Link to="/login" className="font-black text-emerald-700">
            Log in
          </Link>
        </p>

        {/* Required by Firebase for invisible reCAPTCHA */}
        <div id="recaptcha-container-register" />
      </div>
    </main>
  );
}
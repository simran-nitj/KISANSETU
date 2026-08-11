import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Smartphone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";
import { fetchProfile } from "../../services/api";

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-login", {
        size: "invisible"
      });
    }
  }, []);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");

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

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      await confirmationResult.confirm(otp);

      const { data } = await fetchProfile();
      if (!data?.user) {
        setError("No account found with this number. Please register.");
        await auth.signOut();
        return;
      }

      if (data.user.role === "FARMER") navigate("/farmer/dashboard");
      else navigate("/customer/marketplace");
    } catch (err) {
      console.error(err);
      setError("Invalid or expired code.");
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
          <h1 className="mt-6 text-2xl font-black text-emerald-950">Log in</h1>
          <p className="mt-2 text-sm font-medium text-stone-600">
            {step === "phone"
              ? "We'll send a one-time code to your mobile number."
              : `Enter the code sent to +91 ${phone}`}
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
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
                autoFocus
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
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
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
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & log in"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="w-full text-center text-sm font-bold text-emerald-700"
            >
              Change mobile number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm font-semibold text-stone-600">
          New to Kisan Setu?{" "}
          <Link to="/register" className="font-black text-emerald-700">
            Create an account
          </Link>
        </p>

        {/* Required by Firebase for invisible reCAPTCHA */}
        <div id="recaptcha-container-login" />
      </div>
    </main>
  );
}
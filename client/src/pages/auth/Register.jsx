import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, ShieldCheck, User, ArrowRight, Loader2, Tractor, ShoppingBag } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../lib/firebase";
import api from "../../lib/api";
import mascot from "../../assets/mascot.png";

const roles = [
  { value: "FARMER_OWNER", label: "Equipment Owner", desc: "List and rent out your machinery", icon: Tractor },
  { value: "FARMER_CUSTOMER", label: "Farmer / Renter", desc: "Rent equipment from nearby owners", icon: ShoppingBag }
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState("details"); // "details" | "otp"
  const [name, setName] = useState("");
  const [role, setRole] = useState("FARMER_CUSTOMER");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef(null);

  const setupRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible"
      });
    }
    return recaptchaRef.current;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError("Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      await api.post("/auth/sync", { name: name.trim(), role });

      const roleRoutes = {
        FARMER_OWNER: "/owner/dashboard",
        FARMER_CUSTOMER: "/customer/dashboard"
      };
      navigate(roleRoutes[role] || "/");
    } catch (err) {
      console.error(err);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fbf4] px-5 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-emerald-950 p-10 text-white lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <img src={mascot} className="h-12 w-12 object-contain" alt="" />
            <p className="text-xl font-black leading-none">
              Kisan<span className="text-lime-300">Setu</span>
            </p>
          </Link>
          <div>
            <p className="text-sm font-black uppercase text-lime-300">Join Kisan Setu</p>
            <h2 className="mt-2 text-3xl font-black">Rent out equipment or find machinery nearby.</h2>
            <p className="mt-4 text-sm font-medium text-emerald-100">
              KYC-verified owners, secure bookings and real-time chat, all in one platform.
            </p>
          </div>
          <p className="text-xs font-bold text-emerald-200/70">Connect. Share. Grow.</p>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="text-2xl font-black text-emerald-950">Create your account</h1>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {step === "details" ? "Tell us a bit about yourself" : `Enter the OTP sent to +91 ${phone}`}
          </p>

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {step === "details" ? (
            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <label className="flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-4 py-3">
                <User className="text-emerald-700" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  required
                />
              </label>

              <label className="flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-4 py-3">
                <Phone className="text-emerald-700" size={20} />
                <span className="text-sm font-black text-stone-500">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setRole(value)}
                    className={`rounded-md border p-4 text-left transition ${
                      role === value
                        ? "border-emerald-700 bg-emerald-50"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <Icon className={role === value ? "text-emerald-700" : "text-stone-400"} size={22} />
                    <p className="mt-2 text-sm font-black text-emerald-950">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-stone-500">{desc}</p>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Send OTP <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
              <label className="flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 px-4 py-3">
                <ShieldCheck className="text-emerald-700" size={20} />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit OTP"
                  className="w-full bg-transparent tracking-widest text-sm font-semibold outline-none"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Verify & Create account <ArrowRight size={18} /></>}
              </button>
              <button
                type="button"
                onClick={() => setStep("details")}
                className="w-full text-center text-sm font-bold text-emerald-700"
              >
                Edit details
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm font-semibold text-stone-500">
            Already have an account?{" "}
            <Link to="/login" className="font-black text-emerald-700">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div id="recaptcha-container" />
    </main>
  );
}
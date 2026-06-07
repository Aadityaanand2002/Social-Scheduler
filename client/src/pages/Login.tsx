import { useState, useEffect } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MailIcon, LockIcon, ArrowRightIcon, User2Icon, PhoneIcon, LoaderCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import api from "../api/axios";

const paidPlans = new Set(["pro", "agency"]);

const AI_PHRASES = [
  "Crafting the perfect caption...",
  "Analyzing trending topics...",
  "Generating relevant hashtags...",
  "Optimizing post schedule...",
  "Writing an engaging thread..."
];

function TypewriterText() {
    const [text, setText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = AI_PHRASES[phraseIndex];
        
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                setText(currentPhrase.substring(0, text.length + 1));
                if (text.length === currentPhrase.length) {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                setText(currentPhrase.substring(0, text.length - 1));
                if (text.length === 0) {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % AI_PHRASES.length);
                }
            }
        }, isDeleting ? 30 : 80);

        return () => clearTimeout(timeout);
    }, [text, isDeleting, phraseIndex]);

    return (
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="font-mono text-[11px] xl:text-xs font-semibold text-white/90 bg-black/30 backdrop-blur-md px-3 py-2 rounded-lg border border-white/20 shadow-xl max-w-[90%] text-center text-balance leading-relaxed">
                {text}<span className="animate-pulse text-purple-300">|</span>
            </div>
        </div>
    );
}

export default function Login() {
    const [loginState, setLoginState] = useState(true);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const requestedPlan = (searchParams.get("plan") || "").toLowerCase();
    const isYearly = searchParams.get("interval") === "yearly";
    const hasPendingCheckout = paidPlans.has(requestedPlan);
    const displayPlanName = `${requestedPlan === "pro" ? "Pro" : "Agency"}${isYearly ? " Yearly" : ""}`;

    const startCheckout = async (plan: "pro" | "agency") => {
        let planName = plan === "pro" ? "Pro" : "Agency";
        if (isYearly) {
            planName += " Yearly";
        }
        const { data } = await api.post("/api/billing/create-checkout-session", { plan: planName });

        if (!data?.url) {
            throw new Error("Stripe checkout link was not returned.");
        }

        window.location.href = data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post(
                `/api/auth/${loginState ? "login" : "register"}`,
                { name, phone, email, password }
            );

            login(data, data.token);

            if (hasPendingCheckout) {
                await startCheckout(requestedPlan as "pro" | "agency");
                return;
            }

            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const { data } = await api.post("/api/auth/google", {
                credential: credentialResponse.credential
            });
            login(data, data.token);

            if (hasPendingCheckout) {
                await startCheckout(requestedPlan as "pro" | "agency");
                return;
            }

            navigate("/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message || "Google Login failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        if (hasPendingCheckout) {
            startCheckout(requestedPlan as "pro" | "agency").catch((error: any) => {
                toast.error(error.response?.data?.message || error?.message || "Unable to start Stripe checkout.");
            });
            return;
        }

        navigate('/dashboard');
    }, [user, navigate, hasPendingCheckout, requestedPlan, isYearly]);

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-[55%] relative bg-slate-50 overflow-hidden border-r border-slate-200">
                {/* Ambient background gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent pointer-events-none z-0" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-100/60 via-transparent to-transparent pointer-events-none z-0" />

                {/* Layout Container: Flex Column for safe stacking without overlap */}
                <div className="relative z-10 w-full h-full flex flex-col p-6 lg:p-10 xl:p-16 justify-between overflow-y-auto custom-scrollbar">
                    
                    {/* Top Section: Logo & Text */}
                    <div className="w-full max-w-xl shrink-0 mx-auto lg:mx-0">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.svg" alt="Logo" className="size-6 xl:size-7" />
                            <span className="text-lg xl:text-xl font-extrabold tracking-tighter text-slate-900">Scheduler</span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter leading-tight mb-3 text-slate-900">
                            Schedule smarter.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Grow faster.</span>
                        </h2>
                        <p className="mt-3 text-slate-600 leading-relaxed font-medium text-sm xl:text-base max-w-md">
                            Create, schedule, and auto-publish across all your social platforms — powered by AI that writes your captions for you.
                        </p>
                        
                        <div className="mt-6 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="size-8 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=f8fafc`} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs xl:text-sm font-medium text-slate-500">
                                Join <span className="text-slate-900 font-bold">2,000+</span> creators
                            </p>
                        </div>
                    </div>

                    {/* Bottom Section: Centered Mockup Card */}
                    <div className="flex-1 flex items-center justify-center w-full mt-6 shrink-0 min-h-[350px]">
                        <div className="w-full max-w-[380px] xl:max-w-[420px]">
                            <div className="animate-float">
                                <div className="w-full bg-white/90 backdrop-blur-3xl rounded-[24px] xl:rounded-[32px] border border-slate-100 p-5 xl:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 cursor-default mx-auto">
                                    
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 xl:size-10 rounded-xl xl:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                                                <svg className="size-4 xl:size-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-xs xl:text-sm font-bold text-slate-900">Post Scheduled</div>
                                                <div className="text-[10px] xl:text-xs text-blue-600 font-bold mt-0.5">Today at 5:00 PM</div>
                                            </div>
                                        </div>
                                        <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[9px] xl:text-[10px] uppercase tracking-wider font-bold rounded-full">
                                            Ready
                                        </div>
                                    </div>

                                    {/* Post Preview Area */}
                                    <div className="bg-slate-50 rounded-xl xl:rounded-2xl p-3 xl:p-4 border border-slate-100 mb-4 shadow-inner">
                                        <div className="flex items-start gap-2.5 mb-3">
                                            <div className="size-6 xl:size-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 shrink-0 border-2 border-white shadow-sm overflow-hidden">
                                                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=brand&backgroundColor=ffffff" alt="Brand" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="space-y-2 w-full pt-1">
                                                <div className="w-1/3 h-1.5 xl:h-2 bg-slate-200 rounded-full" />
                                                <div className="w-full h-1.5 xl:h-2 bg-slate-200/60 rounded-full" />
                                                <div className="w-4/5 h-1.5 xl:h-2 bg-slate-200/60 rounded-full" />
                                            </div>
                                        </div>
                                        
                                        {/* AI Typewriter Image Placeholder */}
                                        <div className="w-full h-24 xl:h-32 rounded-lg xl:rounded-xl relative overflow-hidden shadow-sm bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:12px_12px]" />
                                            <TypewriterText />
                                            <div className="absolute bottom-2 right-2 px-2 py-0.5 xl:px-2.5 xl:py-1 bg-white/90 backdrop-blur-md rounded-md xl:rounded-lg text-[9px] xl:text-[10px] font-bold text-slate-700 flex items-center gap-1 xl:gap-1.5 shadow-sm">
                                                <svg className="size-2.5 xl:size-3 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                                AI Generated
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platforms & Sync */}
                                    <div className="flex items-center justify-between px-1 xl:px-2">
                                        <div className="flex items-center gap-2 xl:gap-2.5">
                                            <span className="text-[10px] xl:text-xs font-bold text-slate-500">Platforms:</span>
                                            <div className="flex -space-x-1.5">
                                                <div className="size-5 xl:size-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shadow-sm">
                                                    <svg className="size-2.5 xl:size-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                                                </div>
                                                <div className="size-5 xl:size-6 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center shadow-sm">
                                                    <svg className="size-2.5 xl:size-3 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 xl:px-2.5 xl:py-1.5 rounded-md border border-slate-100 shadow-sm">
                                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[8px] xl:text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sync On</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="flex flex-col items-center mb-8">
                            <Link to="/" className="flex items-center gap-2 lg:hidden">
                                <img src="/logo.svg" alt="Logo" className="size-6.5" />
                                <h1 className="text-2xl">Scheduler</h1>
                            </Link>
                            <h2 className="text-2xl font-semibold text-slate-900 mt-2 lg:mt-0">
                                {loginState ? "Welcome back" : "Create account"}
                            </h2>
                            <p className="text-slate-500 text-sm mt-1.5">
                                {hasPendingCheckout ? `Sign in to continue with the ${displayPlanName} plan` : loginState ? "Sign in to your Dashboard" : "Start your free account today"}
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                            {!loginState && (
                                <>
                                    <div>
                                        <label className="block mb-1.5 text-slate-600 font-medium">Name</label>
                                        <div className="relative">
                                            <User2Icon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" required placeholder="Enter your name" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all" value={name} onChange={(e) => setName(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-slate-600 font-medium">Phone number</label>
                                        <div className="relative">
                                            <PhoneIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" placeholder="Enter your phone number" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block mb-1.5 text-slate-600 font-medium">Email</label>
                                <div className="relative">
                                    <MailIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="email" required placeholder="you@company.com" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-1.5 text-slate-600 font-medium">Password</label>
                                <div className="relative">
                                    <LockIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl transition-all" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-slate-200 hover:-translate-y-0.5 active:translate-y-0 mt-2">
                                {loading ? <LoaderCircleIcon className="size-4 animate-spin" /> : <ArrowRightIcon className="size-4" />}
                                {loading ? (hasPendingCheckout ? "Redirecting to Stripe..." : "Please wait...") : (loginState ? (hasPendingCheckout ? `Login & continue to ${displayPlanName}` : "Login") : (hasPendingCheckout ? `Create account & continue to ${displayPlanName}` : "Create account"))}
                            </button>
                        </form>

                        <div className="mt-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>
                        
                        <div className="mt-6 flex justify-center w-full">
                            <div className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error("Google Login failed")}
                                    theme="outline"
                                    size="large"
                                    text={loginState ? "signin_with" : "signup_with"}
                                />
                            </div>
                        </div>

                        <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                            {loginState ? "Don't have an account?" : "Already have an account?"}
                            <button type="button" onClick={() => setLoginState((prev) => !prev)} className="text-blue-600 font-bold ml-1 cursor-pointer hover:text-blue-700 transition-colors">
                                {loginState ? "Sign up" : "Login"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

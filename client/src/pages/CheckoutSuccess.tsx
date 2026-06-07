import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheckBigIcon, LoaderCircleIcon, SparklesIcon, ArrowRightIcon } from "lucide-react";
import Confetti from "react-confetti";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, updateUser, refreshUser } = useAuth();
    const [status, setStatus] = useState("Confirming your plan...");
    const [isSyncing, setIsSyncing] = useState(true);
    const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
    const [interval, setIntervalVal] = useState<string | null>(null);
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const syncPlan = async () => {
            const sessionId = searchParams.get("session_id");
            if (!sessionId || !user?._id) {
                setStatus("Your payment was completed, but account sync needs a logged-in user.");
                setIsSyncing(false);
                return;
            }

            try {
                const { data } = await api.post("/api/billing/confirm-session", {
                    sessionId,
                    userId: user._id,
                });

                if (data?.user) {
                    updateUser({ ...user, ...data.user });
                }

                const planParam = searchParams.get("plan");
                const intervalParam = searchParams.get("interval");
                if (planParam) setPurchasedPlan(planParam.charAt(0).toUpperCase() + planParam.slice(1));
                if (intervalParam) setIntervalVal(intervalParam.charAt(0).toUpperCase() + intervalParam.slice(1));
                
                setStatus("Your dashboard has been successfully updated with your new limits.");
            } catch (error: any) {
                setStatus(error.response?.data?.message || error?.message || "Unable to sync your plan right now.");
            } finally {
                setIsSyncing(false);
            }
        };

        syncPlan();
    }, [searchParams, user, updateUser, refreshUser]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Confetti effect if success */}
            {!isSyncing && purchasedPlan && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <Confetti
                        width={windowDimension.width}
                        height={windowDimension.height}
                        recycle={false}
                        numberOfPieces={600}
                        gravity={0.12}
                        colors={['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#F59E0B']}
                    />
                </div>
            )}
            
            {/* Premium Ambient Background */}
            <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSJyZ2JhKDAsIDAsIDAsIDAuMDMpIi8+Cjwvc3ZnPg==')] pointer-events-none" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[800px] opacity-70 mix-blend-multiply pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-200/60 rounded-full blur-[100px] animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-200/60 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 md:p-14 text-center animate-fade-in-up relative z-10 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
                
                {/* Icon Container */}
                <div className="mx-auto mb-10 relative">
                    <div className="absolute inset-0 bg-emerald-400 blur-[40px] opacity-20 rounded-full animate-pulse-glow" />
                    <div className="relative flex size-28 items-center justify-center rounded-full bg-gradient-to-b from-white to-slate-50 border border-slate-100 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] mx-auto overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-50" />
                        {isSyncing ? (
                            <LoaderCircleIcon className="size-12 text-slate-400 animate-spin relative z-10" />
                        ) : (
                            <CircleCheckBigIcon className="size-12 text-emerald-500 relative z-10 animate-scale-in drop-shadow-sm" />
                        )}
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 animate-fade-in-up-delay-1">
                    {isSyncing ? "Confirming..." : "Payment Success"}
                </h1>
                
                {!isSyncing && purchasedPlan && (
                    <div className="mt-6 mb-6 inline-flex flex-col items-center gap-3 animate-fade-in-up-delay-2">
                        <div className="px-6 py-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-900 shadow-lg shadow-slate-900/20">
                            <span className="flex items-center gap-2 text-white font-bold tracking-wide text-sm">
                                <SparklesIcon className="size-4 text-emerald-400" />
                                WELCOME TO THE {purchasedPlan.toUpperCase()} PLAN
                            </span>
                        </div>
                        {interval && (
                            <div className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
                                Billing Cycle
                                <span className="text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 uppercase text-xs tracking-bold font-bold shadow-sm">
                                    {interval}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <p className="mt-4 text-slate-500 font-medium leading-relaxed max-w-sm mx-auto text-lg animate-fade-in-up-delay-2">
                    {status}
                </p>
                
                <div className="mt-12 flex flex-col gap-3 justify-center animate-fade-in-up-delay-3">
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        className="group relative flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-8 py-4 font-bold transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800 shadow-lg shadow-slate-900/20 w-full overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                        Go to Dashboard
                        <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <Link 
                        to="/accounts" 
                        className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm w-full"
                    >
                        Manage Accounts
                    </Link>
                </div>
            </div>
        </div>
    );
}

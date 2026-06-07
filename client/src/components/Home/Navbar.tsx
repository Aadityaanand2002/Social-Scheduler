import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AnimatedLogo } from "../AnimatedLogo";

export default function Navbar() {
    const { user } = useAuth();

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 bg-white/80 backdrop-blur-3xl border border-slate-200 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="px-6 sm:px-8 h-20 flex items-center justify-between">
                <Link to="/" onClick={() => scrollTo(0, 0)} className="flex items-center gap-3 group">
                    <div className="relative">
                        <AnimatedLogo className="size-12 bg-white text-slate-900 group-hover:scale-110" iconClassName="size-7" />
                        <div className="absolute inset-0 bg-blue-300 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                    </div>
                    <span className="text-2xl font-extrabold tracking-tighter text-slate-900 hidden sm:block">Scheduler</span>
                </Link>
                
                <div className="hidden md:flex items-center gap-2">
                    <a href="#features" className="text-[15px] font-semibold tracking-wide text-slate-500 hover:text-blue-600 px-5 py-2.5 rounded-full hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all">Features</a>
                    <a href="#how-it-works" className="text-[15px] font-semibold tracking-wide text-slate-500 hover:text-blue-600 px-5 py-2.5 rounded-full hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all">How it works</a>
                    <a href="#pricing" className="text-[15px] font-semibold tracking-wide text-slate-500 hover:text-blue-600 px-5 py-2.5 rounded-full hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all">Pricing</a>
                </div>

                {user ? (
                    <div className="flex items-center gap-5">
                        <span className="hidden sm:inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{(user.planType || 'starter').toUpperCase()}</span>
                        <Link to="/dashboard" className="flex items-center gap-2 text-base font-bold bg-slate-900 text-white px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-blue-500/20 hover:bg-blue-600">
                            Dashboard <ArrowRightIcon className="size-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-5">
                        <Link to="/login" className="text-[15px] font-semibold tracking-wide text-slate-500 hover:text-blue-600 hidden sm:block px-5 py-2.5 rounded-full hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all">
                            Sign In
                        </Link>
                        <Link to="/login" className="relative group overflow-hidden flex items-center gap-2 text-base font-bold text-slate-900 px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 group-hover:text-blue-600 transition-colors">Get Started</span> 
                            <ArrowRightIcon className="relative z-10 size-5 group-hover:translate-x-1 transition-transform text-blue-500" />
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

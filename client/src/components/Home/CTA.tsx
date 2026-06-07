import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

export default function CTA() {
    return (
        <section className="relative py-40 bg-slate-50 overflow-hidden flex items-center justify-center min-h-[80vh]">
            {/* The Event Horizon Glowing Core - Light Pastel Version */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-200/80 via-purple-100/40 to-transparent blur-[100px] rounded-full pointer-events-none animate-pulse-glow" />
            
            {/* Center bright core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white blur-[50px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 text-center">
                <div className="mb-8 inline-flex items-center gap-2 bg-white/80 border border-slate-200 text-slate-700 text-xs font-bold tracking-[0.2em] uppercase px-5 py-2.5 rounded-full backdrop-blur-xl shadow-sm">
                    <span className="size-2 bg-blue-500 rounded-full animate-ping" />
                    System Ready
                </div>
                
                <h2 className="tracking-tighter text-6xl sm:text-7xl md:text-8xl leading-[0.9] font-bold text-slate-900 mb-8">
                    Automate your
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-800 to-slate-500">social media.</span>
                </h2>
                
                <p className="mt-6 text-slate-600 max-w-xl mx-auto text-xl sm:text-2xl tracking-tight font-light mb-12">
                    Join the creators who trust our engine to grow their audience on autopilot.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link to="/login" className="group relative inline-flex items-center justify-center gap-3 bg-slate-900 text-white rounded-full font-bold text-base px-8 py-4 w-full sm:w-auto overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-slate-300">
                        <span className="relative z-10">Get Started</span>
                        <div className="relative z-10 size-7 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:translate-x-2 transition-transform duration-300">
                            <ArrowRightIcon className="size-3.5" />
                        </div>
                    </Link>
                </div>

                <p className="mt-10 text-sm text-slate-500 font-medium tracking-wide">NO CREDIT CARD REQUIRED <span className="mx-2 opacity-30">•</span> CANCEL ANYTIME</p>
            </div>
        </section>
    );
}

import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-32 pb-16 lg:pt-24 lg:pb-0 overflow-hidden bg-white">
            {/* Ambient Background Lights - Light Pastel Theme */}
            <div className="absolute top-1/4 -left-1/4 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/50 via-white to-white blur-[120px] rounded-full pointer-events-none" />

            <div className="relative max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col lg:flex-row items-center mt-12 lg:mt-0">
                
                {/* Left: Massive Typography */}
                <div className="flex-1 w-full text-left lg:pr-10 z-20">
                    <h1 className="font-bold text-slate-900 tracking-tighter leading-[0.9] flex flex-col gap-2">
                        <span className="text-6xl md:text-7xl lg:text-[90px] xl:text-[110px] opacity-90 hover:opacity-100 transition-opacity">Schedule smarter.</span>
                        <span className="text-6xl md:text-7xl lg:text-[90px] xl:text-[110px] text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 drop-shadow-sm">Grow faster.</span>
                    </h1>
                    
                    <p className="mt-12 text-xl lg:text-3xl text-slate-600 font-light max-w-2xl leading-snug tracking-tight">
                        Break free from manual posting. Let our intelligence engine craft, schedule, and grow your audience while you sleep.
                    </p>

                    <div className="mt-12 lg:mt-16 flex flex-wrap items-center gap-6">
                        <Link to="/login" className="group relative inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full text-base font-semibold overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-slate-300">
                            <span className="relative z-10">Get Started</span>
                            <div className="relative z-10 size-7 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                                <ArrowRightIcon className="size-3.5" />
                            </div>
                        </Link>
                        <a href="#features" className="text-slate-600 border-b border-slate-300 pb-1 text-lg font-medium hover:border-slate-900 hover:text-slate-900 transition-colors">
                            Discover the engine
                        </a>
                    </div>
                </div>

                {/* Right: Asymmetric Floating Cluster */}
                <div className="flex-1 w-full mt-24 lg:mt-0 relative h-[600px] perspective-[2000px] z-10 hidden md:block">
                    {/* Main floating light card Wrapper */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 perspective-[1000px] z-20">
                        <div className="w-[400px] h-[500px] animate-float-3d relative group">
                            
                            {/* Rotating Border Layer */}
                            <div className="absolute -inset-[2px] rounded-[42px] overflow-hidden pointer-events-none">
                                <div className="absolute -left-[50%] -top-[50%] w-[200%] h-[200%] animate-[spin_4s_linear_infinite]">
                                    <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(0,0,0,1)_50%,transparent_100%)] animate-pulse" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>

                            {/* The Main Card Layer */}
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-3xl border border-slate-200/60 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_40px_rgba(59,130,246,0.05)] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent rounded-[40px] pointer-events-none" />
                                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                    
                                    {/* Top section: The stats and badge */}
                                    <div>
                                        <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-full mb-6 shadow-sm">
                                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">AI Powered Automation</div>
                                        </div>
                                        <div className="text-5xl font-extrabold text-slate-900 tracking-tighter drop-shadow-sm">+482%</div>
                                        <div className="text-sm font-medium text-slate-500 mt-1">Engagement Spike</div>
                                    </div>

                                    {/* Bottom section: Campaign details */}
                                    <div>
                                        <div className="w-16 h-1 bg-slate-200 rounded-full mb-6" />
                                        <h3 className="text-3xl font-bold text-slate-900 tracking-tighter mb-2">Campaign Alpha</h3>
                                        <p className="text-slate-600 mb-8 font-medium">14 posts scheduled across 8 networks. AI engagement active.</p>
                                        <div className="flex -space-x-4">
                                            {/* Twitter */}
                                            <div className="size-12 rounded-full border-2 border-white bg-[#1DA1F2] flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-10"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></div>
                                            {/* LinkedIn */}
                                            <div className="size-12 rounded-full border-2 border-white bg-[#0A66C2] flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-20"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></div>
                                            {/* Instagram */}
                                            <div className="size-12 rounded-full border-2 border-white bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-30"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></div>
                                            {/* Facebook */}
                                            <div className="size-12 rounded-full border-2 border-white bg-[#1877F2] flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-40"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                                            {/* YouTube */}
                                            <div className="size-12 rounded-full border-2 border-white bg-[#FF0000] flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-50"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>
                                            {/* TikTok */}
                                            <div className="size-12 rounded-full border-2 border-white bg-black flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-50"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.61-5.46-.02-.33-.02-.66-.01-.99.12-1.49.72-2.93 1.74-4.04 1.25-1.36 3.12-2.2 4.99-2.28.27-.01.54-.01.81-.01v4.06c-.23.01-.46.01-.69.02-1.1.06-2.17.65-2.76 1.57-.46.72-.63 1.63-.44 2.48.16.85.74 1.6 1.48 2.02.73.41 1.61.54 2.41.35.83-.19 1.55-.73 1.96-1.48.33-.61.52-1.31.52-2.01V.02h3.91z"/></svg></div>
                                            {/* Pinterest */}
                                            <div className="size-12 rounded-full border-2 border-white bg-[#E60023] flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-50"><svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-white"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.433 2.977 7.433 6.953 0 4.155-2.616 7.502-6.248 7.502-1.22 0-2.368-.634-2.763-1.385l-.754 2.875c-.274 1.045-1.02 2.348-1.524 3.142 1.134.331 2.327.509 3.559.509 6.627 0 11.989-5.368 11.989-11.988C24.004 5.367 18.644 0 12.017 0z"/></svg></div>
                                            {/* Media / Assets */}
                                            <div className="size-12 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center shadow-md transform hover:scale-110 transition-transform z-50"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-white"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

            </div>
        </section>
    );
}

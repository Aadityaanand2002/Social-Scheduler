import { StarIcon } from "lucide-react";

const testimonials = [
    {
        name: "Sarah K.",
        role: "Marketing Manager",
        avatar: "S",
        avatarBg: "from-red-400 to-pink-400",
        text: "Scheduler has saved our team 10+ hours a week. The AI composer is genuinely impressive — it writes content that sounds like us.",
    },
    {
        name: "Marcus L.",
        role: "Indie Creator",
        avatar: "M",
        avatarBg: "from-violet-400 to-purple-500",
        text: "I used to dread posting. Now I queue up a whole week of content in 20 minutes. The smart scheduling feature alone is worth it.",
    },
    {
        name: "Priya D.",
        role: "Startup Founder",
        avatar: "P",
        avatarBg: "from-sky-400 to-blue-500",
        text: "Finally a scheduler that's beautiful AND powerful. The clean dashboard makes it easy to see exactly what's going out and when.",
    },
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-14">
                <div className="text-center">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full shadow-sm">
                        <StarIcon className="size-3 text-yellow-500" />
                        Testimonials
                    </div>
                    <h2 className="font-bold tracking-tighter text-4xl sm:text-5xl leading-tight text-slate-900">
                        Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">creators &amp; teams</span>
                    </h2>
                    <p className="mt-5 text-slate-600 max-w-md mx-auto font-medium">Join thousands of people who automate their social media with Scheduler.</p>
                </div>
            </div>
            
            <div className="relative w-full flex overflow-hidden">
                {/* Left/Right fading edges */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="flex w-max animate-marquee py-4">
                    {/* Double the array for seamless looping */}
                    {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                        <div key={i} className="relative w-[350px] mx-3 shrink-0 h-full flex flex-col group">
                            {/* Rotating Border Layer */}
                            <div className="absolute -inset-[1px] rounded-[17px] overflow-hidden pointer-events-none opacity-100 transition-opacity">
                                <div className="absolute -left-[50%] -top-[50%] w-[200%] h-[200%] animate-[spin_4s_linear_infinite]">
                                    <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(0,0,0,1)_50%,transparent_100%)] animate-pulse" style={{ animationDuration: '2s' }} />
                                </div>
                            </div>

                            {/* Main Card Layer */}
                            <div className="relative z-10 flex flex-col h-full bg-white rounded-2xl p-6 transition-all shadow-sm hover:shadow-md border border-white">
                                <div className="absolute inset-0 rounded-2xl bg-white/90 backdrop-blur-xl -z-10" />
                                <p className="text-slate-700 text-sm leading-relaxed flex-1 font-medium">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className={`size-9 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>{t.avatar}</div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{t.name}</div>
                                        <div className="text-xs text-slate-500 font-medium">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { Wand2Icon, Share2Icon, BarChart3Icon } from "lucide-react";

const massiveFeatures = [
    {
        title: "The AI Engine.",
        subtitle: "Never stare at a blank page again.",
        description: "Deploy our advanced models to craft on-brand captions, generate stunning visuals, and maintain your unique voice across every platform. It's like having a full-time creative director.",
        color: "from-pink-100",
        icon: <Wand2Icon className="size-10 text-pink-500" />,
        imagePlaceholder: "bg-white border-pink-100 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.1)]",
        reverse: false
    },
    {
        title: "Total Automation.",
        subtitle: "Schedule once. Dominate everywhere.",
        description: "Connect Twitter, LinkedIn, Instagram, and Facebook. Set up your intelligence queues and let the system automatically optimize posting times for maximum engagement.",
        color: "from-blue-100",
        icon: <Share2Icon className="size-10 text-blue-500" />,
        imagePlaceholder: "bg-white border-blue-100 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)]",
        reverse: true
    },
    {
        title: "Deep Analytics.",
        subtitle: "Know exactly what works.",
        description: "Stop guessing. Get a unified dashboard that tracks cross-platform engagement, audience growth, and AI performance metrics in real-time.",
        color: "from-emerald-100",
        icon: <BarChart3Icon className="size-10 text-emerald-500" />,
        imagePlaceholder: "bg-white border-emerald-100 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.1)]",
        reverse: false
    }
];

export default function Features() {
    return (
        <section id="features" className="py-32 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-40">
                    {massiveFeatures.map((f, i) => (
                        <div key={i} className={`flex flex-col ${f.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-32`}>
                            
                            {/* Text Content */}
                            <div className="flex-1 w-full relative z-20">
                                <div className="mb-8 p-4 bg-white inline-block rounded-2xl border border-slate-200 shadow-sm">
                                    {f.icon}
                                </div>
                                <h2 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tighter leading-[1.1] mb-6">
                                    {f.title}
                                </h2>
                                <h3 className="text-2xl text-slate-600 tracking-tight font-medium mb-6">
                                    {f.subtitle}
                                </h3>
                                <p className="text-lg text-slate-500 leading-relaxed max-w-xl font-light">
                                    {f.description}
                                </p>
                            </div>

                            {/* Massive Visual / Mockup */}
                            <div className="flex-1 w-full relative z-10 perspective-[1000px]">
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] ${f.color} via-transparent to-transparent opacity-50 blur-[100px] -z-10`} />
                                
                                <div className="relative w-full aspect-square lg:aspect-[4/3] group transition-transform duration-700 hover:rotate-y-[5deg] hover:scale-[1.02]">
                                    
                                    {/* Rotating Border Layer */}
                                    <div className="absolute -inset-[2px] rounded-[42px] overflow-hidden pointer-events-none">
                                        <div className="absolute -left-[50%] -top-[50%] w-[200%] h-[200%] animate-[spin_4s_linear_infinite]">
                                            <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(0,0,0,1)_50%,transparent_100%)] animate-pulse" style={{ animationDuration: '2s' }} />
                                        </div>
                                    </div>

                                    {/* The Main Card Layer */}
                                    <div className={`absolute inset-0 rounded-[40px] border ${f.imagePlaceholder} flex items-center justify-center overflow-hidden bg-white/90 backdrop-blur-3xl`}>
                                        <div className="w-[85%] h-[85%] border border-slate-200 rounded-3xl bg-slate-50 flex flex-col p-6 relative z-10 overflow-hidden shadow-sm">
                                        {/* Browser / App Header */}
                                        <div className="w-full flex items-center gap-2 mb-8 pb-4 border-b border-slate-200">
                                            <div className="size-3 rounded-full bg-[#FF5F56]" />
                                            <div className="size-3 rounded-full bg-[#FFBD2E]" />
                                            <div className="size-3 rounded-full bg-[#27C93F]" />
                                        </div>
                                        
                                        {/* Dynamic Content Based on Feature Index */}
                                        <div className="flex-1 flex flex-col">
                                            {i === 0 && (
                                                <div className="space-y-4 w-full">
                                                    <div className="self-end bg-blue-50 text-blue-600 border border-blue-100 px-4 py-3 rounded-2xl rounded-tr-sm text-sm w-3/4 ml-auto font-medium">
                                                        Write a viral thread about the future of SaaS automation.
                                                    </div>
                                                    <div className="self-start bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-2xl rounded-tl-sm text-sm w-5/6 space-y-2 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Wand2Icon className="size-4 text-pink-500" />
                                                            <span className="font-bold text-slate-800">AI Engine</span>
                                                        </div>
                                                        <p>Here is your 5-part thread on SaaS automation...</p>
                                                        <div className="w-full h-2 bg-slate-100 rounded-full mt-2" />
                                                        <div className="w-5/6 h-2 bg-slate-100 rounded-full" />
                                                        <div className="w-4/6 h-2 bg-slate-100 rounded-full" />
                                                    </div>
                                                </div>
                                            )}

                                            {i === 1 && (
                                                <div className="w-full h-full flex flex-col">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-slate-800 font-bold">October 2026</span>
                                                        <div className="flex gap-2">
                                                            <div className="px-3 py-1 rounded-full bg-slate-200 text-xs font-semibold text-slate-700">Week</div>
                                                            <div className="px-3 py-1 rounded-full bg-transparent text-xs text-slate-500 font-medium">Month</div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-5 gap-2 flex-1">
                                                        {[...Array(15)].map((_, idx) => (
                                                            <div key={idx} className="bg-white rounded-lg border border-slate-200 p-2 flex flex-col justify-between shadow-sm">
                                                                <span className="text-[10px] text-slate-500 font-medium">{idx + 1}</span>
                                                                {(idx === 2 || idx === 7 || idx === 12) && <div className="h-1.5 w-full bg-blue-400 rounded-full" />}
                                                                {(idx === 4 || idx === 7 || idx === 10) && <div className="h-1.5 w-3/4 bg-pink-400 rounded-full mt-1" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {i === 2 && (
                                                <div className="w-full h-full flex flex-col">
                                                    <div className="flex gap-4 mb-6">
                                                        <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                                                            <div className="text-xs text-slate-500 mb-1 font-medium">Total Reach</div>
                                                            <div className="text-2xl font-bold text-slate-900">2.4M</div>
                                                            <div className="text-xs text-emerald-500 mt-1 font-medium">+14.2%</div>
                                                        </div>
                                                        <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                                                            <div className="text-xs text-slate-500 mb-1 font-medium">Engagement</div>
                                                            <div className="text-2xl font-bold text-slate-900">84.2K</div>
                                                            <div className="text-xs text-emerald-500 mt-1 font-medium">+8.1%</div>
                                                        </div>
                                                    </div>
                                                    {/* Fake Chart */}
                                                    <div className="flex-1 w-full flex items-end gap-2 pb-2">
                                                        {[40, 70, 45, 90, 65, 85, 100, 60, 80].map((h, idx) => (
                                                            <div key={idx} className="flex-1 bg-gradient-to-t from-emerald-100 to-emerald-300 rounded-t-sm" style={{ height: `${h}%` }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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

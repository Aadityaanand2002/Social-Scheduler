import { CheckCircleIcon } from "lucide-react";

const steps = [
    { step: "01", title: "Connect Your Accounts", description: "Link your social profiles in seconds. We support Twitter, LinkedIn, Facebook, and Instagram." },
    { step: "02", title: "Create or Generate Content", description: "Write your own post or let our AI craft a caption and image based on your prompt." },
    { step: "03", title: "Schedule & Publish", description: "Pick a time, select your platforms, and hit schedule. We handle publishing automatically." },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <div className="mb-6 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold tracking-[0.06em] uppercase px-3.5 py-1.5 rounded-full shadow-sm">
                        <CheckCircleIcon className="size-3 text-blue-500" />
                        Simple setup
                    </div>
                    <h2 className="font-bold tracking-tighter text-4xl sm:text-5xl leading-tight text-slate-900">
                        Up and running in <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">minutes</span>
                    </h2>
                    <p className="mt-5 text-slate-600 max-w-lg mx-auto leading-relaxed">No complicated onboarding, no steep learning curve. Just connect, create, and grow.</p>
                </div>

                <div className="relative space-y-12 max-w-2xl mx-auto">
                    {/* The pastel vertical line */}
                    <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent pointer-events-none" />

                    {steps.map((s) => (
                        <div key={s.step} className="flex gap-8 items-start relative z-10 group">
                            <div className="shrink-0 size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-blue-300 group-hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.2)] group-hover:bg-blue-50 transition-all">
                                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">{s.step}</span>
                            </div>
                            <div className="pt-2">
                                <h3 className="text-xl text-slate-900 font-bold mb-2 tracking-tight group-hover:text-blue-600 transition-colors">{s.title}</h3>
                                <p className="text-slate-600 text-base leading-relaxed tracking-tight">{s.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

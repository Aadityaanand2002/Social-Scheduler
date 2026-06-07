import { useState } from "react";
import { CheckIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router-dom";

const pricingPlans = [
    {
        name: "Starter",
        monthlyPrice: "Free",
        yearlyPrice: "Free",
        period: "",
        description: "Perfect for creators just getting started with social media automation.",
        features: ["2 social accounts", "10 scheduled posts/month", "AI content (5 credits/mo)", "Basic dashboard"],
        cta: "Get Started Free",
        highlight: false,
    },
    {
        name: "Pro",
        monthlyPrice: "$29",
        yearlyPrice: "$19",
        period: "/month",
        description: "Everything you need to grow and automate your social presence.",
        features: ["Unlimited accounts", "Unlimited scheduling", "AI content (200 credits/mo)", "Priority support"],
        cta: "Checkout with Stripe",
        highlight: true,
    },
    {
        name: "Agency",
        monthlyPrice: "$79",
        yearlyPrice: "$59",
        period: "/month",
        description: "For teams and agencies managing multiple brands at scale.",
        features: ["Everything in Pro", "5 team members", "Unlimited AI credits", "Custom AI personas", "Dedicated support"],
        cta: "Checkout with Stripe",
        highlight: false,
    },
];

export default function Pricing() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section id="pricing" className="py-32 bg-slate-50 relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-50 to-slate-50 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="mb-6 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-sm">
                        <SparklesIcon className="size-4" />
                        Simple & Transparent
                    </div>
                    <h2 className="font-bold tracking-tighter text-5xl sm:text-6xl leading-tight text-slate-900 mb-6">
                        Scale without limits.
                    </h2>
                    
                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-10">
                        <span className={`text-sm font-semibold transition-colors ${!isYearly ? "text-slate-900" : "text-slate-500"}`}>Monthly</span>
                        <button 
                            onClick={() => setIsYearly(!isYearly)}
                            className={`relative w-16 h-8 rounded-full border transition-colors focus:outline-none ${isYearly ? "bg-blue-500 border-blue-600 hover:bg-blue-600" : "bg-slate-200 border-slate-300 hover:bg-slate-300"}`}
                        >
                            <div className={`absolute top-1/2 -translate-y-1/2 left-1 size-6 rounded-full bg-white shadow-md transition-transform duration-300 ${isYearly ? "translate-x-8" : "translate-x-0"}`} />
                        </button>
                        <span className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isYearly ? "text-slate-900" : "text-slate-500"}`}>
                            Yearly <span className="bg-emerald-100 text-emerald-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-16 perspective-[2000px]">
                    {pricingPlans.map((plan) => {
                        const isPaidPlan = plan.name === "Pro" || plan.name === "Agency";
                        const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

                        return (
                            <div key={plan.name} className={`relative group transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${plan.highlight ? "z-20 md:-mt-8 md:mb-8" : "z-10"}`}>
                                
                                {/* Rotating Border Layer */}
                                <div className={`absolute -inset-[2px] rounded-[34px] overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${plan.highlight ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}`}>
                                    {!plan.highlight && (
                                        <div className="absolute -left-[50%] -top-[50%] w-[200%] h-[200%] animate-[spin_4s_linear_infinite]">
                                            <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(0,0,0,1)_50%,transparent_100%)] animate-pulse" style={{ animationDuration: '2s' }} />
                                        </div>
                                    )}
                                </div>

                                <div className={`h-full rounded-[32px] p-8 flex flex-col gap-6 relative bg-white text-slate-900 border ${
                                    plan.highlight 
                                    ? "border-transparent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.2)]" 
                                    : "border-slate-200 hover:shadow-md"
                                }`}>
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="relative z-10">
                                    <div className={`text-lg font-bold mb-2 ${plan.highlight ? "text-blue-600" : "text-slate-900"}`}>{plan.name}</div>
                                    <div className="flex items-end gap-1 mb-4">
                                        <span className="text-5xl font-black tracking-tighter">{price}</span>
                                        {plan.period && <span className={`text-sm mb-1.5 font-medium ${plan.highlight ? "text-slate-500" : "text-slate-500"}`}>{isYearly && isPaidPlan ? "/mo, billed yearly" : plan.period}</span>}
                                    </div>
                                    <p className={`text-sm leading-relaxed ${plan.highlight ? "text-slate-600" : "text-slate-600"}`}>{plan.description}</p>
                                </div>

                                <div className="w-full h-px bg-slate-100 my-2 relative z-10" />

                                <ul className="space-y-4 relative z-10 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-3 text-sm">
                                            <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                                                <CheckIcon className="w-3 h-3 stroke-[3]" />
                                            </div>
                                            <span className={plan.highlight ? "text-slate-800 font-medium" : "text-slate-700"}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8 relative z-10">
                                    {isPaidPlan ? (
                                        <Link
                                            to={`/login?plan=${plan.name.toLowerCase()}${isYearly ? '&interval=yearly' : ''}`}
                                            className={`block w-full text-center font-bold text-sm px-6 py-4 rounded-full transition-all ${
                                                plan.highlight 
                                                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:scale-105" 
                                                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:scale-105"
                                            }`}
                                        >
                                            Continue to {plan.name} {isYearly ? "Yearly" : ""}
                                        </Link>
                                    ) : (
                                        <Link 
                                            to="/login" 
                                            className={`block w-full text-center font-bold text-sm px-6 py-4 rounded-full transition-all ${
                                                plan.highlight 
                                                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:scale-105" 
                                                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:scale-105"
                                            }`}
                                        >
                                            {plan.cta}
                                        </Link>
                                    )}
                                </div>
                            </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

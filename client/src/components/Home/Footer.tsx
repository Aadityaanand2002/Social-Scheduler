import { Link } from "react-router-dom";
import { AnimatedLogo } from "../AnimatedLogo";
import { motion } from "framer-motion";

const footerLinks = {
    Product: ["Features", "How it works", "Pricing", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" onClick={() => scrollTo(0, 0)} className="inline-flex items-center gap-3 mb-8 group">
                            <AnimatedLogo className="size-8 group-hover:scale-105 transition-transform" />
                            <span className="font-bold tracking-tight text-3xl text-slate-900">Scheduler</span>
                        </Link>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-sm tracking-tight mb-8">
                            The intelligent social media automation engine designed for hyper-growth.
                        </p>
                        <div className="flex items-center gap-4">
                            {/* Social Placeholders */}
                            <div className="size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-slate-400"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                            </div>
                            <div className="size-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-slate-400"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <div className="text-sm font-bold uppercase tracking-[0.15em] mb-8 text-slate-900">{category}</div>
                            <ul className="space-y-4">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-[15px] font-medium text-slate-500 hover:text-blue-600 transition-colors relative group">
                                            {link}
                                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-600 transition-all group-hover:w-full" />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Massive Cinematic Typography */}
                <div className="w-full overflow-hidden flex justify-center py-32 pointer-events-none select-none [perspective:1000px]">
                    <motion.div 
                        className="flex whitespace-nowrap"
                        variants={{
                            animate: { transition: { staggerChildren: 0.1 } }
                        }}
                        initial="initial"
                        animate="animate"
                    >
                        {"SOCIAL SCHEDULER".split("").map((char, index) => (
                            <motion.span 
                                key={index}
                                variants={{
                                    initial: { x: "50vw", y: 50, rotateZ: 30, rotateY: 90, opacity: 0, scale: 0.3 },
                                    animate: { 
                                        x: ["50vw", "0vw", "0vw", "-50vw"], 
                                        y: [50, 0, 0, -50],
                                        rotateZ: [30, 0, 0, -30],
                                        rotateY: [90, 0, 0, -90],
                                        opacity: [0, 1, 1, 0],
                                        scale: [0.3, 1, 1, 0.3],
                                        transition: { 
                                            duration: 6,
                                            times: [0, 0.25, 0.75, 1],
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }
                                    }
                                }}
                                className="text-[12vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-500 to-slate-900 tracking-tighter leading-none drop-shadow-2xl opacity-90 inline-block"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-slate-200 mt-10">
                    <p className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} Scheduler Inc. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Privacy</a>
                        <a href="#" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Terms</a>
                        <Link to="/login" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Sign In</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

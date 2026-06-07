export const AnimatedLogo = ({ className = "size-8 bg-white text-slate-900", iconClassName = "size-5" }: { className?: string, iconClassName?: string }) => {
    return (
        <div className={`relative z-10 rounded-[8px] shadow-sm flex items-center justify-center border border-slate-100/50 transition-all duration-500 ${className}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-hourglass-flip ${iconClassName}`}>
                <path d="M5 22h14"/>
                <path d="M5 2h14"/>
                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/>
                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
                <path d="M12 12v3" className="animate-hourglass-stream"/>
                <circle cx="12" cy="18" r="1" fill="currentColor" className="animate-hourglass-particle"/>
            </svg>
        </div>
    );
};

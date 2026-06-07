import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { LifeBuoyIcon, ShieldAlertIcon, SparklesIcon, SendIcon, CheckCircle2Icon, CrownIcon, PhoneIcon, MailIcon, MessageSquareIcon, XIcon } from "lucide-react";

interface Reply {
    sender: "user" | "admin";
    message: string;
    createdAt: string;
}

interface Ticket {
    _id: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    createdAt: string;
    replies?: Reply[];
}

const Support = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);

    const currentPlan = (user?.planType || "starter").toLowerCase();

    useEffect(() => {
        if (currentPlan === "starter") {
            setFetching(false);
            return;
        }

        const fetchTickets = async () => {
            try {
                const { data } = await api.get("/api/support");
                setTickets(data);
            } catch (error) {
                console.error("Failed to fetch tickets", error);
            } finally {
                setFetching(false);
            }
        };
        fetchTickets();
    }, [currentPlan]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            toast.error("Subject and message are required");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post("/api/support", { subject, message });
            toast.success("Ticket created successfully");
            setSubject("");
            setMessage("");
            setTickets([data.ticket, ...tickets]);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (ticketId: string) => {
        if (!replyText.trim()) return;
        setReplyLoading(true);
        try {
            const { data } = await api.post(`/api/support/${ticketId}/reply`, { message: replyText });
            toast.success("Reply sent");
            setReplyText("");
            setTickets(tickets.map(t => t._id === ticketId ? data.ticket : t));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        } finally {
            setReplyLoading(false);
        }
    };

    if (currentPlan === "starter") {
        return (
            <div className="animate-fade-in-up max-w-4xl mx-auto space-y-6">
                <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-md">
                    <div className="flex flex-col items-center justify-center text-center py-12 relative z-10">
                        <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center mb-8 shadow-sm border border-slate-200">
                            <ShieldAlertIcon className="size-10 text-slate-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Priority Support is for Premium Users</h1>
                        <p className="mt-4 text-slate-600 font-medium max-w-md leading-relaxed">
                            Starter users have access to our community guides and FAQs. Upgrade to Pro or Agency to get dedicated email support and priority ticketing.
                        </p>
                        <a href="/profile" className="mt-10 rounded-xl bg-slate-900 px-8 py-4 text-sm font-bold text-white shadow-md hover:shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300">
                            Upgrade to Premium
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up max-w-6xl mx-auto space-y-8 font-sans">
            {/* Sleek Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">
                        <span className={`h-1.5 w-1.5 rounded-full ${currentPlan === 'agency' ? 'bg-amber-400' : 'bg-blue-500'}`} />
                        {currentPlan === 'agency' ? 'VIP Access' : 'Priority Access'}
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl capitalize text-slate-900 pb-1 flex items-center gap-3">
                        {currentPlan === 'agency' ? 'Dedicated Support' : 'Premium Support'}
                        {currentPlan === 'agency' ? <CrownIcon className="size-6 md:size-8 text-amber-400" /> : <SparklesIcon className="size-6 md:size-8 text-blue-500" />}
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 font-medium max-w-2xl">
                        {currentPlan === 'agency' 
                            ? 'As an Agency user, your tickets are prioritized and guaranteed a response within 1 hour.'
                            : 'Our expert team will respond to your premium support tickets within 24 hours.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
                {/* Left Column: Form & Conversation */}
                <div className="space-y-8">
                    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute inset-x-0 top-0 h-1 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600 border border-slate-200"><LifeBuoyIcon className="size-5" /></div>
                            Submit a New Ticket
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                                <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none placeholder-slate-400 font-medium" placeholder="Briefly describe your issue..." required />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">Message</label>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm text-slate-900 transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 min-h-[140px] resize-none outline-none placeholder-slate-400 font-medium" placeholder="Provide as much detail as possible..." required />
                            </div>

                            <button type="submit" disabled={loading} className="group relative w-full overflow-hidden rounded-xl px-6 py-4 text-sm font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 bg-[#0A0A0A] hover:bg-[#111] shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                                {loading ? 'Submitting...' : 'Send Ticket'}
                                <SendIcon className="size-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    {expandedTicketId && (
                        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm animate-fade-in">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 border border-slate-200"><MessageSquareIcon className="size-4" /></div>
                                    Ticket Conversation
                                </h3>
                                <button onClick={() => setExpandedTicketId(null)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors">
                                    <XIcon className="size-5" />
                                </button>
                            </div>
                            
                            {(() => {
                                const activeTicket = tickets.find(t => t._id === expandedTicketId);
                                if (!activeTicket) return null;
                                return (
                                    <div className="space-y-6">
                                        {/* Initial Message */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm relative">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 rounded-l-2xl"></div>
                                            <div className="flex items-center justify-between mb-2 pl-3">
                                                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">You</p>
                                                <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">{new Date(activeTicket.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-900 font-bold mb-2 pl-3">{activeTicket.subject}</p>
                                            <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed pl-3">{activeTicket.message}</p>
                                        </div>

                                        {/* Replies */}
                                        {activeTicket.replies?.map((reply, idx) => (
                                            <div key={idx} className={`p-5 rounded-2xl border shadow-sm relative ${reply.sender === 'admin' ? 'bg-slate-100 border-slate-300 ml-8' : 'bg-slate-50 border-slate-200 mr-8'}`}>
                                                <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${reply.sender === 'admin' ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                                                <div className="flex items-center justify-between mb-2 pl-3">
                                                    <p className={`text-xs font-bold uppercase tracking-wider ${reply.sender === 'admin' ? 'text-slate-900' : 'text-slate-700'}`}>
                                                        {reply.sender === 'admin' ? 'Support Team' : 'You'}
                                                    </p>
                                                    <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-1 rounded-md border border-slate-200">
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed pl-3">{reply.message}</p>
                                            </div>
                                        ))}

                                        {/* Reply Box */}
                                        {activeTicket.status !== 'resolved' && (
                                            <div className="pt-6 mt-4 border-t border-slate-200 flex gap-3">
                                                <input value={replyText} onChange={(e) => setReplyText(e.target.value)} type="text" placeholder="Type your reply here..." className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-5 text-sm font-medium text-slate-900 transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none placeholder-slate-400" />
                                                <button disabled={replyLoading || !replyText.trim()} onClick={() => handleReply(activeTicket._id)} className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-0.5">
                                                    Reply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {currentPlan === 'agency' && (
                        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-slate-900">
                                <CrownIcon className="size-20" />
                            </div>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 relative z-10">Your Account Manager</h2>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="size-14 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border-2 border-slate-200 shadow-sm overflow-hidden">
                                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f8fafc" alt="Manager" className="w-full h-full object-cover opacity-90" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-900">Alex Carter</p>
                                    <p className="text-xs font-medium text-slate-600">VIP Success Manager</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                                    <MailIcon className="size-4 text-slate-600" />
                                    <span>vip@socialscheduler.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                                    <PhoneIcon className="size-4 text-slate-600" />
                                    <span>+1 (800) 123-4567</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col max-h-[600px]">
                        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-5">Your Tickets</h2>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {fetching ? (
                                <div className="text-sm font-medium text-slate-500 py-8 text-center animate-pulse">Loading tickets...</div>
                            ) : tickets.length === 0 ? (
                                <div className="text-sm flex flex-col items-center justify-center py-10 text-center">
                                    <div className="size-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                                        <CheckCircle2Icon className="size-6 text-slate-500" />
                                    </div>
                                    <span className="font-bold text-slate-700">No tickets yet!</span>
                                    <span className="text-xs font-medium text-slate-500 mt-1">You're all good.</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tickets.map(ticket => (
                                        <div 
                                            key={ticket._id} 
                                            onClick={() => setExpandedTicketId(ticket._id === expandedTicketId ? null : ticket._id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${expandedTicketId === ticket._id ? 'border-slate-900 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100 hover:-translate-y-0.5'}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700 border-amber-200' : ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className={`text-sm font-bold line-clamp-1 mb-1 transition-colors ${expandedTicketId === ticket._id ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>{ticket.subject}</h3>
                                            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{ticket.message}</p>
                                            
                                            {(ticket.replies?.length || 0) > 0 && (
                                                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 border border-slate-300 w-fit px-2 py-1 rounded-md">
                                                    <MessageSquareIcon className="size-3" />
                                                    {ticket.replies!.length} repl{ticket.replies!.length === 1 ? 'y' : 'ies'}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;

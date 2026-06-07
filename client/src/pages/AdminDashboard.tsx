import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Settings2Icon, CheckCircle2Icon, Loader2Icon, MessageSquareIcon, SendIcon } from "lucide-react";
import { Navigate } from "react-router-dom";

interface Reply {
    sender: "user" | "admin";
    message: string;
    createdAt: string;
}

interface AdminTicket {
    _id: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    createdAt: string;
    replies?: Reply[];
    user: {
        _id: string;
        name: string;
        email: string;
        planType: string;
    };
}

const AdminDashboard = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<AdminTicket[]>([]);
    const [fetching, setFetching] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        if (user?.role !== "admin") {
            setFetching(false);
            return;
        }

        const fetchTickets = async () => {
            try {
                const { data } = await api.get("/api/support/admin/tickets");
                setTickets(data);
            } catch (error) {
                console.error("Failed to fetch admin tickets", error);
                toast.error("Failed to load tickets");
            } finally {
                setFetching(false);
            }
        };
        fetchTickets();
    }, [user]);

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        setUpdatingId(ticketId);
        try {
            await api.put(`/api/support/admin/tickets/${ticketId}`, { status: newStatus });
            setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: newStatus } : t));
            toast.success("Ticket status updated");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update ticket");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReply = async (ticketId: string) => {
        if (!replyText.trim()) return;
        setReplyLoading(true);
        try {
            const { data } = await api.post(`/api/support/${ticketId}/reply`, { message: replyText });
            toast.success("Reply sent and user notified via email!");
            setReplyText("");
            setTickets(tickets.map(t => t._id === ticketId ? data.ticket : t));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reply");
        } finally {
            setReplyLoading(false);
        }
    };

    if (user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="animate-fade-in-up max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings2Icon className="size-6 text-slate-500" />
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">Manage user support tickets and reply directly to users.</p>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Priority & Plan</th>
                                <th className="px-6 py-4 font-semibold">Subject</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {fetching ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <Loader2Icon className="size-6 animate-spin mx-auto mb-2" />
                                        Loading tickets...
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <CheckCircle2Icon className="size-8 text-slate-300 mx-auto mb-2" />
                                        No pending tickets!
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <React.Fragment key={ticket._id}>
                                        <tr 
                                            onClick={() => {
                                                setExpandedTicketId(expandedTicketId === ticket._id ? null : ticket._id);
                                                setReplyText("");
                                            }}
                                            className={`transition-colors cursor-pointer ${expandedTicketId === ticket._id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{ticket.user?.name || "Unknown"}</div>
                                                <div className="text-xs text-slate-500">{ticket.user?.email || "No email"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ticket.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                        {ticket.priority}
                                                    </span>
                                                    <span className="text-xs text-slate-500 capitalize">{ticket.user?.planType || "Starter"} Plan</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 line-clamp-1 max-w-xs" title={ticket.subject}>
                                                    {ticket.subject}
                                                    {(ticket.replies?.length || 0) > 0 && (
                                                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded-md font-semibold">
                                                            <MessageSquareIcon className="size-3" /> {ticket.replies!.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5" title={ticket.message}>{ticket.message}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 
                                                    ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {updatingId === ticket._id ? (
                                                        <Loader2Icon className="size-4 animate-spin text-slate-400" />
                                                    ) : (
                                                        <select
                                                            value={ticket.status}
                                                            onChange={(e) => handleUpdateStatus(ticket._id, e.target.value)}
                                                            className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 focus:outline-none focus:border-red-400"
                                                        >
                                                            <option value="open">Open</option>
                                                            <option value="in-progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedTicketId === ticket._id && (
                                            <tr className="bg-slate-50 border-t-0">
                                                <td colSpan={6} className="p-0">
                                                    <div className="p-6 border-b border-slate-200 shadow-inner">
                                                        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                                            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                                                                <MessageSquareIcon className="size-4 text-blue-500" />
                                                                Ticket Conversation: {ticket.subject}
                                                            </h3>
                                                            
                                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mr-8">
                                                                    <p className="text-xs font-semibold text-slate-500 mb-1">
                                                                        {ticket.user?.name} <span className="font-normal opacity-70">({new Date(ticket.createdAt).toLocaleString()})</span>
                                                                    </p>
                                                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{ticket.message}</p>
                                                                </div>

                                                                {ticket.replies?.map((reply, idx) => (
                                                                    <div key={idx} className={`p-4 rounded-2xl border ${reply.sender === 'user' ? 'bg-slate-50 border-slate-100 mr-8' : 'bg-blue-50 border-blue-100 ml-8'}`}>
                                                                        <p className={`text-xs font-semibold mb-1 ${reply.sender === 'user' ? 'text-slate-500' : 'text-blue-600'}`}>
                                                                            {reply.sender === 'user' ? ticket.user?.name : 'You (Admin)'} <span className="font-normal opacity-70">({new Date(reply.createdAt).toLocaleString()})</span>
                                                                        </p>
                                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="mt-5 pt-5 border-t border-slate-100 flex gap-3">
                                                                <textarea 
                                                                    value={replyText} 
                                                                    onChange={(e) => setReplyText(e.target.value)} 
                                                                    placeholder="Type your reply to the user... (This will send an email)" 
                                                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm min-h-[80px] resize-none focus:bg-white transition-colors"
                                                                />
                                                                <button 
                                                                    disabled={replyLoading || !replyText.trim()} 
                                                                    onClick={() => handleReply(ticket._id)} 
                                                                    className="rounded-xl bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex flex-col items-center justify-center gap-1"
                                                                >
                                                                    {replyLoading ? <Loader2Icon className="size-5 animate-spin" /> : <SendIcon className="size-5" />}
                                                                    <span>Send</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { PLATFORMS } from "../assets/assets";
import {
  CalendarDaysIcon,
  SendIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  UploadIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from "lucide-react";
import api from "../api/axios";
import DateTimePicker from "../components/DateTimePicker";

interface SchedulerPost {
  _id: string;
  title?: string;
  user: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  mediaType?: string;
  mediaUrl?: string;
}

const MAX_CHARS = 280;

const getRelativeTime = (dateStr: string) => {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "Overdue";

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `in ${diffMins}m`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `in ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Tomorrow";

  return `in ${diffDays} days`;
};

const Scheduler = () => {
  const [posts, setPosts] = useState<SchedulerPost[]>([]);
  const [plan, setPlan] = useState<{ scheduledPosts: number; publishedPosts?: number; remainingCredits?: number; canSchedulePost: boolean; limit: number } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"scheduled" | "failed">("scheduled");

  useEffect(() => {
    const saved = localStorage.getItem("schedulerDraft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setSelectedPlatforms(draft.selectedPlatforms || []);
        setScheduledDate(draft.scheduledDate || "");
        setScheduledTime(draft.scheduledTime || "");
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "schedulerDraft",
      JSON.stringify({ title, content, selectedPlatforms, scheduledDate, scheduledTime })
    );
  }, [title, content, selectedPlatforms, scheduledDate, scheduledTime]);

  useEffect(() => {
    if (!mediaFile) {
      setMediaPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [mediaFile]);

  const clearDraft = () => {
    setTitle("");
    setContent("");
    setSelectedPlatforms([]);
    setScheduledDate("");
    setScheduledTime("");
    setMediaFile(null);
    setEditingPostId(null);
    localStorage.removeItem("schedulerDraft");
  };

  const removeSelectedMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await api.get("/api/posts");
      setPosts(data.posts || data);
      setPlan(data.plan || null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    (async () => await fetchPosts())();
    const interval = setInterval(async () => await fetchPosts(), 10000);
    return () => clearInterval(interval);
  }, []);

  const scheduled = posts.filter((p) => p.status === "scheduled");
  const failed = posts.filter((p) => p.status === "failed");

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const loadPostForEdit = (post: SchedulerPost) => {
    setEditingPostId(post._id);
    setTitle(post.title || "");
    setContent(post.content);
    setSelectedPlatforms(post.platforms || []);
    const d = new Date(post.scheduledFor);
    setScheduledDate(d.toISOString().slice(0, 10));
    setScheduledTime(d.toTimeString().slice(0, 5));
    setMediaFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (plan && !plan.canSchedulePost) {
      toast.error(`Starter plan allows only ${plan.limit} scheduled posts at a time.`);
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Add a title and content");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error("Select date and time");
      return;
    }

    if (selectedPlatforms.includes("instagram") && !mediaFile && !editingPostId) {
      toast.error("Instagram requires an image or video");
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("scheduledFor", scheduledFor);
    formData.append("status", "scheduled");
    formData.append("platforms", JSON.stringify(selectedPlatforms));
    if (mediaFile) formData.append("media", mediaFile);

    setLoading(true);
    try {
      if (editingPostId) {
        await api.patch(`/api/posts/${editingPostId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Post updated!");
      } else {
        await api.post("/api/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Post scheduled!");
      }
      clearDraft();
      fetchPosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this scheduled post?")) return;
    try {
      await api.delete(`/api/posts/${postId}`);
      if (editingPostId === postId) clearDraft();
      toast.success("Post deleted");
      fetchPosts();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const charPercent = (content.length / MAX_CHARS) * 100;
  const charColor = charPercent >= 90 ? "text-red-400" : charPercent >= 70 ? "text-amber-400" : "text-slate-500";

  return (
    <div className="relative animate-fade-in-up flex flex-col lg:flex-row gap-6 h-full">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-slate-100 blur-3xl z-[-1]" />
      <div className="pointer-events-none absolute bottom-40 -right-20 h-[300px] w-[300px] rounded-full bg-slate-100 blur-3xl z-[-1]" />

      <div className="w-full lg:w-[460px] shrink-0 relative z-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg text-slate-900 font-extrabold">{editingPostId ? "Edit Post" : "Compose Post"}</h2>
            {plan && !plan.canSchedulePost && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">Starter limit reached</span>
            )}
          </div>
          <form className="space-y-5" onSubmit={handleSchedule}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title / Description</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder-slate-400" placeholder="What is this post about?" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button key={p.id} type="button" onClick={() => togglePlatform(p.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 font-bold ${active ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900"}`}>
                      <p.icon className="size-4" />
                      <span className="text-xs font-medium">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
                <span className={`text-xs font-bold tabular-nums transition-colors ${charColor}`}>{content.length}/{MAX_CHARS}</span>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full min-h-[132px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none resize-none transition-all placeholder-slate-400" placeholder="Write your post here..." maxLength={MAX_CHARS} />
              {/* Progress bar */}
              <div className="h-1 mt-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${charPercent >= 90 ? "bg-red-500" : charPercent >= 70 ? "bg-amber-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}
                  style={{ width: `${Math.min(charPercent, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Media (optional)</label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white border border-slate-200 p-2 text-slate-500 shadow-sm">
                    <UploadIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Choose image or video</p>
                    <p className="text-xs font-medium text-slate-500">
                      {mediaFile?.name || 'PNG, JPG, MP4 and more'}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shadow-sm">
                  Browse
                </span>
                <input ref={mediaInputRef} type="file" accept="image/*,video/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {mediaPreviewUrl && (
                <div className="relative mt-3 animate-scale-in">
                  <button
                    type="button"
                    onClick={removeSelectedMedia}
                    className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white shadow-sm transition hover:bg-black"
                    aria-label="Remove selected media"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                  {mediaFile?.type.startsWith("video/") ? (
                    <video
                      src={mediaPreviewUrl}
                      controls
                      className="h-40 w-full rounded-2xl bg-black object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <img src={mediaPreviewUrl} alt="Media preview" className="h-40 w-full rounded-2xl object-cover border border-slate-200 shadow-sm" />
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule For</label>
              <DateTimePicker 
                date={scheduledDate} 
                time={scheduledTime} 
                onDateChange={setScheduledDate} 
                onTimeChange={setScheduledTime} 
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading || (plan ? !plan.canSchedulePost : false)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-md border border-transparent hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:translate-y-0 disabled:shadow-none">
                <SendIcon className="size-4" />
                {loading ? (editingPostId ? "Updating..." : "Scheduling...") : editingPostId ? "Update Post" : "Schedule Post"}
              </button>
              {editingPostId && <button type="button" onClick={clearDraft} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm transition-all">Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden relative z-10">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-slate-50 rounded-xl p-1 w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "scheduled" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"}`}
          >
            Scheduled
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-slate-900 text-white px-1.5 py-0.5 text-[10px]">{scheduled.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("failed")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "failed" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"}`}
          >
            Failed
            {failed.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 text-[10px]">{failed.length}</span>
            )}
          </button>
        </div>

        {activeTab === "scheduled" && (
          <>
            {scheduled.length === 0 ? (
              <div className="min-h-[420px] rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center px-6">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <CalendarDaysIcon className="size-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No scheduled posts right now</h3>
                <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">Your upcoming scheduled posts will appear here. Create a post on the left and choose a date and time to fill this space.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-auto pr-1 custom-scrollbar">
                {scheduled.map((post, i) => (
                  <div key={post._id} className="group relative rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{post.title || "Scheduled post"}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-600 whitespace-pre-wrap line-clamp-2">{post.content}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">{new Date(post.scheduledFor).toLocaleString()}</span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">{getRelativeTime(post.scheduledFor)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.platforms.map(platform => {
                            const pData = PLATFORMS.find(p => p.id === platform);
                            return (
                              <span key={platform} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                {pData && <pData.icon className="size-3" />}
                                {pData?.name || platform}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => loadPostForEdit(post)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm transition-all">
                          <PencilIcon className="size-3.5" />
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(post._id)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:shadow-sm transition-all">
                          <Trash2Icon className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "failed" && (
          <>
            {failed.length === 0 ? (
              <div className="min-h-[420px] rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center px-6">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
                  <CalendarDaysIcon className="size-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No failed posts</h3>
                <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">All your posts are going through smoothly. Keep it up!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-260px)] overflow-auto pr-1 custom-scrollbar">
                {failed.map((post) => (
                  <div key={post._id} className="group relative rounded-2xl border border-red-200 bg-red-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangleIcon className="size-4 text-red-600" />
                          <h3 className="text-sm font-bold text-red-700">{post.title || "Failed post"}</h3>
                        </div>
                        <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap line-clamp-2">{post.content}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {post.platforms.map(platform => {
                            const pData = PLATFORMS.find(p => p.id === platform);
                            return (
                              <span key={platform} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100/50 px-2 py-1 rounded-md border border-red-200">
                                {pData && <pData.icon className="size-3" />}
                                {pData?.name || platform}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => loadPostForEdit(post)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all">
                          <RefreshCwIcon className="size-3.5" />
                          Retry
                        </button>
                        <button type="button" onClick={() => handleDelete(post._id)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 shadow-sm transition-all">
                          <Trash2Icon className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Scheduler;

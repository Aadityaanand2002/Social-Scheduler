import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PLATFORMS } from "../assets/assets";
import api from "../api/axios";
import { toast } from "react-hot-toast";

import {
  Loader2Icon,
  ArrowRightIcon,
  HistoryIcon,
  Wand2Icon,
  XIcon,
  CalendarIcon,
  ClockIcon,
  TimerIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

const AIComposer = () => {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generateImage, setGenerateImage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generations, setGenerations] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scheduling state
  const [activeScheduler, setActiveScheduler] = useState<any>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const fetchGenerations = async () => {
    try {
      const { data } = await api.get("/api/posts/generations");
      setGenerations(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load recent generations.");
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getFriendlyErrorMessage = (error: any) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message;
    const rawMessage = String(serverMessage || error?.message || "").toLowerCase();

    if (status === 429 || rawMessage.includes("quota") || rawMessage.includes("rate limit") || rawMessage.includes("too many requests")) {
      return serverMessage || "Daily Limit Reached";
    }

    if (status === 400) {
      return serverMessage || "Please enter a valid prompt.";
    }

    return serverMessage || "Failed to generate content. Please try again.";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/posts/generate", {
        prompt,
        tone,
        generateImage,
      });

      setGenerations((prev) => [data, ...prev]);
      setActiveScheduler(data);
      toast.success("Content generated!");
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!activeScheduler) return;

    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error("Select date and time");
      return;
    }

    const scheduledFor = new Date(
      `${scheduledDate}T${scheduledTime}`
    ).toISOString();

    setScheduling(true);

    try {
      const formData = new FormData();
      formData.append("title", "");
      formData.append("content", activeScheduler.content);
      formData.append("platforms", JSON.stringify(selectedPlatforms));
      formData.append("scheduledFor", scheduledFor);
      formData.append("status", "scheduled");

      await api.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("AI Post scheduled!");

      setActiveScheduler(null);
      setSelectedPlatforms([]);
      setScheduledDate("");
      setScheduledTime("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to schedule");
    } finally {
      setScheduling(false);
    }
  };

  const tones = [
    "Professional",
    "Casual",
    "Humorous",
    "Inspirational",
    "Sarcastic",
  ];

  return (
    <div className="relative animate-fade-in-up max-w-4xl mx-auto space-y-12 pb-20">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-[500px] w-[500px] rounded-full bg-slate-100 blur-3xl z-[-1]" />
      <div className="pointer-events-none absolute bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-slate-100 blur-3xl z-[-1]" />
      {/* Input Section */}
      <div className="space-y-6 text-center mt-20">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-white font-bold shadow-md text-sm px-4 py-1.5 rounded-full">
          <Wand2Icon className="size-3.5" />
          AI-Powered Content
        </div>
        <h1 className="text-3xl text-slate-900 tracking-tight font-extrabold">
          What should we create today?
        </h1>

        <div className="relative group mt-12">
          <textarea
            className="w-full px-6 py-6 bg-white border border-slate-200 shadow-sm rounded-3xl text-slate-900 font-medium placeholder-slate-400 outline-none transition-all hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-slate-50 focus:shadow-md resize-none h-40"
            placeholder="Share your idea... (e.g. A post about the launch of our new eco-friendly coffee beans)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="absolute bottom-4 right-2.5 flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => setGenerateImage(!generateImage)}
              className="flex items-center gap-3 bg-slate-50 py-2 px-3 rounded-xl transition-all hover:bg-slate-100 border border-slate-200"
            >
              <span className="text-slate-600 text-xs font-bold">AI Image</span>

              <div
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none border border-transparent ${
                  generateImage ? "bg-slate-900 shadow-sm" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none size-4 transform translate-y-px rounded-full bg-white transition-all shadow-sm ${
                    generateImage ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  Generate
                  <ArrowRightIcon className="size-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 border ${
                tone === t
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* AI Generated Posts */}
      <div className="space-y-6 pt-12 border-t border-slate-200">
        <div className="flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-5" />
            <h2 className="text-xl font-bold text-slate-900">Recent Generations</h2>
          </div>

          <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {generations.length} total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {generations.map((gen, i) => {
            const wordCount = gen.content?.split(/\s+/).filter(Boolean).length || 0;
            const isCopied = copiedId === gen._id;

            return (
              <div
                key={gen._id}
                className="group bg-white rounded-3xl border border-slate-200 p-5 hover:border-slate-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-md transition-all duration-300 relative overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Hover gradient border accent */}
                <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(gen.createdAt).toLocaleString()}
                    </span>

                    <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                      {gen.tone}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-700 line-clamp-[8] leading-relaxed flex-1 whitespace-pre-wrap">
                    {gen.content}
                  </p>
                  {gen.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={gen.mediaUrl}
                        alt="Gen"
                        className="w-full aspect-video object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
                      />
                    </div>
                  )}

                  {/* Word count */}
                  <div className="text-xs font-medium text-slate-500">
                    {wordCount} words · {gen.content?.length || 0} chars
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => copyToClipboard(gen.content, gen._id)}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs py-2.5 px-3 rounded-lg transition-all border border-slate-200 hover:text-slate-900"
                    >
                      {isCopied ? <CheckIcon className="size-3.5 text-emerald-600" /> : <CopyIcon className="size-3.5" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => setActiveScheduler(gen)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 hover:shadow-md text-white border border-transparent text-xs py-2.5 rounded-lg transition-all duration-200 font-bold"
                    >
                      Schedule Post
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {generations.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-3">
              <div className="size-14 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200 shadow-sm">
                <Wand2Icon className="size-6" />
              </div>

              <p className="text-slate-500 font-medium text-sm">
                No content generated yet. Try generating some content using the
                AI.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scheduler Modal */}
      {activeScheduler && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white shadow-sm z-10">
              <h3 className="text-slate-900 font-bold text-lg">
                Schedule Generation
              </h3>

              <button
                onClick={() => setActiveScheduler(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            {/* Modal Body: Content Preview */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prompt</span>
                </div>
                <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.prompt}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generated Content</span>
                  <button
                    onClick={() => copyToClipboard(activeScheduler.content, "modal")}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    {copiedId === "modal" ? <CheckIcon className="size-3.5 text-emerald-600" /> : <CopyIcon className="size-3.5" />}
                    {copiedId === "modal" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-slate-900 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                  {activeScheduler.content}
                </p>

                {activeScheduler.mediaUrl && (
                  <img
                    src={activeScheduler.mediaUrl}
                    alt="preview"
                    className="w-full aspect-video object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer: Scheduling Options */}
            <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] space-y-8 z-10">
              <div className="space-y-6">
                {/* Channel Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Select Channels
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => {
                      const active = selectedPlatforms.includes(p.id);

                      return (
                        <button
                          key={p.id}
                          onClick={() =>
                            setSelectedPlatforms((prev) =>
                              prev.includes(p.id)
                                ? prev.filter((x) => x !== p.id)
                                : [...prev, p.id]
                            )
                          }
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                            active
                              ? "bg-slate-900 border-slate-900 text-white shadow-md"
                              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          <p.icon className="size-4" />
                          <span className="font-bold">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Date & Time
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <CalendarIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none placeholder-slate-400 focus:bg-white"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>

                    <div className="relative">
                      <ClockIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="time"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-sm transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none placeholder-slate-400 focus:bg-white"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSchedule}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg border border-transparent hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-bold"
                >
                  {scheduling ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <TimerIcon className="size-4" />
                  )}
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AIComposer;
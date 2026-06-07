import { useState, useEffect } from "react";
import { PlusIcon } from "lucide-react";
import AccountList from "../components/AccountList";
import type { Account } from "../components/AccountList";
import PlatformPickerModal from "../components/PlatformPickerModal";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Accounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [plan, setPlan] = useState<{ connectedAccounts: number; canConnectAccount: boolean; limits: { accounts: number } } | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  const currentPlan = (user?.planType || "starter").toLowerCase();

  const fetchAccounts = async (
    isSync = false,
    platform?: string | null,
    successMsg?: string
  ) => {
    try {
      if (isSync) {
        const label = platform
          ? platform.charAt(0).toUpperCase() + platform.slice(1)
          : "Social Media";

        toast.loading(`Syncing ${label} account...`, { id: "sync" });
        await api.get("/api/oauth/sync");
        toast.success(successMsg || "Accounts synced!", { id: "sync" });
      }

      const { data } = await api.get("/api/accounts");
      setAccounts(data.accounts || data);
      setPlan(data.plan || null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load accounts"
      );
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedPlatform = params.get("connected");
    const connectedUsername = params.get("username");
    const syncNeeded = params.get("sync") === "true";
    const errorMsg = params.get("error");

    window.history.replaceState({}, document.title, window.location.pathname);

    if (connectedPlatform) {
      const label = connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1);
      const handle = connectedUsername ? ` (@${connectedUsername})` : "";
      fetchAccounts(true, connectedPlatform, `${label}${handle} connected!`);
    } else if (errorMsg) {
      toast.error(`Connection failed: ${decodeURIComponent(errorMsg)}`);
      fetchAccounts();
    } else if (syncNeeded) {
      fetchAccounts(true, null, "Accounts synced!");
    } else {
      fetchAccounts();
    }
  }, []);

  const handleConnect = async (platformId: string) => {
    if (plan && !plan.canConnectAccount) {
      toast.error(`${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan allows only ${plan.limits.accounts} connected accounts.`);
      return;
    }

    setConnecting(platformId);

    try {
      const { data } = await api.get(`/api/oauth/${platformId}/url`);
      window.location.href = data.url;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to connect ${platformId}`
      );
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await api.delete(`/api/accounts/${accountId}`);
      toast.success("Account disconnected");
      await fetchAccounts();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to disconnect account"
      );
    }
  };

  const connectedIds = accounts.map((a) => a.platform);

  return (
    <>
      {showPlatformPicker && (
        <PlatformPickerModal
          connectedIds={connectedIds}
          connecting={connecting}
          onConnect={handleConnect}
          onClose={() => setShowPlatformPicker(false)}
        />
      )}

      <div className="relative animate-fade-in-up space-y-8 max-w-4xl">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm relative z-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Connected Accounts</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {plan ? `${plan.connectedAccounts} of ${plan.limits.accounts > 1000 ? 'Unlimited' : plan.limits.accounts} accounts connected • ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan` : `${accounts.length} accounts connected`}
            </p>
          </div>

          <button
            onClick={() => setShowPlatformPicker(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all w-full sm:w-auto justify-center disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none hover:-translate-y-0.5 border border-transparent"
            disabled={!!plan && !plan.canConnectAccount}
          >
            <PlusIcon className="size-4" />
            {plan && !plan.canConnectAccount ? 'Limit reached' : 'Connect Account'}
          </button>
        </div>

        <div className="relative z-10">
          <AccountList accounts={accounts} onDisconnect={handleDisconnect} />
        </div>
      </div>
    </>
  );
};

export default Accounts;

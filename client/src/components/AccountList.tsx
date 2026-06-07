import {
  AlertCircleIcon,
  PlusIcon,
  UnplugIcon,
} from "lucide-react"
import { PLATFORMS } from "../assets/assets"

interface Account {
  _id: string
  zernioAccountId: string
  createdAt: string
  handle: string
  platform: string
  status: "connected" | "disconnected"
  updatedAt: string
  user: string
  avatarUrl?: string
}

interface AccountListProps {
  accounts: Account[]
  onDisconnect: (accountId: string) => Promise<void>
}

export type { Account }

const PLATFORM_ACCENT: Record<string, string> = {
  instagram: "from-pink-500 via-rose-500 to-orange-400",
  twitter: "from-slate-800 to-slate-900",
  linkedin: "from-sky-500 to-blue-700",
  facebook: "from-blue-500 to-blue-700",
}

const AccountList = ({
  accounts,
  onDisconnect,
}: AccountListProps) => {
  const handleDisconnect = async (accountId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to disconnect this account?"
    )

    if (!confirm) return

    await onDisconnect(accountId)
  }

  if (accounts.length === 0) {
    return (
      <div
        className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200
        flex flex-col items-center justify-center py-20 px-6 animate-fade-in-up"
      >
        <div
          className="size-16 bg-white rounded-2xl flex items-center
          justify-center mb-4 border border-slate-200 shadow-sm"
        >
          <PlusIcon className="size-7 text-slate-400" />
        </div>

        <p className="text-slate-900 text-lg font-bold tracking-tight">
          No accounts connected
        </p>

        <p className="text-sm text-slate-500 font-medium mt-1.5 max-w-xs text-center leading-relaxed">
          Connect your first social platform to start scheduling
          and automating your content.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {accounts.map((account, index) => {
        const meta = PLATFORMS.find(
          (p) => p.id === account.platform
        )

        if (!meta) return null

        const accent = PLATFORM_ACCENT[account.platform] || "from-slate-500 to-slate-600"
        const isConnected = account.status === "connected"

        return (
          <div
            key={account._id}
            className="group relative flex items-center gap-4 rounded-3xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in-up"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {/* Base static border that shows when not hovered */}
            <div className="absolute inset-0 rounded-3xl bg-slate-200 group-hover:opacity-0 transition-opacity duration-300 z-0" />
            
            {/* Rotating Border Layer */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0">
              <div className="absolute -left-[50%] -top-[50%] w-[200%] h-[200%] animate-[spin_3s_linear_infinite]">
                <div className={`w-full h-1/2 bg-gradient-to-r ${accent}`} />
              </div>
            </div>
            
            {/* Inner background cover to expose exactly 2px of the border layers */}
            <div className="absolute inset-[2px] bg-white rounded-[22px] z-0" />

            <div className="relative shrink-0 z-10">
              <div
                className={`size-12 rounded-2xl bg-gradient-to-br ${accent}
                flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
              >
                <meta.icon className="size-5 text-white" />
              </div>
              {/* Status dot */}
              {isConnected && (
                <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
              )}
            </div>

            <div className="flex-1 min-w-0 z-10">
              <div className="text-slate-900 font-bold truncate group-hover:text-slate-700 transition-colors">
                @{account.handle}
              </div>

              <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                <span className="font-semibold">{meta.name}</span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">
                  {new Date(account.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 z-10">
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
                  <AlertCircleIcon className="size-3" />
                  Disconnected
                </span>
              )}

              <button
                onClick={() =>
                  handleDisconnect(account._id)
                }
                title="Disconnect account"
                className="p-2 rounded-xl text-slate-400 bg-slate-50 border border-transparent
                hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
              >
                <UnplugIcon className="size-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AccountList
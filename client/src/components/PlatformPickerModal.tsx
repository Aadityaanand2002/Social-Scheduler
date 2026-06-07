import {
  XIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from "lucide-react"
import { PLATFORMS } from "../assets/assets"

interface PlatformPickerModalProps {
  connectedIds: string[]
  connecting: string | null
  onClose: () => void
  onConnect: (platformId: string) => void
}

const PlatformPickerModal = ({
  connectedIds,
  connecting,
  onClose,
  onConnect,
}: PlatformPickerModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 shadow-sm border-b border-slate-100">
          <h3 className="text-slate-900 font-bold">Choose a Platform</h3>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-2">
          {PLATFORMS.map((p) => {
            const isConnected = connectedIds.includes(p.id)
            const isConnecting = connecting === p.id

            return (
              <button
                key={p.id}
                disabled={isConnected || isConnecting}
                onClick={() => onConnect(p.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border
                text-left transition-all ${
                  isConnected
                    ? "border-emerald-200 bg-emerald-50 cursor-default"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm cursor-pointer"
                } ${isConnecting && "opacity-80"}`}
              >
                {/* Icon */}
                <div className="p-2">
                  <p.icon
                    className={`size-5 ${
                      isConnected ? "text-emerald-600" : "text-slate-500"
                    }`}
                  />
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-bold ${
                      isConnected ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    {p.name}
                  </div>

                  <div className="text-xs text-slate-500 font-medium truncate">
                    {isConnected
                      ? "Already connected"
                      : p.description}
                  </div>
                </div>

                {/* Status */}
                {isConnected && (
                  <CheckCircleIcon className="size-4 text-emerald-600 shrink-0" />
                )}

                {isConnecting && (
                  <div className="size-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                )}

                {!isConnected && !isConnecting && (
                  <ExternalLinkIcon className="size-3.5 text-slate-500 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PlatformPickerModal
import { useState, useEffect } from "react"
import { PlusIcon } from "lucide-react"
import AccountList from "../components/AccountList"
import PlatformPickerModal from "../components/PlatformPickerModal"
import { dummyAccountsData, PLATFORMS } from "../assets/assets"

const Accounts = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showPlatformPicker, setShowPlatformPicker] = useState(false)

  const fetchAccounts = async (
    isSync = false,
    platform?: string | null,
    successMsg?: string
  ) => {
    setAccounts(dummyAccountsData)
    console.log(isSync, platform, successMsg)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId)

    setTimeout(() => {
      setConnecting(null)

      const account = dummyAccountsData.find(
        (a) => a.platform === platformId
      )

      if (account) {
        setAccounts((prev) => [...prev, account])
      }

      setShowPlatformPicker(false)
    }, 1000)
  }

  const handleDisconnect = async (accountId: string) => {
    setAccounts(accounts.filter((a) => a._id !== accountId))
  }

  const connectedIds = accounts.map((a) => a.platform)

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
        <div>
          <h2 className="text-xl text-slate-900">
            Connected Accounts
          </h2>

          <p className="text-slate-500 text-sm mt-0.5">
            {accounts.length} of {PLATFORMS.length} platforms connected
          </p>
        </div>

        <button
          onClick={() => setShowPlatformPicker(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all w-full sm:w-auto justify-center"
        >
          <PlusIcon className="size-4" />
          Connect Account
        </button>
      </div>

      {showPlatformPicker && (
        <PlatformPickerModal
          connectedIds={connectedIds}
          connecting={connecting}
          onConnect={handleConnect}
          onClose={() => setShowPlatformPicker(false)}
        />
      )}

      <AccountList
        accounts={accounts}
        onDisconnect={handleDisconnect}
      />
    </div>
  )
}

export default Accounts
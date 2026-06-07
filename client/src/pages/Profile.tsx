import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EyeIcon, EyeOffIcon, CrownIcon, SparklesIcon, ZapIcon, CheckIcon, XIcon, Loader2Icon, ArrowRightIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const PLAN_CONFIG: Record<string, { icon: typeof CrownIcon; badge: string; badgeText: string; features: string[] }> = {
  starter: {
    icon: ZapIcon,
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeText: 'Free Plan',
    features: ['2 social accounts', '10 scheduled posts', 'Basic AI generation'],
  },
  pro: {
    icon: SparklesIcon,
    badge: 'bg-slate-900 text-white border-slate-900',
    badgeText: 'Pro Plan',
    features: ['10 social accounts', '100 scheduled posts', 'Advanced AI generation'],
  },
  agency: {
    icon: CrownIcon,
    badge: 'bg-slate-800 text-white border-slate-800',
    badgeText: 'Agency',
    features: ['Unlimited accounts', 'Unlimited posts', 'Priority AI generation'],
  },
}

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null)
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPlan = (user?.planType || 'starter').toLowerCase()
  const planConfig = PLAN_CONFIG[currentPlan] || PLAN_CONFIG.starter
  const PlanIcon = planConfig.icon

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)
      formData.append('phone', phone)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      if (removeAvatar) {
        formData.append('removeAvatar', 'true')
      }

      const { data } = await api.put('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(data, data.token)
      setAvatarFile(null)
      setRemoveAvatar(false)
      toast.success('Profile updated successfully', { style: { borderRadius: '8px', background: '#333', color: '#fff' } })
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setRemoveAvatar(false)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setRemoveAvatar(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setSavingPassword(true)

    try {
      const { data } = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      })
      toast.success(data.message, { style: { borderRadius: '8px', background: '#333', color: '#fff' } })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleCheckout = async (planName: string) => {
    setIsCheckingOut(planName)
    try {
      const finalPlanName = isYearly ? `${planName} Yearly` : planName;
      const { data } = await api.post('/api/billing/create-checkout-session', { plan: finalPlanName.toLowerCase() })
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to initiate checkout. Please try again.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong')
    } finally {
      setIsCheckingOut(null)
    }
  }

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'
  const planExpiry = user?.planExpiryDate ? new Date(user.planExpiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null

  const availableUpgradePlans = [
    {
      name: "Pro",
      price: isYearly ? "$19" : "$29",
      period: isYearly ? "/mo, billed yearly" : "/month",
      description: "Everything you need to grow and automate your social presence.",
      features: ["Unlimited accounts", "Unlimited scheduling", "AI content (200 credits/mo)", "Priority support"],
      highlight: true,
      condition: currentPlan === 'starter'
    },
    {
      name: "Agency",
      price: isYearly ? "$59" : "$79",
      period: isYearly ? "/mo, billed yearly" : "/month",
      description: "For teams and agencies managing multiple brands at scale.",
      features: ["Everything in Pro", "5 team members", "Unlimited AI credits", "Custom AI personas", "Dedicated support"],
      highlight: false,
      condition: currentPlan === 'starter' || currentPlan === 'pro'
    }
  ].filter(p => p.condition)

  return (
    <div className="min-h-screen relative overflow-hidden -mt-8 pt-8 px-4 sm:px-6 lg:px-8">
      {/* Premium subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Faint glowing accent in the top left */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-slate-100 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto pb-20 animate-fade-in-up relative z-10">
        {/* Header Section */}
        <div className="mb-10 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Manage your account settings, subscription, and preferences.</p>
        </div>

        <div className="space-y-10">
        
        {/* Section: Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-12 items-start">
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
              Use a permanent address where you can receive mail. This information will be used for billing and communications.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <form onSubmit={handleProfileSave}>
              <div className="p-6 space-y-5">
                
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="size-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0">
                    {avatarPreview || (user?.profilePicture && !removeAvatar) ? (
                      <img src={avatarPreview || user?.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarChange} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors">
                      Upload avatar
                    </button>
                    {(avatarPreview || (user?.profilePicture && !removeAvatar)) && (
                      <button type="button" onClick={handleRemoveAvatar} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-transparent">
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-full">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full name</label>
                    <input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder-slate-400" 
                      required 
                    />
                  </div>

                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
                    <input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      type="email" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder-slate-400" 
                      required 
                    />
                  </div>

                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone number</label>
                    <input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder-slate-400" 
                      placeholder="Optional" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingProfile} 
                  className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="h-px bg-slate-200 w-full" />

        {/* Section: Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-12 items-start">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subscription</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
              Manage your billing details and download your past invoices.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-extrabold text-slate-900">Current Plan</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${planConfig.badge}`}>
                      {planConfig.badgeText}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    {currentPlan !== 'starter' ? `Renews on ${planExpiry || 'N/A'}` : 'You are currently on the free tier.'}
                  </p>
                </div>
                <PlanIcon className="size-8 text-blue-400/50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {planConfig.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckIcon className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              {currentPlan !== 'agency' && (
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Ready to unlock more?</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Upgrade to get higher limits and advanced AI tools.</p>
                  </div>
                  <button 
                    onClick={() => setShowUpgradeModal(true)} 
                    className="text-sm font-bold text-white bg-slate-900 border border-slate-900 hover:bg-slate-800 px-4 py-2 rounded-md transition-colors shadow-sm"
                  >
                    Upgrade
                  </button>
                </div>
              )}
            </div>
            {currentPlan !== 'starter' && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Member since {memberSince}</span>
                <button className="text-sm font-bold text-slate-900 hover:text-slate-700 transition-colors">
                  Manage billing
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-200 w-full" />

        {/* Section: Security */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-12 items-start">
          <div>
            <h2 className="text-base font-bold text-slate-900">Security</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <form onSubmit={handlePasswordChange}>
              <div className="p-6 space-y-5">
                <div className="max-w-md space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current password</label>
                    <div className="relative">
                      <input 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        type={showCurrentPassword ? 'text' : 'password'} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono placeholder-slate-400" 
                        required 
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                        {showCurrentPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New password</label>
                    <div className="relative">
                      <input 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        type={showNewPassword ? 'text' : 'password'} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono placeholder-slate-400" 
                        required 
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                        {showNewPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm password</label>
                    <div className="relative">
                      <input 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono placeholder-slate-400" 
                        required 
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                        {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingPassword || (newPassword !== confirmPassword && confirmPassword !== '')} 
                  className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {savingPassword ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Upgrade Modal (Linear Style) */}
      {showUpgradeModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 bg-white">
              <h2 className="text-xl font-extrabold text-slate-900">Upgrade Subscription</h2>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-500 hover:text-slate-900 transition-colors">
                <XIcon className="size-5" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50">
              {/* Billing Toggle */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
                  <button 
                    onClick={() => setIsYearly(false)} 
                    className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 ${!isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setIsYearly(true)} 
                    className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-300 flex items-center gap-2 ${isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Yearly <span className="bg-slate-900 text-white border border-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Save 20%</span>
                  </button>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${availableUpgradePlans.length === 2 ? 'md:grid-cols-2' : 'max-w-lg mx-auto'} gap-6`}>
                {availableUpgradePlans.map((plan) => (
                  <div key={plan.name} className="group rounded-2xl border border-slate-200 shadow-sm flex flex-col bg-white relative transition-all duration-300 hover:border-slate-900 hover:shadow-xl hover:ring-1 hover:ring-slate-900 hover:-translate-y-1">
                    
                    <div className="p-8 border-b border-slate-100">
                      {plan.highlight && <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white border border-slate-900 text-[10px] font-bold uppercase tracking-wider mb-4"><SparklesIcon className="size-3" /> Recommended</div>}
                      <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-sm font-medium text-slate-500 h-10">{plan.description}</p>
                      
                      <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-slate-900">{plan.price}</span>
                        <span className="text-sm font-medium text-slate-500">{plan.period}</span>
                      </div>
                      
                      <button
                        onClick={() => handleCheckout(plan.name)}
                        disabled={isCheckingOut !== null}
                        className={`mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors ${
                          plan.highlight 
                            ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg" 
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                        } ${isCheckingOut !== null ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isCheckingOut === plan.name ? (
                          <><Loader2Icon className="size-4 animate-spin" /> Processing</>
                        ) : (
                          <>Upgrade to {plan.name} <ArrowRightIcon className="size-4" /></>
                        )}
                      </button>
                    </div>

                    <div className="p-8 bg-slate-50 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Included Features</p>
                      <ul className="space-y-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-3">
                            <CheckIcon className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-slate-700">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  )
}

export default Profile

import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  ClockIcon,
  Share2Icon,
  TrendingUpIcon,
  Activity,
  SendIcon,
  BookmarkIcon,
  XIcon,
  HistoryIcon,
  ExternalLinkIcon,
  SparklesIcon,
} from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

type PublishedTarget = {
  platform: string
  platformPostId?: string
  url?: string
}

type PostItem = {
  _id: string
  title?: string
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video'
  platforms: string[]
  scheduledFor: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  createdAt?: string
  updatedAt?: string
  publishedTargets?: PublishedTarget[]
}

type ActivityItem = {
  actionType: string
  _id: string
  createdAt: string
  description: string
  relatedPost?: Partial<PostItem> | string
  platform?: string
}

type PostsPlan = {
  postsThisMonth: number
  generationsThisMonth: number
  remainingCredits: number
  canSchedulePost: boolean
  limit: number
  aiLimit: number
}

type PostsResponse = {
  posts: PostItem[]
  plan?: PostsPlan
}

type AccountsPlan = {
  connectedAccounts: number
  scheduledPosts: number
  canConnectAccount: boolean
  canSchedulePost: boolean
  limits: {
    accounts: number
    scheduledPosts: number
  }
}

type AccountItem = {
  _id: string
  status?: string
}

type AccountsResponse = {
  accounts: AccountItem[]
  plan?: AccountsPlan
}

const ACTION_META: Record<string, { label: string; IconComponent: typeof SendIcon; badgeClass: string }> = {
  POST_PUBLISHED: {
    label: 'Published',
    IconComponent: SendIcon,
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20',
  },
  POST_SCHEDULED: {
    label: 'Scheduled',
    IconComponent: ClockIcon,
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20',
  },
  POST_SAVED: {
    label: 'Saved',
    IconComponent: BookmarkIcon,
    badgeClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  },
}

const formatPlatform = (platform: string) =>
  platform
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const Dashboard = () => {
  const { user } = useAuth()
  const displayName = user?.name?.trim() || 'there'
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    scheduled: 0,
    published: 0,
    connectedAccounts: 0,
    remainingCredits: 0,
    accountLimit: 0,
    postLimit: 0,
    aiLimit: 0,
    postsThisMonth: 0,
    planType: '',
  })
  const currentPlan = (stats.planType || user?.planType || 'starter').toLowerCase()
  const planLabel = currentPlan ? `${currentPlan.charAt(0).toUpperCase()}${currentPlan.slice(1)}` : 'Loading'
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [isPastPostsOpen, setIsPastPostsOpen] = useState(false)
  const [filterDay, setFilterDay] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [filterYear, setFilterYear] = useState('all')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [postsRes, accountsRes, activityRes] = await Promise.all([
          api.get<PostsResponse>('/api/posts'),
          api.get<AccountsResponse>('/api/accounts'),
          api.get('/api/activity'),
        ])

        const freshPlanType: string = (user?.planType || 'starter').toLowerCase()
        const fetchedPosts: PostItem[] = postsRes.data.posts || []
        const postsPlan = postsRes.data.plan
        const accounts = accountsRes.data.accounts || []
        const accountsPlan = accountsRes.data.plan

        const connectedAccounts =
          accountsPlan?.connectedAccounts ??
          accounts.filter((account) => account.status === 'connected').length
        const scheduledPosts = fetchedPosts.filter((p) => p.status === 'scheduled').length
        const publishedPosts = fetchedPosts.filter((p) => p.status === 'published').length
        const remainingCredits = postsPlan?.remainingCredits ?? 0
        const postsThisMonth = postsPlan?.postsThisMonth ?? 0
        const accountLimit = accountsPlan?.limits.accounts ?? 0
        const postLimit = postsPlan?.limit ?? 0
        const aiLimit = postsPlan?.aiLimit ?? 0

        setStats({
          scheduled: scheduledPosts,
          published: publishedPosts,
          connectedAccounts,
          remainingCredits,
          accountLimit,
          postLimit,
          aiLimit,
          postsThisMonth,
          planType: freshPlanType,
        })
        setActivities(activityRes.data || [])
        setPosts(fetchedPosts)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = useMemo(
    () => [
      {
        label: 'Connected Accounts',
        value: stats.accountLimit > 1000 ? `${stats.connectedAccounts} / ∞` : `${stats.connectedAccounts} / ${stats.accountLimit || 0}`,
        helper:
          stats.accountLimit > 1000
            ? 'Unlimited accounts available'
            : stats.connectedAccounts >= (stats.accountLimit || 0) && stats.accountLimit > 0
              ? 'Plan limit reached'
              : `${Math.max(0, (stats.accountLimit || 0) - stats.connectedAccounts)} account slots available`,
        icon: Share2Icon,
      },
      {
        label: 'Scheduled Posts',
        value: `${stats.scheduled}`,
        helper:
          stats.scheduled === 0
            ? 'No posts currently in queue'
            : `${stats.scheduled} post${stats.scheduled === 1 ? '' : 's'} queued for publishing`,
        icon: ClockIcon,
      },
      {
        label: 'AI Generations',
        value: stats.aiLimit > 1000 ? 'Unlimited' : `${stats.remainingCredits}`,
        helper: stats.aiLimit > 1000 ? 'Unlimited AI credits remaining' : `${stats.aiLimit - stats.remainingCredits} credits used this month`,
        icon: SparklesIcon,
      },
    ],
    [stats]
  )

  const usagePercent = stats.postLimit > 0 ? Math.min((stats.postsThisMonth / stats.postLimit) * 100, 100) : 0
  const remainingPosts = Math.max(0, stats.postLimit - stats.postsThisMonth)

  const publishedPostsList = useMemo(
    () => [...posts.filter((post) => post.status === 'published')].sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()),
    [posts]
  )

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(publishedPostsList.map((post) => new Date(post.scheduledFor).getFullYear()))).sort((a, b) => b - a)
    return years
  }, [publishedPostsList])

  const filteredPublishedPosts = useMemo(() => {
    return publishedPostsList.filter((post) => {
      const date = new Date(post.scheduledFor)
      const matchDay = filterDay === 'all' || String(date.getDate()) === filterDay
      const matchMonth = filterMonth === 'all' || String(date.getMonth() + 1) === filterMonth
      const matchYear = filterYear === 'all' || String(date.getFullYear()) === filterYear
      return matchDay && matchMonth && matchYear
    })
  }, [publishedPostsList, filterDay, filterMonth, filterYear])

  if (isLoading) {
    return (
      <div
        className="space-y-6 pb-6 lg:space-y-6 lg:pb-0 animate-pulse"
      >
        <div className="h-40 rounded-3xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
          <div className="h-96 rounded-3xl bg-slate-200" />
          <div className="h-96 rounded-3xl bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-slate-100 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-40 h-[400px] w-[400px] rounded-full bg-slate-100 blur-3xl" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative space-y-6 pb-6 lg:space-y-6 lg:pb-0 z-10"
      >
        {/* Sleek Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
              Welcome back
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl capitalize text-slate-900 pb-1">
              {displayName}
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Your social workspace overview and publishing analytics.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm">
            <div className={`h-2 w-2 rounded-full shadow-sm ${currentPlan === 'agency' ? 'bg-gradient-to-r from-blue-400 to-purple-500' : currentPlan === 'pro' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : 'bg-slate-900'}`} />
            {planLabel} Plan
          </div>
        </motion.div>

        {/* Stat Cards - Bento Box Style */}
        <motion.section variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
              >
                {/* Decorative top gradient line on hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-slate-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 text-slate-600 ring-1 ring-slate-100 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white group-hover:ring-slate-900 group-hover:shadow-md">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-500">{card.label}</p>
                  </div>
                </div>
                <div className="mt-6 relative z-10">
                  <p className="text-4xl font-extrabold tracking-tight text-slate-900">{card.value}</p>
                  <p className="mt-2 text-sm font-medium text-slate-500">{card.helper}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.section>

        {/* Activity & Usage Grid */}
        <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Recent Activity */}
          <div className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                <p className="text-sm font-medium text-slate-500">Timeline of your workspace actions.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPastPostsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-900 transition-all hover:bg-slate-200"
              >
                <HistoryIcon className="h-4 w-4" />
                History
              </button>
            </div>

            <div className="flex-1 p-6 relative">
              {activities.length === 0 ? (
                <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-400">
                    <Activity className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No recent activity</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Connect an account to get started.</p>
                </div>
              ) : (
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {activities.map((item, index) => {
                    const meta = ACTION_META[item.actionType] || {
                      label: item.actionType.replace(/_/g, ' '),
                      IconComponent: Activity,
                      badgeClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
                    }
                    const Icon = meta.IconComponent
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={item._id}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse activity-item is-active group/item"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white bg-slate-50 text-slate-500 shadow-sm shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2 group-hover/item:bg-slate-900 group-hover/item:text-white group-hover/item:scale-110 group-hover/item:border-slate-900 transition-all duration-300 z-10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-1">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm ${meta.badgeClass}`}>
                                {meta.label}
                              </span>
                              <time className="text-xs text-slate-400 font-medium">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </time>
                            </div>
                            <p className="mt-2 text-sm font-bold text-slate-900 leading-snug">{item.description}</p>
                            {typeof item.relatedPost !== 'string' && item.relatedPost?.content && (
                              <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-1">{item.relatedPost.content}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Plan Usage Card */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl relative backdrop-blur-sm">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
              <div className="rounded-xl bg-slate-800 p-2 text-white">
                <TrendingUpIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Monthly Usage</h2>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-400">
                {currentPlan === 'starter'
                  ? `Starter plan includes up to ${stats.postLimit} posts per month. Upgrade to remove limits.`
                  : currentPlan === 'pro'
                    ? `Pro plan includes unlimited scheduling and ${stats.aiLimit} AI credits.`
                    : `Agency plan includes unlimited scheduling and AI capabilities.`}
              </p>

              <div className="mt-8 rounded-2xl bg-slate-800/50 p-5 border border-slate-700">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Post Slots Left</p>
                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">{stats.postLimit > 1000 ? 'Unlimited' : remainingPosts}</p>
                  </div>
                  <div className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    {stats.postsThisMonth} scheduled
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: stats.postLimit > 1000 ? '0%' : `${usagePercent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>Current usage</span>
                  <span>{stats.postsThisMonth} / {stats.postLimit > 1000 ? '∞' : stats.postLimit}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {isPastPostsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                  <HistoryIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Post Archive</h2>
                  <p className="text-sm font-medium text-slate-500">History of all your published content</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPastPostsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900">
                  <option value="all">All Days</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={String(day)}>{day}</option>
                  ))}
                </select>
                <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900">
                  <option value="all">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={String(month)}>{new Date(2026, month - 1, 1).toLocaleString(undefined, { month: 'long' })}</option>
                  ))}
                </select>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900">
                  <option value="all">All Years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50">
              {filteredPublishedPosts.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <div className="mb-4 rounded-full bg-white p-4 text-slate-400 shadow-sm border border-slate-200">
                    <HistoryIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No archived posts found</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">Adjust your filters or publish new content.</p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredPublishedPosts.map((post) => (
                    <div key={post._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/20">Published</span>
                        <span className="text-xs font-medium text-slate-500">{new Date(post.scheduledFor).toLocaleDateString()}</span>
                      </div>

                      {post.title && <h3 className="mb-2 text-base font-bold text-slate-900">{post.title}</h3>}
                      <p className="mb-4 flex-1 text-sm font-medium text-slate-600 line-clamp-3">{post.content}</p>

                      <div className="mt-auto flex flex-col gap-4">
                        <div className="flex flex-wrap gap-2">
                          {post.platforms.map((platform) => (
                            <span key={platform} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                              {formatPlatform(platform)}
                            </span>
                          ))}
                        </div>

                        {post.publishedTargets && post.publishedTargets.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                            {post.publishedTargets.map((target, index) => (
                              <a
                                key={`${target.platform}-${index}`}
                                href={target.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${target.url ? 'border-slate-200 bg-white text-slate-900 hover:border-slate-900 hover:shadow-sm' : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'}`}
                              >
                                <span>{formatPlatform(target.platform)}</span>
                                <ExternalLinkIcon className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

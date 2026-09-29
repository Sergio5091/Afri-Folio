// ============================================================
// Types partagés entre frontend et backend
// ============================================================

export type Plan = "free" | "premium";

export interface User {
  id: number;
  username: string;
  email: string;
  plan: Plan;
  referralCode: string;
  isAdmin: boolean;
  status?: "active" | "suspended";
  createdAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  profileType: string | null;
  profession: string | null;
  professionCustom: string | null;
  template: string | null;
  fullName: string | null;
  title: string | null;
  tagline: string | null;
  bio: string | null;
  photoUrl: string | null;
  logoUrl: string | null;
  skills: string[];
  services: string | null;
  whatsapp: string | null;
  emailContact: string | null;
  linkedin: string | null;
  twitter: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  github: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  styleTheme: string;
  primaryColor: string | null;
  fontFamily: string | null;
  yearsExperience: number | null;
  completedProjects: number | null;
  satisfiedClients: number | null;
  availableForWork: boolean;
  isFeatured?: boolean;
  listedInDirectory?: boolean;
  updatedAt?: string;
}

export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  projectUrl: string | null;
  displayOrder?: number;
  createdAt: string;
}

/** Section de contenu du portfolio (galerie, tarifs, horaires...) */
export interface Block {
  id?: number;
  type: string;
  position?: number;
  visible: boolean;
  data: Record<string, any>;
}

export interface PublicPortfolio {
  user: {
    id: number;
    username: string;
    plan: Plan;
    createdAt: string;
  };
  profile: Profile;
  blocks: Block[];
  projects: Project[];
}

export interface PortfolioCard {
  username: string;
  plan: Plan;
  fullName: string | null;
  title: string | null;
  profession: string | null;
  professionCustom: string | null;
  profileType: string | null;
  template: string | null;
  photoUrl: string | null;
  coverUrl: string | null;
  city: string | null;
  country: string | null;
  primaryColor: string | null;
  isFeatured: boolean;
}

export interface DirectoryResponse {
  items: PortfolioCard[];
  total: number;
  page: number;
  limit: number;
  cities: string[];
}

export interface DashboardSummary {
  username: string;
  plan: Plan;
  portfolioUrl: string;
  totalViews: number;
  viewsThisMonth: number;
  viewsLast7Days: number;
  viewsPrevious7Days: number;
  contactClicksThisMonth: number;
  totalLeads: number;
  unreadLeads: number;
  activeReferrals: number;
  walletBalance: number;
  profileComplete: boolean;
  subscriptionExpiresAt: string | null;
}

export interface AnalyticsStats {
  days: number;
  totalViews: number;
  viewsThisMonth: number;
  viewsInRange: number;
  viewsByDay: { date: string; count: number; contacts: number }[];
  viewsByCountry: { country: string; count: number }[];
  viewsBySource: { source: string; count: number }[];
  events: { whatsapp: number; call: number; email: number; share: number; lead: number; vcard: number };
}

export interface Lead {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface Commission {
  id: number;
  refereeId: number;
  refereeUsername: string;
  amount: number;
  month: string;
  status: "pending" | "paid";
  createdAt: string;
}

export interface Withdrawal {
  id: number;
  userId: number;
  username?: string;
  amount: number;
  method: "mobile_money" | "subscription_credit";
  phoneNumber: string | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt: string | null;
}

export interface Plans {
  currency: string;
  monthly: number;
  yearly: number;
  commissionRate: number;
  freeLimits: { photos: number };
}

export interface SubscriptionRecord {
  id: number;
  operator: string;
  amount: number;
  status: "pending" | "success" | "failed";
  period: "monthly" | "yearly";
  grantedByAdmin: boolean;
  expiresAt: string | null;
  createdAt: string;
}

// ── Admin ──────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalCommissionsPaid: number;
  pendingWithdrawals: number;
  newUsers7d: number;
  newUsersPrev7d: number;
  publishedPortfolios: number;
  totalLeads: number;
  totalContactClicks: number;
  suspendedUsers: number;
  revenueThisMonth: number;
  topProfessions: { profession: string; count: number }[];
  registrationsByDay: { date: string; count: number }[];
  revenueByMonth: { month: string; revenue: number; subscriptions: number }[];
  usersByMonth: { month: string; total: number; premium: number }[];
  viewsByDay: { date: string; count: number }[];
  topPortfolios: { username: string; views: number }[];
}

export interface AdminUserRow extends User {
  status: "active" | "suspended";
  lastLoginAt: string | null;
  fullName: string | null;
  profession: string | null;
  professionCustom: string | null;
  profileType: string | null;
  city: string | null;
  photoUrl: string | null;
  isFeatured: boolean;
  totalViews: number;
  totalLeads: number;
}

export interface AdminUsersResponse {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUsersQuery {
  search?: string;
  plan?: string;
  status?: string;
  profession?: string;
  page?: number;
  limit?: number;
}

export interface AdminSubscription extends SubscriptionRecord {
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  externalRef: string | null;
}

export interface AdminUserDetail {
  user: {
    id: number;
    username: string;
    email: string;
    plan: Plan;
    isAdmin: boolean;
    status: "active" | "suspended";
    referralCode: string;
    createdAt: string;
    lastLoginAt: string | null;
    referrer: { id: number; username: string } | null;
  };
  profile: Profile | null;
  stats: {
    totalViews: number;
    views30d: number;
    contactClicks: number;
    totalLeads: number;
    blocks: number;
    referrals: number;
  };
  subscriptions: (SubscriptionRecord & { phoneNumber: string })[];
}

export interface AdminProfessions {
  byProfession: { profession: string; count: number }[];
  byFamily: { family: string; count: number }[];
  custom: { label: string; count: number; lastSeen: string }[];
}

// ── Auth ───────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  referralCode?: string;
  // Parcours guidé : le portfolio est créé en même temps que le compte
  fullName?: string;
  profession?: string;
  professionCustom?: string;
  profileType?: string;
  template?: string;
  title?: string;
  tagline?: string;
  bio?: string;
  city?: string;
  country?: string;
  whatsapp?: string;
  yearsExperience?: number;
  primaryColor?: string;
  blocks?: Block[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UsernameCheck {
  username: string;
  available: boolean;
  reason: string | null;
  suggestion: string;
}

// ── Paiement ───────────────────────────────────────────────
export interface InitiatePaymentRequest {
  operator: "mtn" | "moov" | "wave";
  phoneNumber: string;
  period?: "monthly" | "yearly";
}

export interface InitiatePaymentResponse {
  subscriptionId: number;
  message: string;
  paymentUrl: string | null;
}

export interface WithdrawalRequest {
  amount: number;
  method: "mobile_money" | "subscription_credit";
  phoneNumber?: string;
}

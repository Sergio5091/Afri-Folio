// ============================================================
// Types partagés entre frontend et backend
// ============================================================

export interface User {
  id: number;
  username: string;
  email: string;
  plan: "free" | "premium";
  referralCode: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  profileType: string | null;
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
  github: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  styleTheme: "minimalist" | "modern" | "classic" | "bold" | "elegant" | "sidebar" | "card" | "timeline" | "magazine" | "neon";
  primaryColor: string | null;
  fontFamily: string | null;
  yearsExperience: number | null;
  completedProjects: number | null;
  satisfiedClients: number | null;
  availableForWork: boolean;
  updatedAt?: string;
}

export interface Project {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  projectUrl: string | null;
  createdAt: string;
}

export interface PublicPortfolio {
  user: {
    id: number;
    email: string;
    username: string;
    plan: "free" | "premium";
    referralCode: string;
    createdAt: string;
  };
  profile: Profile;
  projects: Project[];
}

export interface DashboardSummary {
  plan: "free" | "premium";
  portfolioUrl: string;
  totalViews: number;
  viewsThisMonth: number;
  activeReferrals: number;
  walletBalance: number;
  profileComplete: boolean;
  subscriptionExpiresAt: string | null;
}

export interface AnalyticsStats {
  totalViews: number;
  viewsThisMonth: number;
  viewsByDay: { date: string; count: number }[];
  viewsByCountry: { country: string; count: number }[];
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

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  totalCommissionsPaid: number;
  pendingWithdrawals: number;
  registrationsByDay: { date: string; count: number }[];
  revenueByMonth: { month: string; revenue: number; subscriptions: number }[];
  usersByMonth: { month: string; total: number; premium: number }[];
  viewsByDay: { date: string; count: number }[];
  topPortfolios: { username: string; views: number }[];
}

export interface AdminUsersResponse {
  users: (User & { totalViews: number })[];
  total: number;
  page: number;
  limit: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Payment
export interface InitiatePaymentRequest {
  operator: "mtn" | "moov" | "wave";
  phoneNumber: string;
}

export interface InitiatePaymentResponse {
  subscriptionId: number;
  message: string;
  paymentUrl: string | null;
}

// Withdrawal
export interface WithdrawalRequest {
  amount: number;
  method: "mobile_money" | "subscription_credit";
  phoneNumber?: string;
}

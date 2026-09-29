import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UsernameCheck,
  Profile,
  Block,
  PublicPortfolio,
  DirectoryResponse,
  PortfolioCard,
  DashboardSummary,
  AnalyticsStats,
  Lead,
  ReferralStats,
  Commission,
  Withdrawal,
  Plans,
  SubscriptionRecord,
  AdminStats,
  AdminUsersResponse,
  AdminUsersQuery,
  AdminUserDetail,
  AdminSubscription,
  AdminProfessions,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  WithdrawalRequest,
  Project,
} from "./types";

type QueryOpts<T> = { query?: Partial<UseQueryOptions<T>> };

const qs = (params: Record<string, unknown>) => {
  const s = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  return s ? `?${s}` : "";
};

// ============================================================
// Query Keys
// ============================================================
export const getGetProfileQueryKey = () => ["profile"] as const;
export const getGetBlocksQueryKey = () => ["blocks"] as const;
export const getGetMeQueryKey = () => ["me"] as const;
export const getGetDashboardSummaryQueryKey = () => ["dashboard", "summary"] as const;
export const getGetAnalyticsStatsQueryKey = (days?: number) => ["analytics", days ?? 30] as const;
export const getGetLeadsQueryKey = () => ["leads"] as const;
export const getGetReferralStatsQueryKey = () => ["referral", "stats"] as const;
export const getGetCommissionsQueryKey = () => ["referral", "commissions"] as const;
export const getGetPublicPortfolioQueryKey = (username: string) => ["portfolio", username] as const;
export const getGetDirectoryQueryKey = (params: Record<string, unknown>) => ["directory", params] as const;
export const getGetProjectsQueryKey = () => ["projects"] as const;
export const getGetPlansQueryKey = () => ["plans"] as const;
export const getGetSubscriptionHistoryQueryKey = () => ["subscription", "history"] as const;
export const getGetAdminStatsQueryKey = (days?: number) => ["admin", "stats", days ?? 30] as const;
export const getGetAdminUsersQueryKey = (params?: AdminUsersQuery) => ["admin", "users", params ?? {}] as const;
export const getGetAdminUserQueryKey = (id: number) => ["admin", "user", id] as const;
export const getGetAdminWithdrawalsQueryKey = () => ["admin", "withdrawals"] as const;
export const getGetAdminSubscriptionsQueryKey = (status?: string) => ["admin", "subscriptions", status ?? ""] as const;
export const getGetAdminProfessionsQueryKey = () => ["admin", "professions"] as const;

// ============================================================
// AUTH & COMPTE
// ============================================================
export function useLogin(options?: UseMutationOptions<AuthResponse, Error, { data: LoginRequest }>) {
  return useMutation({
    mutationFn: ({ data }: { data: LoginRequest }) => apiClient.post<AuthResponse>("/api/auth/login", data),
    ...options,
  });
}

export function useRegister(options?: UseMutationOptions<AuthResponse, Error, { data: RegisterRequest }>) {
  return useMutation({
    mutationFn: ({ data }: { data: RegisterRequest }) => apiClient.post<AuthResponse>("/api/auth/register", data),
    ...options,
  });
}

export function useGetMe(options?: QueryOpts<User>) {
  return useQuery<User>({
    queryKey: getGetMeQueryKey(),
    queryFn: () => apiClient.get<User>("/api/auth/me"),
    ...options?.query,
  });
}

export function checkUsername(params: { u?: string; name?: string }) {
  return apiClient.get<UsernameCheck>(`/api/auth/username-available${qs(params)}`);
}

export function useChangePassword(
  options?: UseMutationOptions<{ message: string }, Error, { currentPassword: string; newPassword: string }>
) {
  return useMutation({
    mutationFn: (data) => apiClient.put<{ message: string }>("/api/account/password", data),
    ...options,
  });
}

export function useChangeUsername(options?: UseMutationOptions<User, Error, { username: string }>) {
  return useMutation({
    mutationFn: (data) => apiClient.put<User>("/api/account/username", data),
    ...options,
  });
}

export function useChangeEmail(options?: UseMutationOptions<User, Error, { email: string; password: string }>) {
  return useMutation({
    mutationFn: (data) => apiClient.put<User>("/api/account/email", data),
    ...options,
  });
}

export function useDeleteAccount(options?: UseMutationOptions<{ message: string }, Error, { password: string }>) {
  return useMutation({
    mutationFn: (data) => apiClient.delete<{ message: string }>("/api/account", data),
    ...options,
  });
}

// ============================================================
// PROFIL & SECTIONS
// ============================================================
export function useGetProfile(options?: QueryOpts<Profile>) {
  return useQuery<Profile>({
    queryKey: getGetProfileQueryKey(),
    queryFn: () => apiClient.get<Profile>("/api/profile"),
    ...options?.query,
  });
}

export function useUpdateProfile(options?: UseMutationOptions<Profile, Error, { data: Partial<Profile> }>) {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Profile> }) => apiClient.put<Profile>("/api/profile", data),
    ...options,
  });
}

export function useGetBlocks(options?: QueryOpts<Block[]>) {
  return useQuery<Block[]>({
    queryKey: getGetBlocksQueryKey(),
    queryFn: () => apiClient.get<Block[]>("/api/blocks"),
    ...options?.query,
  });
}

export function useSaveBlocks(options?: UseMutationOptions<Block[], Error, { blocks: Block[] }>) {
  return useMutation({
    mutationFn: ({ blocks }: { blocks: Block[] }) => apiClient.put<Block[]>("/api/blocks", { blocks }),
    ...options,
  });
}

export function uploadImage(file: Blob, kind: "image" | "avatar" | "logo" = "image") {
  return apiClient.upload<{ url: string }>(`/api/upload/${kind}`, kind, file, `${kind}.jpg`);
}

// ============================================================
// PORTFOLIO PUBLIC & ANNUAIRE
// ============================================================
export function useGetPublicPortfolio(username: string, options?: QueryOpts<PublicPortfolio>) {
  return useQuery<PublicPortfolio>({
    queryKey: getGetPublicPortfolioQueryKey(username),
    queryFn: () => apiClient.get<PublicPortfolio>(`/api/portfolio/${encodeURIComponent(username)}`),
    enabled: !!username,
    ...options?.query,
  });
}

export function useRecordView(
  options?: UseMutationOptions<void, Error, { data: { portfolioUsername: string; source?: string } }>
) {
  return useMutation({
    mutationFn: ({ data }) => apiClient.post<void>("/api/portfolio/view", data),
    ...options,
  });
}

/** Suivi d'un clic (WhatsApp, appel...). Ne bloque jamais l'action du visiteur. */
export function trackPortfolioEvent(portfolioUsername: string, type: string) {
  apiClient.post("/api/portfolio/event", { portfolioUsername, type }).catch(() => {});
}

export function useSendLead(
  username: string,
  options?: UseMutationOptions<{ ok: boolean }, Error, { name: string; phone?: string; email?: string; message: string; website?: string }>
) {
  return useMutation({
    mutationFn: (data) => apiClient.post<{ ok: boolean }>(`/api/portfolio/${encodeURIComponent(username)}/lead`, data),
    ...options,
  });
}

export function useGetDirectory(
  params: { q?: string; profession?: string; family?: string; city?: string; page?: number },
  options?: QueryOpts<DirectoryResponse>
) {
  return useQuery<DirectoryResponse>({
    queryKey: getGetDirectoryQueryKey(params),
    queryFn: () => apiClient.get<DirectoryResponse>(`/api/portfolio/directory${qs(params)}`),
    ...options?.query,
  });
}

export function useGetFeatured(options?: QueryOpts<PortfolioCard[]>) {
  return useQuery<PortfolioCard[]>({
    queryKey: ["featured"],
    queryFn: () => apiClient.get<PortfolioCard[]>("/api/portfolio/featured"),
    ...options?.query,
  });
}

// ============================================================
// DASHBOARD, STATS & MESSAGES
// ============================================================
export function useGetDashboardSummary(options?: QueryOpts<DashboardSummary>) {
  return useQuery<DashboardSummary>({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => apiClient.get<DashboardSummary>("/api/dashboard/summary"),
    ...options?.query,
  });
}

export function useGetAnalyticsStats(days = 30, options?: QueryOpts<AnalyticsStats>) {
  return useQuery<AnalyticsStats>({
    queryKey: getGetAnalyticsStatsQueryKey(days),
    queryFn: () => apiClient.get<AnalyticsStats>(`/api/analytics?days=${days}`),
    ...options?.query,
  });
}

export function useGetLeads(options?: QueryOpts<Lead[]>) {
  return useQuery<Lead[]>({
    queryKey: getGetLeadsQueryKey(),
    queryFn: () => apiClient.get<Lead[]>("/api/leads"),
    ...options?.query,
  });
}

export function useUpdateLead(options?: UseMutationOptions<{ ok: boolean }, Error, { id: number; isRead: boolean }>) {
  return useMutation({
    mutationFn: ({ id, isRead }) => apiClient.put<{ ok: boolean }>(`/api/leads/${id}`, { isRead }),
    ...options,
  });
}

export function useMarkAllLeadsRead(options?: UseMutationOptions<{ ok: boolean }, Error, void>) {
  return useMutation({
    mutationFn: () => apiClient.put<{ ok: boolean }>("/api/leads/read-all"),
    ...options,
  });
}

export function useDeleteLead(options?: UseMutationOptions<{ ok: boolean }, Error, { id: number }>) {
  return useMutation({
    mutationFn: ({ id }) => apiClient.delete<{ ok: boolean }>(`/api/leads/${id}`),
    ...options,
  });
}

// ============================================================
// PARRAINAGE
// ============================================================
export function useGetReferralStats(options?: QueryOpts<ReferralStats>) {
  return useQuery<ReferralStats>({
    queryKey: getGetReferralStatsQueryKey(),
    queryFn: () => apiClient.get<ReferralStats>("/api/referral/stats"),
    ...options?.query,
  });
}

export function useGetCommissions(options?: QueryOpts<Commission[]>) {
  return useQuery<Commission[]>({
    queryKey: getGetCommissionsQueryKey(),
    queryFn: () => apiClient.get<Commission[]>("/api/referral/commissions"),
    ...options?.query,
  });
}

export function useRequestWithdrawal(
  options?: UseMutationOptions<{ id: number; message: string }, Error, { data: WithdrawalRequest }>
) {
  return useMutation({
    mutationFn: ({ data }: { data: WithdrawalRequest }) =>
      apiClient.post<{ id: number; message: string }>("/api/referral/withdraw", data),
    ...options,
  });
}

// ============================================================
// ABONNEMENT / PAIEMENT
// ============================================================
export function useGetPlans(options?: QueryOpts<Plans>) {
  return useQuery<Plans>({
    queryKey: getGetPlansQueryKey(),
    queryFn: () => apiClient.get<Plans>("/api/subscription/plans"),
    staleTime: 10 * 60_000,
    ...options?.query,
  });
}

export function useGetSubscriptionHistory(options?: QueryOpts<SubscriptionRecord[]>) {
  return useQuery<SubscriptionRecord[]>({
    queryKey: getGetSubscriptionHistoryQueryKey(),
    queryFn: () => apiClient.get<SubscriptionRecord[]>("/api/subscription/history"),
    ...options?.query,
  });
}

export function useInitiatePayment(
  options?: UseMutationOptions<InitiatePaymentResponse, Error, { data: InitiatePaymentRequest }>
) {
  return useMutation({
    mutationFn: ({ data }: { data: InitiatePaymentRequest }) =>
      apiClient.post<InitiatePaymentResponse>("/api/subscription/initiate", data),
    ...options,
  });
}

export function useSimulatePayment(
  options?: UseMutationOptions<{ message: string }, Error, { period: "monthly" | "yearly" }>
) {
  return useMutation({
    mutationFn: (data) => apiClient.post<{ message: string }>("/api/subscription/simulate-payment", data),
    ...options,
  });
}

// ============================================================
// PROJETS (ancienne section, conservée pour les comptes existants)
// ============================================================
export function useGetProjects(options?: QueryOpts<Project[]>) {
  return useQuery<Project[]>({
    queryKey: getGetProjectsQueryKey(),
    queryFn: () => apiClient.get<Project[]>("/api/projects"),
    ...options?.query,
  });
}

export function useCreateProject(options?: UseMutationOptions<Project, Error, { data: Partial<Project> }>) {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Project> }) => apiClient.post<Project>("/api/projects", data),
    ...options,
  });
}

export function useUpdateProject(options?: UseMutationOptions<Project, Error, { id: number; data: Partial<Project> }>) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) => apiClient.put<Project>(`/api/projects/${id}`, data),
    ...options,
  });
}

export function useDeleteProject(options?: UseMutationOptions<{ message: string }, Error, { id: number }>) {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => apiClient.delete<{ message: string }>(`/api/projects/${id}`),
    ...options,
  });
}

// ============================================================
// ADMIN
// ============================================================
export function useGetAdminStats(days?: number, options?: QueryOpts<AdminStats>) {
  return useQuery<AdminStats>({
    queryKey: getGetAdminStatsQueryKey(days),
    queryFn: () => apiClient.get<AdminStats>(`/api/admin/stats${qs({ days })}`),
    ...options?.query,
  });
}

export function useGetAdminUsers(params?: AdminUsersQuery, options?: QueryOpts<AdminUsersResponse>) {
  return useQuery<AdminUsersResponse>({
    queryKey: getGetAdminUsersQueryKey(params),
    queryFn: () => apiClient.get<AdminUsersResponse>(`/api/admin/users${qs({ ...(params ?? {}) })}`),
    ...options?.query,
  });
}

export function useGetAdminUser(id: number | null, options?: QueryOpts<AdminUserDetail>) {
  return useQuery<AdminUserDetail>({
    queryKey: getGetAdminUserQueryKey(id ?? 0),
    queryFn: () => apiClient.get<AdminUserDetail>(`/api/admin/users/${id}`),
    enabled: !!id,
    ...options?.query,
  });
}

export function useUpdateAdminUser(
  options?: UseMutationOptions<{ message: string }, Error, { id: number; data: { status?: string; isFeatured?: boolean } }>
) {
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.put<{ message: string }>(`/api/admin/users/${id}`, data),
    ...options,
  });
}

export function useSetUserPremium(options?: UseMutationOptions<{ message: string }, Error, { id: number; months: number }>) {
  return useMutation({
    mutationFn: ({ id, months }) => apiClient.post<{ message: string }>(`/api/admin/users/${id}/premium`, { months }),
    ...options,
  });
}

export function useDeleteAdminUser(options?: UseMutationOptions<{ message: string }, Error, { id: number }>) {
  return useMutation({
    mutationFn: ({ id }) => apiClient.delete<{ message: string }>(`/api/admin/users/${id}`),
    ...options,
  });
}

export function useGetAdminSubscriptions(status?: string, options?: QueryOpts<AdminSubscription[]>) {
  return useQuery<AdminSubscription[]>({
    queryKey: getGetAdminSubscriptionsQueryKey(status),
    queryFn: () => apiClient.get<AdminSubscription[]>(`/api/admin/subscriptions${qs({ status })}`),
    ...options?.query,
  });
}

export function useGetAdminProfessions(options?: QueryOpts<AdminProfessions>) {
  return useQuery<AdminProfessions>({
    queryKey: getGetAdminProfessionsQueryKey(),
    queryFn: () => apiClient.get<AdminProfessions>("/api/admin/professions"),
    ...options?.query,
  });
}

export function useGetAdminWithdrawals(options?: QueryOpts<Withdrawal[]>) {
  return useQuery<Withdrawal[]>({
    queryKey: getGetAdminWithdrawalsQueryKey(),
    queryFn: () => apiClient.get<Withdrawal[]>("/api/admin/withdrawals"),
    ...options?.query,
  });
}

export function useUpdateWithdrawal(
  options?: UseMutationOptions<{ message: string }, Error, { id: number; data: { status: "approved" | "rejected" } }>
) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: "approved" | "rejected" } }) =>
      apiClient.put<{ message: string }>(`/api/admin/withdrawals/${id}`, data),
    ...options,
  });
}

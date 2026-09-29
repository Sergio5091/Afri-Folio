import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "./client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Profile,
  PublicPortfolio,
  DashboardSummary,
  AnalyticsStats,
  ReferralStats,
  Commission,
  Withdrawal,
  AdminStats,
  AdminUsersResponse,
  InitiatePaymentRequest,
  Project,
  InitiatePaymentResponse,
  WithdrawalRequest,
} from "./types";

// ============================================================
// Query Keys
// ============================================================
export const getGetProfileQueryKey = () => ["profile"] as const;
export const getGetDashboardSummaryQueryKey = () => ["dashboard", "summary"] as const;
export const getGetAnalyticsStatsQueryKey = () => ["analytics"] as const;
export const getGetReferralStatsQueryKey = () => ["referral", "stats"] as const;
export const getGetCommissionsQueryKey = () => ["referral", "commissions"] as const;
export const getGetPublicPortfolioQueryKey = (username: string) => ["portfolio", username] as const;
export const getGetProjectsQueryKey = () => ["projects"] as const;
export const getGetAdminStatsQueryKey = (days?: number) => ["admin", "stats", days ?? 30] as const;
export const getGetAdminUsersQueryKey = () => ["admin", "users"] as const;
export const getGetAdminWithdrawalsQueryKey = () => ["admin", "withdrawals"] as const;

// ============================================================
// AUTH
// ============================================================
export function useLogin(options?: UseMutationOptions<AuthResponse, Error, { data: LoginRequest }>) {
  return useMutation({
    mutationFn: ({ data }: { data: LoginRequest }) =>
      apiClient.post<AuthResponse>("/api/auth/login", data),
    ...options,
  });
}

export function useRegister(options?: UseMutationOptions<AuthResponse, Error, { data: RegisterRequest }>) {
  return useMutation({
    mutationFn: ({ data }: { data: RegisterRequest }) =>
      apiClient.post<AuthResponse>("/api/auth/register", data),
    ...options,
  });
}

// ============================================================
// PROFILE
// ============================================================
export function useGetProfile(options?: { query?: UseQueryOptions<Profile> }) {
  return useQuery<Profile>({
    queryKey: getGetProfileQueryKey(),
    queryFn: () => apiClient.get<Profile>("/api/profile"),
    ...options?.query,
  });
}

export function useUpdateProfile(options?: UseMutationOptions<Profile, Error, { data: Partial<Profile> }>) {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Profile> }) =>
      apiClient.put<Profile>("/api/profile", data),
    ...options,
  });
}

// ============================================================
// PUBLIC PORTFOLIO
// ============================================================
export function useGetPublicPortfolio(
  username: string,
  options?: { query?: UseQueryOptions<PublicPortfolio> }
) {
  return useQuery<PublicPortfolio>({
    queryKey: getGetPublicPortfolioQueryKey(username),
    queryFn: () => apiClient.get<PublicPortfolio>(`/api/portfolio/${username}`),
    enabled: !!username,
    ...options?.query,
  });
}

export function useRecordView(options?: UseMutationOptions<void, Error, { data: { portfolioUsername: string } }>) {
  return useMutation({
    mutationFn: ({ data }: { data: { portfolioUsername: string } }) =>
      apiClient.post<void>("/api/portfolio/view", data),
    ...options,
  });
}

// ============================================================
// DASHBOARD
// ============================================================
export function useGetDashboardSummary(options?: { query?: UseQueryOptions<DashboardSummary> }) {
  return useQuery<DashboardSummary>({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => apiClient.get<DashboardSummary>("/api/dashboard/summary"),
    ...options?.query,
  });
}

// ============================================================
// ANALYTICS
// ============================================================
export function useGetAnalyticsStats(options?: { query?: UseQueryOptions<AnalyticsStats> }) {
  return useQuery<AnalyticsStats>({
    queryKey: getGetAnalyticsStatsQueryKey(),
    queryFn: () => apiClient.get<AnalyticsStats>("/api/analytics"),
    ...options?.query,
  });
}

// ============================================================
// REFERRAL
// ============================================================
export function useGetReferralStats(options?: { query?: UseQueryOptions<ReferralStats> }) {
  return useQuery<ReferralStats>({
    queryKey: getGetReferralStatsQueryKey(),
    queryFn: () => apiClient.get<ReferralStats>("/api/referral/stats"),
    ...options?.query,
  });
}

export function useGetCommissions(options?: { query?: UseQueryOptions<Commission[]> }) {
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
// SUBSCRIPTION / PAYMENT
// ============================================================
export function useInitiatePayment(
  options?: UseMutationOptions<InitiatePaymentResponse, Error, { data: InitiatePaymentRequest }>
) {
  return useMutation({
    mutationFn: ({ data }: { data: InitiatePaymentRequest }) =>
      apiClient.post<InitiatePaymentResponse>("/api/subscription/initiate", data),
    ...options,
  });
}

// ============================================================
// PROJECTS
// ============================================================
export function useGetProjects(options?: { query?: UseQueryOptions<Project[]> }) {
  return useQuery<Project[]>({
    queryKey: getGetProjectsQueryKey(),
    queryFn: () => apiClient.get<Project[]>("/api/projects"),
    ...options?.query,
  });
}

export function useCreateProject(options?: UseMutationOptions<Project, Error, { data: Partial<Project> }>) {
  return useMutation({
    mutationFn: ({ data }: { data: Partial<Project> }) =>
      apiClient.post<Project>("/api/projects", data),
    ...options,
  });
}

export function useUpdateProject(options?: UseMutationOptions<Project, Error, { id: number; data: Partial<Project> }>) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
      apiClient.put<Project>(`/api/projects/${id}`, data),
    ...options,
  });
}

export function useDeleteProject(options?: UseMutationOptions<{ message: string }, Error, { id: number }>) {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiClient.delete<{ message: string }>(`/api/projects/${id}`),
    ...options,
  });
}

// ============================================================
// ADMIN
// ============================================================
export function useGetAdminStats(days?: number, options?: { query?: UseQueryOptions<AdminStats> }) {
  return useQuery<AdminStats>({
    queryKey: getGetAdminStatsQueryKey(days),
    queryFn: () => apiClient.get<AdminStats>(`/api/admin/stats${days ? `?days=${days}` : ""}`),
    ...options?.query,
  });
}

export function useGetAdminUsers(
  _params?: undefined,
  options?: { query?: UseQueryOptions<AdminUsersResponse> }
) {
  return useQuery<AdminUsersResponse>({
    queryKey: getGetAdminUsersQueryKey(),
    queryFn: () => apiClient.get<AdminUsersResponse>("/api/admin/users"),
    ...options?.query,
  });
}

export function useGetAdminWithdrawals(options?: { query?: UseQueryOptions<Withdrawal[]> }) {
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

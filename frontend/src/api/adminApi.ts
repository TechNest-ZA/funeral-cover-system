import { apiRequest } from './client';
import type {
  AdminUserResponse,
  BookFilterValue,
  BookRow,
  ChangePasswordRequest,
  ClaimResponse,
  CreateStaffRequest,
  DashboardStats,
  FuneralEventCreateRequest,
  FuneralEventResponse,
  LoginResponse,
  MemberDetail,
  MemberListItem,
  MemberSignupRequest,
  MemberStatus,
  PageResponse,
  PaymentSummary,
  RecordClaimRequest,
  TodayResponse,
} from './types';

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', { method: 'POST', body: { username, password } });
}

export function searchMembers(params: {
  search?: string;
  status?: MemberStatus | '';
  page?: number;
}): Promise<PageResponse<MemberListItem>> {
  return apiRequest<PageResponse<MemberListItem>>('/api/admin/members', {
    auth: true,
    query: { search: params.search, status: params.status || undefined, page: params.page ?? 0 },
  });
}

export function getMemberDetail(id: number): Promise<MemberDetail> {
  return apiRequest<MemberDetail>(`/api/admin/members/${id}`, { auth: true });
}

export function getBook(params: {
  search?: string;
  filter?: BookFilterValue;
  page?: number;
}): Promise<PageResponse<BookRow>> {
  return apiRequest<PageResponse<BookRow>>('/api/admin/members/book', {
    auth: true,
    query: { search: params.search, filter: params.filter, page: params.page ?? 0 },
  });
}

export function createMember(request: MemberSignupRequest): Promise<MemberDetail> {
  return apiRequest<MemberDetail>('/api/admin/members', { method: 'POST', auth: true, body: request });
}

export function recordManualPayment(memberId: number, amount?: number): Promise<PaymentSummary> {
  return apiRequest<PaymentSummary>('/api/admin/payments/manual', {
    method: 'POST',
    auth: true,
    body: { memberId, amount },
  });
}

export function recordClaim(memberId: number, request: RecordClaimRequest): Promise<ClaimResponse> {
  return apiRequest<ClaimResponse>(`/api/admin/members/${memberId}/claim`, {
    method: 'POST',
    auth: true,
    body: request,
  });
}

export function regenerateBookLink(memberId: number): Promise<{ accessToken: string }> {
  return apiRequest<{ accessToken: string }>(`/api/admin/members/${memberId}/regenerate-token`, {
    method: 'POST',
    auth: true,
  });
}

export function getStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/api/admin/stats', { auth: true });
}

export function getToday(): Promise<TodayResponse> {
  return apiRequest<TodayResponse>('/api/admin/today', { auth: true });
}

export function listFuneralEvents(): Promise<FuneralEventResponse[]> {
  return apiRequest<FuneralEventResponse[]>('/api/admin/funeral-events', { auth: true });
}

export function createFuneralEvent(request: FuneralEventCreateRequest): Promise<FuneralEventResponse> {
  return apiRequest<FuneralEventResponse>('/api/admin/funeral-events', { method: 'POST', auth: true, body: request });
}

export function exportMembersCsv(params: { search?: string; status?: MemberStatus | '' }): Promise<string> {
  return apiRequest<string>('/api/admin/export/members', {
    auth: true,
    query: { search: params.search, status: params.status || undefined, format: 'csv' },
  });
}

export function exportMembersPdf(params: { search?: string; status?: MemberStatus | '' }): Promise<Blob> {
  return apiRequest<Blob>('/api/admin/export/members', {
    auth: true,
    query: { search: params.search, status: params.status || undefined, format: 'pdf' },
  });
}

export function exportPaymentsCsv(params: { from?: string; to?: string }): Promise<string> {
  return apiRequest<string>('/api/admin/export/payments', {
    auth: true,
    query: { from: params.from, to: params.to, format: 'csv' },
  });
}

export function exportPaymentsPdf(params: { from?: string; to?: string }): Promise<Blob> {
  return apiRequest<Blob>('/api/admin/export/payments', {
    auth: true,
    query: { from: params.from, to: params.to, format: 'pdf' },
  });
}

export function listStaff(): Promise<AdminUserResponse[]> {
  return apiRequest<AdminUserResponse[]>('/api/admin/staff', { auth: true });
}

export function createStaff(request: CreateStaffRequest): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>('/api/admin/staff', { method: 'POST', auth: true, body: request });
}

export function deleteStaff(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/staff/${id}`, { method: 'DELETE', auth: true });
}

export function changePassword(request: ChangePasswordRequest): Promise<void> {
  return apiRequest<void>('/api/admin/me/password', { method: 'POST', auth: true, body: request });
}

export function resetStaffPassword(id: number, newPassword: string): Promise<void> {
  return apiRequest<void>(`/api/admin/staff/${id}/reset-password`, {
    method: 'POST',
    auth: true,
    body: { newPassword },
  });
}

export interface Plan {
  id: number;
  name: string;
  monthlyPremium: number;
  coverAmount: number;
  description: string;
  benefits: string[];
}

export type PaymentMethod = 'eft' | 'card' | 'cash';
export type MemberStatus = 'pending' | 'active' | 'lapsed' | 'deceased';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface MemberSignupRequest {
  fullName: string;
  idNumber: string;
  phone: string;
  beneficiaryName: string;
  beneficiaryRelationship: string;
  beneficiaryPhone: string;
  beneficiaryIdNumber?: string;
  email?: string;
  planId: number;
  sourceCode?: string;
}

export interface MemberSignupResponse {
  id: number;
  fullName: string;
  status: MemberStatus;
  accessToken: string;
}

export interface PaymentInitiateResponse {
  paymentId: number;
  status: PaymentStatus;
  fake: boolean;
  redirectUrl: string | null;
  reference: string;
}

export interface MemberCardResponse {
  memberId: number;
  memberNumber: string;
  fullName: string;
  planName: string;
  monthlyPremium: number;
  coverAmount: number;
  benefits: string[];
  status: MemberStatus;
  signupDate: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: 'staff' | 'owner';
}

export interface MemberListItem {
  id: number;
  fullName: string;
  idNumber: string;
  planName: string;
  status: MemberStatus;
  lastPaymentDate: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaymentSummary {
  id: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  paidAt: string | null;
  createdAt: string;
}

export interface DependentResponse {
  id: number;
  fullName: string;
  idNumber: string | null;
  relationship: string;
  createdAt: string;
}

export interface DependentRequest {
  fullName: string;
  idNumber?: string;
  relationship: string;
}

export interface MemberBookResponse {
  memberId: number;
  memberNumber: string;
  fullName: string;
  planName: string;
  monthlyPremium: number;
  coverAmount: number;
  benefits: string[];
  status: MemberStatus;
  signupDate: string;
  nextDueDate: string | null;
  payments: PaymentSummary[];
  dependents: DependentResponse[];
}

export interface ClaimResponse {
  id: number;
  dependentId: number | null;
  dependentName: string | null;
  dependentRelationship: string | null;
  dateOfDeath: string;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
}

export interface RecordClaimRequest {
  dateOfDeath: string;
  notes?: string;
  dependentId?: number;
}

export interface MemberDetail {
  id: number;
  fullName: string;
  idNumber: string;
  phone: string;
  beneficiaryName: string | null;
  beneficiaryRelationship: string | null;
  beneficiaryPhone: string | null;
  beneficiaryIdNumber: string | null;
  email: string | null;
  planName: string;
  monthlyPremium: number;
  coverAmount: number;
  benefits: string[];
  status: MemberStatus;
  signupDate: string;
  payments: PaymentSummary[];
  dependents: DependentResponse[];
  claims: ClaimResponse[];
}

export interface DashboardStats {
  totalMembers: number;
  paidThisMonth: number;
  outstandingCount: number;
}

export type AdminRole = 'staff' | 'owner';

export interface AdminUserResponse {
  id: number;
  username: string;
  role: AdminRole;
  createdAt: string;
}

export interface CreateStaffRequest {
  username: string;
  password: string;
  role: AdminRole;
}

export interface ApiErrorBody {
  status: number;
  message: string;
  fieldErrors?: Record<string, string> | null;
}

export interface FuneralEventResponse {
  id: number;
  label: string;
  serviceDate: string;
  qrToken: string;
  signupUrl: string;
  totalSignups: number;
  signupsThisMonth: number;
}

export interface FuneralEventCreateRequest {
  label: string;
  serviceDate: string;
}

export interface NeedsCallItem {
  memberId: number;
  fullName: string;
  tenure: string;
  plan: string;
  state: string;
  detail: string;
  phone: string;
}

export interface MonthStats {
  premiumsCollected: number;
  premiumsNote: string;
  membersPaidUp: number;
  totalActive: number;
  paidUpNote: string;
  newMembers: number;
  newMembersNote: string;
  claimsThisMonth: number;
  claimsNote: string;
}

export interface FuneralAttribution {
  newMembersThisMonth: number;
  extraMonthlyPremium: number;
  bestServiceLabel: string | null;
  bestServiceCount: number | null;
}

export interface TodayResponse {
  date: string;
  needsCall: NeedsCallItem[];
  monthStats: MonthStats;
  funeralAttribution: FuneralAttribution;
}

export type BookFilterValue = 'everyone' | 'pending' | 'deceased' | 'behind' | 'new_this_month' | 'from_funeral';

export type StandingStatus = 'active' | 'pending' | 'behind' | 'deceased';

export interface BookRow {
  id: number;
  fullName: string;
  idNumber: string;
  planName: string;
  coversLabel: string;
  standingStatus: StandingStatus;
  standingDetail: string;
}

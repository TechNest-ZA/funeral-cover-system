import { apiRequest } from './client';
import type {
  DependentRequest,
  DependentResponse,
  MemberBookResponse,
  MemberCardResponse,
  MemberSignupRequest,
  MemberSignupResponse,
  PaymentInitiateResponse,
  PaymentMethod,
  Plan,
} from './types';

export function listPlans(): Promise<Plan[]> {
  return apiRequest<Plan[]>('/api/plans');
}

export function signupMember(request: MemberSignupRequest): Promise<MemberSignupResponse> {
  return apiRequest<MemberSignupResponse>('/api/members', { method: 'POST', body: request });
}

export function initiatePayment(memberId: number, method: PaymentMethod): Promise<PaymentInitiateResponse> {
  return apiRequest<PaymentInitiateResponse>('/api/payments/initiate', {
    method: 'POST',
    body: { memberId, method },
  });
}

export function getMemberCard(memberId: number): Promise<MemberCardResponse> {
  return apiRequest<MemberCardResponse>(`/api/members/${memberId}/card`);
}

export function getMemberBook(token: string): Promise<MemberBookResponse> {
  return apiRequest<MemberBookResponse>(`/api/members/book/${token}`);
}

export function addDependent(token: string, request: DependentRequest): Promise<DependentResponse> {
  return apiRequest<DependentResponse>(`/api/members/book/${token}/dependents`, {
    method: 'POST',
    body: request,
  });
}

export function removeDependent(token: string, dependentId: number): Promise<void> {
  return apiRequest<void>(`/api/members/book/${token}/dependents/${dependentId}`, { method: 'DELETE' });
}

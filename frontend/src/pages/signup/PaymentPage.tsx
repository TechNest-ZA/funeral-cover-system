import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SignupLayout } from '../../components/SignupLayout';
import { SignupChrome } from '../../components/SignupChrome';
import { SignupProgress } from '../../components/SignupProgress';
import { Button } from '../../components/Button';
import { getMemberCard, initiatePayment } from '../../api/publicApi';
import { ApiError } from '../../api/client';
import type { MemberCardResponse, PaymentMethod } from '../../api/types';
import { formatCurrency } from '../../utils/format';

export function PaymentPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = Number(memberId);
  const accessToken = (location.state as { accessToken?: string } | null)?.accessToken;

  const [member, setMember] = useState<MemberCardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('eft');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMemberCard(id)
      .then((data) => {
        if (data.status === 'active') {
          navigate(`/join/${id}/confirmation`, { replace: true, state: { accessToken } });
          return;
        }
        setMember(data);
      })
      .catch(() => setError('Could not find your signup. Please start again.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handlePay() {
    setPaying(true);
    setError(null);
    try {
      const result = await initiatePayment(id, method);
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      // fake-pay mode (or already settled): go straight to confirmation
      navigate(`/join/${id}/confirmation`, { state: { accessToken } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment could not be started. Please try again.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <SignupLayout>
      <SignupChrome />
      <SignupProgress step={3} />
      <div style={{ padding: '26px 22px 30px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.18, fontWeight: 400, margin: '0 0 9px', color: 'var(--ink)' }}>
          Complete your payment
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 22px' }}>
          Secure checkout to activate your cover.
        </p>

        {error && (
          <div style={{ background: '#f3ddd7', color: '#8f3a28', padding: '0.9em 1.1em', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}
        {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}

        {member && (
          <>
            <div style={{ border: '1px solid var(--line)', background: 'var(--paper-raised)', padding: '18px 19px', marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'var(--font-warm-body)' }}>
                <span style={{ color: 'var(--muted)' }}>Plan</span>
                <strong style={{ color: 'var(--ink)' }}>{member.planName}</strong>
              </div>
              <ul style={{ margin: '0 0 8px', padding: 0, listStyle: 'none' }}>
                {member.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 14, color: 'var(--body)', marginTop: 4, fontFamily: 'var(--font-warm-body)' }}
                  >
                    <span style={{ color: 'var(--clay)' }}>—</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontFamily: 'var(--font-warm-body)' }}>
                <span style={{ color: 'var(--ink)' }}>Due today</span>
                <strong style={{ color: 'var(--clay)' }}>{formatCurrency(member.monthlyPremium)}</strong>
              </div>
            </div>

            <div style={{ border: '1px solid var(--line)', background: 'var(--paper-raised)', padding: '18px 19px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', margin: '0 0 14px', fontWeight: 400 }}>
                Payment method
              </h3>
              <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
                {(['eft', 'card'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    style={{
                      flex: 1,
                      padding: '0.85rem',
                      border: method === m ? '2px solid var(--clay)' : '1.5px solid var(--line-strong)',
                      background: method === m ? 'var(--paper-sunken)' : 'var(--paper-raised)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-warm-body)',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Button variant="clay" onClick={handlePay} loading={paying}>
                Pay {formatCurrency(member.monthlyPremium)}
              </Button>
              <p style={{ fontSize: 13, color: 'var(--muted-warm)', marginTop: '0.75rem', textAlign: 'center' }}>
                Your payment is processed securely to activate your cover.
              </p>
            </div>
          </>
        )}
      </div>
    </SignupLayout>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SignupLayout } from '../../components/SignupLayout';
import { SignupChrome } from '../../components/SignupChrome';
import { SignupProgress } from '../../components/SignupProgress';
import { PlanCard } from '../../components/PlanCard';
import { Button } from '../../components/Button';
import { listPlans } from '../../api/publicApi';
import type { Plan } from '../../api/types';
import { formatCurrency } from '../../utils/format';

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceCode = searchParams.get('src') || undefined;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planId, setPlanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listPlans()
      .then((data) => {
        setPlans(data);
        if (data.length > 0) setPlanId(data[0].id);
      })
      .catch(() => setError('Could not load plans. Please check your connection and reload.'))
      .finally(() => setPlansLoading(false));
  }, []);

  const selectedPlan = plans.find((p) => p.id === planId);

  function handleContinue() {
    if (!planId) {
      setError('Please select a plan.');
      return;
    }
    navigate('/join/details', { state: { planId, sourceCode } });
  }

  return (
    <SignupLayout>
      <SignupChrome />
      <SignupProgress step={1} />
      <div style={{ padding: '26px 22px 30px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.18, fontWeight: 400, margin: '0 0 9px', color: 'var(--ink)' }}>
          Choose your cover
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 22px' }}>
          Every plan covers your immediate family — pick the level of service that's right for you.
        </p>

        {error && (
          <div style={{ background: '#f3ddd7', color: '#8f3a28', padding: '0.9em 1.1em', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 22 }}>
          {plansLoading && <p style={{ color: 'var(--muted)' }}>Loading plans…</p>}
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} selected={planId === plan.id} onSelect={() => setPlanId(plan.id)} />
          ))}
        </div>

        <div style={{ background: 'var(--paper-sunken)', borderLeft: '2px solid var(--clay)', padding: '15px 17px', marginBottom: 22 }}>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>
            Not sure which one? <strong style={{ color: 'var(--ink)' }}>Family</strong> is a popular middle
            ground — it adds a proper tent and catering for the service without the highest premium.
          </div>
        </div>

        <Button variant="clay" onClick={handleContinue} disabled={plansLoading}>
          Continue{selectedPlan ? ` — ${formatCurrency(selectedPlan.monthlyPremium)} a month` : ''}
        </Button>
        <div style={{ marginTop: 13, fontSize: 13, lineHeight: 1.55, color: 'var(--muted)', textAlign: 'center' }}>
          Nothing is charged until you complete payment.
        </div>
      </div>
    </SignupLayout>
  );
}

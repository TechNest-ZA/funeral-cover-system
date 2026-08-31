import type { Plan } from '../api/types';
import { formatCurrency } from '../utils/format';

export function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
}) {
  // benefits[0] is always body collection (every tier); [1]/[2] (casket, transport)
  // are what actually differentiates the tiers, so that's what earns the space here.
  const summary = [plan.benefits[1], plan.benefits[2]].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '18px 19px',
        border: selected ? '2px solid var(--clay)' : '1.5px solid var(--line)',
        background: selected ? 'var(--paper-sunken)' : 'var(--paper-raised)',
        marginBottom: 11,
        cursor: 'pointer',
        fontFamily: 'var(--font-warm-body)',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)' }}>{plan.name}</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
          {formatCurrency(plan.monthlyPremium)}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>/mo</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--clay)' }}>
          {formatCurrency(plan.coverAmount)}
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>cash to your family</span>
      </div>
      {summary && <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--body)', marginTop: 7 }}>{summary}</div>}
      {selected && (
        <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: 'var(--clay)' }}>✓ Selected</div>
      )}
    </button>
  );
}

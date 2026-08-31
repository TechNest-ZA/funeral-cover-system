const STEPS: Record<number, { label: string; timeLeft: string; percent: number }> = {
  1: { label: 'choosing your cover', timeLeft: 'About two minutes left', percent: 33 },
  2: { label: 'your details', timeLeft: 'About one minute left', percent: 66 },
  3: { label: 'payment', timeLeft: 'Almost there', percent: 100 },
};

export function SignupProgress({ step }: { step: 1 | 2 | 3 }) {
  const { label, timeLeft, percent } = STEPS[step];
  return (
    <div style={{ padding: '16px 22px', background: 'var(--paper-sunken)', borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontSize: '13.5px', lineHeight: 1.5, color: 'var(--body)', fontFamily: 'var(--font-warm-body)' }}>
        Step <strong style={{ color: 'var(--ink)' }}>{step} of 3</strong> — {label}. {timeLeft}.
      </div>
      <div style={{ marginTop: 9, height: 3, background: 'var(--line)', display: 'flex' }}>
        <div style={{ width: `${percent}%`, background: 'var(--clay)', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

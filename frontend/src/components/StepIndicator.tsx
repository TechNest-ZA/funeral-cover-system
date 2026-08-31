const STEPS = ['Your details', 'Payment', 'Confirmation'];

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem' }}>
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: isDone || isActive ? 'var(--color-teal)' : 'var(--color-surface)',
                  color: isDone || isActive ? '#fff' : 'var(--color-text-faint)',
                  border: isDone || isActive ? 'none' : '1.5px solid var(--color-border)',
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-faint)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: '0 6px 18px',
                  background: isDone ? 'var(--color-teal)' : 'var(--color-border)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

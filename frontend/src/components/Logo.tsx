import { BRAND_NAME } from '../config';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 22, md: 28, lg: 36 }[size];
  const fontSize = { sm: '1rem', md: '1.25rem', lg: '1.5rem' }[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
      <svg width={dims} height={dims} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L4 5v6c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5l-8-3z"
          fill="var(--color-teal)"
        />
        <path
          d="M9 12.5l2 2 4-4.5"
          stroke="#ffffff"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ fontSize, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>
        {BRAND_NAME}
      </span>
    </div>
  );
}

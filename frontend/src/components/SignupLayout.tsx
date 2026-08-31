import type { ReactNode } from 'react';

export function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--canvas)',
        fontFamily: 'var(--font-warm-body)',
        color: 'var(--ink)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          minHeight: '100vh',
          background: 'var(--paper-raised)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 0 0 1px var(--line)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Logo } from './Logo';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background:
          'radial-gradient(circle at 50% -10%, var(--color-primary-light) 0%, var(--color-bg) 45%)',
      }}
    >
      <header style={{ padding: '1.5rem 1.25rem 0.5rem', width: '100%', maxWidth: 440 }}>
        <Logo size="md" />
      </header>
      <main
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '1rem 1.25rem 3rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </main>
      <footer
        style={{
          padding: '1rem',
          color: 'var(--color-text-faint)',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        Your details are kept secure and are never shared with third parties.
      </footer>
    </div>
  );
}

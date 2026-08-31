import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { BRAND_NAME } from '../config';
import { useAuth } from '../context/AuthContext';
import './ui.css';

function AdminNavLink({ to, end, children }: { to: string; end?: boolean; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        padding: '8px 14px',
        fontSize: 14,
        fontWeight: 600,
        color: isActive ? 'var(--ink)' : 'var(--on-dark-body)',
        background: isActive ? 'var(--sand)' : 'transparent',
        textDecoration: 'none',
        fontFamily: 'var(--font-warm-body)',
      })}
    >
      {children}
    </NavLink>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header
        style={{
          background: 'var(--ink)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--sand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--on-dark)' }}>
              {BRAND_NAME}
            </span>
          </div>
          <nav style={{ display: 'flex', gap: 3 }}>
            <AdminNavLink to="/admin" end>
              Today
            </AdminNavLink>
            <AdminNavLink to="/admin/members">The book</AdminNavLink>
            {user?.role === 'owner' && <AdminNavLink to="/admin/staff">Staff</AdminNavLink>}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--on-dark-body)', fontFamily: 'var(--font-warm-body)' }}>
            {user?.username} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </span>
          <button
            onClick={logout}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--sand)',
              fontFamily: 'var(--font-warm-body)',
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main style={{ padding: '28px 24px', maxWidth: 1140, margin: '0 auto' }}>{children}</main>
    </div>
  );
}

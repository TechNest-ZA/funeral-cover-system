import { Fragment, useEffect, useState, type FormEvent } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { createStaff, deleteStaff, listStaff, resetStaffPassword } from '../../api/adminApi';
import type { AdminRole, AdminUserResponse } from '../../api/types';
import { ApiError } from '../../api/client';
import { formatDate } from '../../utils/format';
import '../../components/ui.css';

export function StaffPage() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<AdminUserResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('staff');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPassword, setResetPasswordValue] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  function load() {
    listStaff()
      .then(setStaff)
      .catch(() => setError('Could not load staff accounts.'));
  }

  useEffect(load, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await createStaff({ username, password, role });
      setUsername('');
      setPassword('');
      setRole('staff');
      setShowForm(false);
      load();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        else setError(err.message);
      } else {
        setError('Could not create the account. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function openReset(id: number) {
    setResetId(id);
    setResetPasswordValue('');
    setResetError(null);
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (resetId === null) return;
    setResetError(null);
    setResetting(true);
    try {
      await resetStaffPassword(resetId, resetPassword);
      setResetId(null);
      setResetPasswordValue('');
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : 'Could not reset the password.');
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete(member: AdminUserResponse) {
    if (!window.confirm(`Remove access for "${member.username}"?`)) return;
    setDeletingId(member.id);
    setError(null);
    try {
      await deleteStaff(member.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove this account.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Staff accounts</h1>
        {!showForm && (
          <Button variant="secondary" onClick={() => setShowForm(true)} style={{ width: 'auto' }}>
            Add account
          </Button>
        )}
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {showForm && (
        <Card style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '0.9rem' }}>
            New account
          </h2>
          <form onSubmit={handleCreate}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={fieldErrors.username}
              autoComplete="off"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              hint="At least 8 characters"
              autoComplete="new-password"
              required
            />
            <div className="field">
              <label htmlFor="staff-role">Role</label>
              <select id="staff-role" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
                <option value="staff">Staff — day-to-day member & payment tasks</option>
                <option value="owner">Owner — full access including reports & exports</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="submit" loading={submitting}>
                Create account
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)', textAlign: 'left' }}>
                {['Username', 'Role', 'Created', ''].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!staff && !error && (
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {staff?.map((s) => (
                <Fragment key={s.id}>
                  <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                      {s.username}
                      {currentUser?.username === s.username && (
                        <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}> (you)</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={s.role} />
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(s.createdAt)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary btn-sm btn-inline"
                        onClick={() => (resetId === s.id ? setResetId(null) : openReset(s.id))}
                        style={{ marginRight: 8 }}
                      >
                        Reset password
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-inline"
                        onClick={() => handleDelete(s)}
                        disabled={deletingId === s.id}
                      >
                        {deletingId === s.id ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                  {resetId === s.id && (
                    <tr style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}>
                      <td colSpan={4} style={{ padding: '1rem' }}>
                        <form onSubmit={handleReset} style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ minWidth: 240 }}>
                            <TextField
                              label={`New password for ${s.username}`}
                              type="password"
                              value={resetPassword}
                              onChange={(e) => setResetPasswordValue(e.target.value)}
                              error={resetError ?? undefined}
                              hint="At least 8 characters"
                              autoComplete="new-password"
                              required
                              style={{ marginBottom: 0 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8, paddingBottom: resetError ? 26 : 2 }}>
                            <Button type="submit" loading={resetting} style={{ width: 'auto' }}>
                              Set password
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setResetId(null)} disabled={resetting} style={{ width: 'auto' }}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

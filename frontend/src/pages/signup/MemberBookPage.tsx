import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { PublicLayout } from '../../components/PublicLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { StatusBadge } from '../../components/StatusBadge';
import { getMemberBook, addDependent, removeDependent } from '../../api/publicApi';
import { ApiError } from '../../api/client';
import type { MemberBookResponse } from '../../api/types';
import { formatCurrency, formatDate } from '../../utils/format';
import '../../components/ui.css';

export function MemberBookPage() {
  const { token } = useParams();

  const [book, setBook] = useState<MemberBookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [depName, setDepName] = useState('');
  const [depRelationship, setDepRelationship] = useState('');
  const [depIdNumber, setDepIdNumber] = useState('');
  const [depError, setDepError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  function load() {
    if (!token) return;
    getMemberBook(token)
      .then(setBook)
      .catch((err) =>
        setError(
          err instanceof ApiError && err.status === 404
            ? 'This link is not valid. Please check with your funeral parlor for your correct link.'
            : 'Could not load your payment book. Please check your connection and try again.'
        )
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleAddDependent(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setDepError(null);
    setSaving(true);
    try {
      await addDependent(token, {
        fullName: depName,
        relationship: depRelationship,
        idNumber: depIdNumber || undefined,
      });
      setDepName('');
      setDepRelationship('');
      setDepIdNumber('');
      setShowAddForm(false);
      load();
    } catch (err) {
      setDepError(err instanceof ApiError ? err.message : 'Could not add this family member.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDependent(id: number) {
    if (!token) return;
    if (!window.confirm('Remove this family member from your cover?')) return;
    setRemovingId(id);
    try {
      await removeDependent(token, id);
      load();
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <PublicLayout>
      <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Your payment book</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Every payment you've made, in one place.
      </p>

      {loading && <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>}
      {error && <div className="banner banner-error">{error}</div>}

      {book && (
        <>
          <Card style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{book.fullName}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
                  {book.memberNumber} · {book.planName}
                </div>
              </div>
              <StatusBadge status={book.status} />
            </div>
          </Card>

          <Card
            style={{
              marginBottom: '1.25rem',
              background: book.nextDueDate ? 'var(--color-teal-light)' : 'var(--color-warning-bg)',
              border: 'none',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 4 }}>
              {book.nextDueDate ? 'Next payment due' : 'Payment needed'}
            </div>
            <div
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: book.nextDueDate ? 'var(--color-teal-dark)' : 'var(--color-warning)',
              }}
            >
              {book.nextDueDate ? formatDate(book.nextDueDate) : 'Complete your first payment'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {formatCurrency(book.monthlyPremium)} / month · {book.planName}
            </div>
          </Card>

          <Card style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
              What's included
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {book.benefits.map((benefit) => (
                <li
                  key={benefit}
                  style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: '0.875rem', marginTop: 5 }}
                >
                  <span style={{ color: 'var(--color-teal)' }}>✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>

          <Card style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Family covered ({book.dependents.length})
              </h2>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-secondary btn-sm btn-inline"
                >
                  + Add
                </button>
              )}
            </div>

            {depError && <div className="banner banner-error">{depError}</div>}

            {book.dependents.length === 0 && !showAddForm && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                No family members added yet. Your plan already covers your immediate family — add
                them here so the parlor has their details on hand if they're ever needed.
              </p>
            )}

            {book.dependents.map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                    {d.relationship}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDependent(d.id)}
                  disabled={removingId === d.id}
                  className="btn btn-ghost btn-sm btn-inline"
                  style={{ color: 'var(--color-danger)' }}
                >
                  {removingId === d.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            ))}

            {showAddForm && (
              <form onSubmit={handleAddDependent} style={{ marginTop: book.dependents.length > 0 ? '1rem' : 0 }}>
                <TextField
                  label="Full name"
                  value={depName}
                  onChange={(e) => setDepName(e.target.value)}
                  required
                />
                <TextField
                  label="Relationship"
                  placeholder="e.g. Spouse, Child, Parent"
                  value={depRelationship}
                  onChange={(e) => setDepRelationship(e.target.value)}
                  required
                />
                <TextField
                  label="ID number (optional)"
                  value={depIdNumber}
                  onChange={(e) => setDepIdNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  inputMode="numeric"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type="submit" loading={saving} style={{ width: 'auto' }}>
                    Save
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} disabled={saving} style={{ width: 'auto' }}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', padding: '1.1rem 1.1rem 0' }}>
              Payment history
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-alt)', textAlign: 'left' }}>
                    {['Date', 'Amount', 'Method', 'Status'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.65rem 1.1rem',
                          fontSize: '0.7rem',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {book.payments.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '1.5rem 1.1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No payments yet.
                      </td>
                    </tr>
                  )}
                  {book.payments.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem 1.1rem', fontSize: '0.875rem' }}>
                        {formatDate(p.paidAt || p.createdAt)}
                      </td>
                      <td style={{ padding: '0.75rem 1.1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1.1rem',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {p.method}
                      </td>
                      <td style={{ padding: '0.75rem 1.1rem' }}>
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '1.25rem', textAlign: 'center' }}>
            Bookmark this page or save its QR code — it's your personal link, don't share it.
          </p>
        </>
      )}
    </PublicLayout>
  );
}

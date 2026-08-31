import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { QrCode } from '../../components/QrCode';
import { getMemberDetail, recordManualPayment, recordClaim, regenerateBookLink } from '../../api/adminApi';
import type { MemberDetail } from '../../api/types';
import { formatCurrency, formatDate } from '../../utils/format';
import { ApiError } from '../../api/client';
import '../../components/ui.css';

const PRIMARY_MEMBER = 'member';

export function MemberDetailPage() {
  const { id } = useParams();
  const memberId = Number(id);

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimTarget, setClaimTarget] = useState<string>(PRIMARY_MEMBER);
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [claimNotes, setClaimNotes] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [recordingClaim, setRecordingClaim] = useState(false);

  const [newBookLink, setNewBookLink] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  function load() {
    setLoading(true);
    getMemberDetail(memberId)
      .then(setMember)
      .finally(() => setLoading(false));
  }

  useEffect(load, [memberId]);

  async function handleRecordPayment() {
    setRecording(true);
    setError(null);
    try {
      await recordManualPayment(memberId, amount ? Number(amount) : undefined);
      setShowForm(false);
      setAmount('');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not record payment.');
    } finally {
      setRecording(false);
    }
  }

  async function handleRecordClaim(e: FormEvent) {
    e.preventDefault();
    const isPrimary = claimTarget === PRIMARY_MEMBER;
    const confirmMsg = isPrimary
      ? `Record ${member?.fullName} as deceased and close their cover? This can't be undone here.`
      : `Record this family member as deceased? The member's own cover will stay active.`;
    if (!window.confirm(confirmMsg)) return;

    setRecordingClaim(true);
    setClaimError(null);
    try {
      await recordClaim(memberId, {
        dateOfDeath,
        notes: claimNotes || undefined,
        dependentId: isPrimary ? undefined : Number(claimTarget),
      });
      setShowClaimForm(false);
      setClaimTarget(PRIMARY_MEMBER);
      setDateOfDeath('');
      setClaimNotes('');
      load();
    } catch (err) {
      setClaimError(err instanceof ApiError ? err.message : 'Could not record the claim.');
    } finally {
      setRecordingClaim(false);
    }
  }

  async function handleRegenerateLink() {
    if (!window.confirm("Generate a new payment book link for this member? Their old link and QR code will stop working immediately.")) {
      return;
    }
    setRegenerating(true);
    setCopied(false);
    try {
      const result = await regenerateBookLink(memberId);
      setNewBookLink(`${window.location.origin}/book/${result.accessToken}`);
    } finally {
      setRegenerating(false);
    }
  }

  function handleCopyLink() {
    if (!newBookLink) return;
    navigator.clipboard.writeText(newBookLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>;
  if (!member) return <p>Member not found.</p>;

  const memberClaim = member.claims.find((c) => c.dependentId === null);
  const claimedDependentIds = new Set(member.claims.filter((c) => c.dependentId !== null).map((c) => c.dependentId));
  const claimableDependents = member.dependents.filter((d) => !claimedDependentIds.has(d.id));

  return (
    <div>
      <Link to="/admin/members" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
        ← Back to members
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '1rem 0 1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{member.fullName}</h1>
          <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{member.idNumber}</div>
        </div>
        <StatusBadge status={member.status} />
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <Card style={{ flex: 1, minWidth: 260 }}>
          <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>Member details</h2>
          <DetailRow label="Phone" value={member.phone} />
          <DetailRow
            label="Contact"
            value={member.beneficiaryName ? `${member.beneficiaryName} (${member.beneficiaryRelationship})` : '—'}
          />
          <DetailRow label="Contact phone" value={member.beneficiaryPhone || '—'} />
          {member.beneficiaryIdNumber && <DetailRow label="Contact ID number" value={member.beneficiaryIdNumber} />}
          <DetailRow label="Email" value={member.email || '—'} />
          <DetailRow label="Plan" value={member.planName} />
          <DetailRow label="Monthly premium" value={formatCurrency(member.monthlyPremium)} />
          <DetailRow label="Payout amount" value={formatCurrency(member.coverAmount)} />
          <DetailRow label="Signup date" value={formatDate(member.signupDate)} />

          <div style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Includes</div>
          <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
            {member.benefits.map((benefit) => (
              <li key={benefit} style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: '0.85rem', marginTop: 3 }}>
                <span style={{ color: 'var(--color-teal)' }}>✓</span>
                {benefit}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
            {!newBookLink && (
              <Button variant="ghost" size="sm" onClick={handleRegenerateLink} loading={regenerating} style={{ width: 'auto' }}>
                Lost their book link? Regenerate it
              </Button>
            )}
            {newBookLink && (
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  New link — share this with the member. Their old link no longer works.
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <QrCode value={newBookLink} size={88} />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        wordBreak: 'break-all',
                        background: 'var(--color-surface-alt)',
                        padding: '0.5rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 8,
                      }}
                    >
                      {newBookLink}
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm btn-inline" onClick={handleCopyLink}>
                      {copied ? 'Copied!' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {memberClaim ? (
          <Card style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>Claim on file</h2>
            <DetailRow label="Date of death" value={formatDate(memberClaim.dateOfDeath)} />
            <DetailRow label="Recorded by" value={memberClaim.recordedBy || '—'} />
            <DetailRow label="Recorded on" value={formatDate(memberClaim.createdAt)} />
            {memberClaim.notes && (
              <div style={{ marginTop: 10, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {memberClaim.notes}
              </div>
            )}
          </Card>
        ) : (
          <Card style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>Record a cash payment</h2>
            {error && <div className="banner banner-error">{error}</div>}
            {!showForm && (
              <Button variant="secondary" onClick={() => setShowForm(true)}>
                Record cash payment
              </Button>
            )}
            {showForm && (
              <div>
                <div className="field">
                  <label htmlFor="cash-amount">Amount (defaults to {formatCurrency(member.monthlyPremium)})</label>
                  <input
                    id="cash-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={String(member.monthlyPremium)}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={handleRecordPayment} loading={recording}>
                    Confirm payment
                  </Button>
                  <Button variant="ghost" onClick={() => setShowForm(false)} disabled={recording}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
          Family covered ({member.dependents.length})
        </h2>
        {member.dependents.length === 0 && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            No family members on file. Members add these themselves through their payment book link.
          </p>
        )}
        {member.dependents.map((d) => {
          const claimed = claimedDependentIds.has(d.id);
          return (
            <div
              key={d.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.fullName}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', marginLeft: 8, textTransform: 'capitalize' }}>
                  {d.relationship}
                </span>
              </div>
              {claimed && <StatusBadge status="deceased" />}
            </div>
          );
        })}
      </Card>

      {!memberClaim && (
        <Card style={{ marginBottom: '1.5rem', background: 'var(--color-surface-alt)', border: 'none' }}>
          <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Record a claim</h2>
          {!showClaimForm && (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.9rem' }}>
                If the member or someone in their covered family has passed away, record it here.
              </p>
              <Button variant="danger" onClick={() => setShowClaimForm(true)} style={{ width: 'auto' }}>
                Record death / claim
              </Button>
            </>
          )}
          {showClaimForm && (
            <form onSubmit={handleRecordClaim}>
              {claimError && <div className="banner banner-error">{claimError}</div>}
              <div className="field">
                <label htmlFor="claim-target">Who passed away?</label>
                <select id="claim-target" value={claimTarget} onChange={(e) => setClaimTarget(e.target.value)}>
                  <option value={PRIMARY_MEMBER}>{member.fullName} (the member)</option>
                  {claimableDependents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.relationship})
                    </option>
                  ))}
                </select>
                {claimTarget === PRIMARY_MEMBER && (
                  <div className="field-hint">This will close the member's cover.</div>
                )}
              </div>
              <div className="field">
                <label htmlFor="date-of-death">Date of death</label>
                <input
                  id="date-of-death"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={dateOfDeath}
                  onChange={(e) => setDateOfDeath(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="claim-notes">Notes (optional)</label>
                <textarea
                  id="claim-notes"
                  rows={3}
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7em 0.9em',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--color-border)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button type="submit" variant="danger" loading={recordingClaim} style={{ width: 'auto' }}>
                  Confirm claim
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowClaimForm(false)} disabled={recordingClaim} style={{ width: 'auto' }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      {member.claims.length > 0 && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>Claims history</h2>
          {member.claims.map((c) => (
            <div key={c.id} style={{ padding: '0.5rem 0', borderTop: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
              <strong>{c.dependentId ? `${c.dependentName} (${c.dependentRelationship})` : `${member.fullName} (member)`}</strong>
              {' — '}
              {formatDate(c.dateOfDeath)}, recorded by {c.recordedBy || '—'}
              {c.notes && <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{c.notes}</div>}
            </div>
          ))}
        </Card>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', padding: '1.25rem 1.25rem 0' }}>
          Payment history
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)', textAlign: 'left' }}>
                {['Date', 'Amount', 'Method', 'Status', 'Reference'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {member.payments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1.5rem 1.25rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No payments yet.
                  </td>
                </tr>
              )}
              {member.payments.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.85rem 1.25rem' }}>{formatDate(p.paidAt || p.createdAt)}</td>
                  <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600 }}>{formatCurrency(p.amount)}</td>
                  <td style={{ padding: '0.85rem 1.25rem', textTransform: 'uppercase', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {p.method}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                    {p.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.9rem' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getToday, listFuneralEvents, createFuneralEvent } from '../../api/adminApi';
import type { TodayResponse, FuneralEventResponse } from '../../api/types';
import { formatCurrency } from '../../utils/format';
import { QrCode } from '../../components/QrCode';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { ApiError } from '../../api/client';
import '../../components/ui.css';

function panelStyle(): CSSProperties {
  return { border: '1px solid var(--line)', background: 'var(--paper-raised)' };
}

function stateColor(state: string): string {
  if (state === 'One month behind') return 'var(--status-behind-fg)';
  return 'var(--status-lapsed-fg)';
}

function formatHeaderDate(iso: string): string {
  return new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(iso + 'T00:00:00')
  );
}

export function TodayPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [today, setToday] = useState<TodayResponse | null>(null);
  const [events, setEvents] = useState<FuneralEventResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventLabel, setEventLabel] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventError, setEventError] = useState<string | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);

  function loadEvents() {
    listFuneralEvents().then(setEvents).catch(() => {});
  }

  useEffect(() => {
    getToday()
      .then(setToday)
      .catch(() => setError('Could not load today’s work. Please reload.'));
    loadEvents();
  }, []);

  async function handleCreateEvent(e: FormEvent) {
    e.preventDefault();
    setEventError(null);
    setCreatingEvent(true);
    try {
      await createFuneralEvent({ label: eventLabel, serviceDate: eventDate });
      setEventLabel('');
      setEventDate('');
      setShowEventForm(false);
      loadEvents();
    } catch (err) {
      setEventError(err instanceof ApiError ? err.message : 'Could not create this QR code. Please try again.');
    } finally {
      setCreatingEvent(false);
    }
  }

  async function copyLink(event: FuneralEventResponse) {
    await navigator.clipboard.writeText(event.signupUrl);
    setCopiedToken(event.qrToken);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  const needsCall = today?.needsCall ?? [];

  return (
    <div style={{ fontFamily: 'var(--font-warm-body)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            {today ? formatHeaderDate(today.date) : 'Today'}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)', margin: '5px 0 0' }}>
            {today
              ? needsCall.length === 0
                ? 'Nobody needs a call today. Everything is running.'
                : `${needsCall.length} member${needsCall.length === 1 ? '' : 's'} need${needsCall.length === 1 ? 's' : ''} a call today. Everything else is running.`
              : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <Link to="/admin/members" style={{ textDecoration: 'none' }}>
            <span
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 18px',
                border: '1.5px solid var(--line-strong)',
                background: '#fff',
                fontSize: 14.5,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              Search the book
            </span>
          </Link>
          <Link to="/admin/members/new" style={{ textDecoration: 'none' }}>
            <span
              style={{
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 18px',
                background: 'var(--clay)',
                color: 'var(--paper-raised)',
                fontSize: 14.5,
                fontWeight: 700,
              }}
            >
              + Add a member
            </span>
          </Link>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: isOwner ? '1.25fr 0.75fr' : '1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={panelStyle()}>
            <div
              style={{
                padding: '15px 20px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                background: 'var(--paper-sunken)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)' }}>Needs a call today</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {needsCall.length} member{needsCall.length === 1 ? '' : 's'} · sorted by how long they have been with you
              </span>
            </div>
            {needsCall.length === 0 && today && (
              <div style={{ padding: '20px', fontSize: 14, color: 'var(--muted)' }}>
                Nobody is behind on payment right now.
              </div>
            )}
            {needsCall.map((m) => (
              <div
                key={m.memberId}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid var(--line-soft)',
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr auto',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div>
                  <Link to={`/admin/members/${m.memberId}`} style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>
                    {m.fullName}
                  </Link>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{m.tenure}</div>
                </div>
                <div style={{ fontSize: 14, color: 'var(--body)' }}>{m.plan}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: stateColor(m.state) }}>{m.state}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{m.detail}</div>
                </div>
                <a
                  href={`tel:${m.phone}`}
                  style={{
                    minHeight: 40,
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 15px',
                    background: 'var(--ink)',
                    color: 'var(--on-dark)',
                    fontSize: 13.5,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  Call {m.phone}
                </a>
              </div>
            ))}
          </div>

          <div style={panelStyle()}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper-sunken)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)' }}>Joined from a funeral this month</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1, color: 'var(--ink)' }}>
                    {today?.funeralAttribution.newMembersThisMonth ?? '—'}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5 }}>new members from QR scans</div>
                </div>
                {isOwner && (
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1, color: 'var(--ink)' }}>
                      {today ? formatCurrency(today.funeralAttribution.extraMonthlyPremium) : '—'}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 5 }}>extra monthly premium</div>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 220, fontSize: 14, lineHeight: 1.6, color: 'var(--body)', borderLeft: '2px solid var(--clay)', paddingLeft: 16 }}>
                  {today?.funeralAttribution.bestServiceLabel ? (
                    <>
                      Your best service was <strong style={{ color: 'var(--ink)' }}>{today.funeralAttribution.bestServiceLabel}</strong> —{' '}
                      {today.funeralAttribution.bestServiceCount}{' '}
                      {today.funeralAttribution.bestServiceCount === 1 ? 'person' : 'people'} joined from that programme alone.
                    </>
                  ) : (
                    'No signups from a funeral QR code yet this month.'
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>QR codes</span>
                  <button
                    type="button"
                    onClick={() => setShowEventForm((v) => !v)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: 'var(--clay)' }}
                  >
                    {showEventForm ? 'Cancel' : '+ New QR code'}
                  </button>
                </div>

                {showEventForm && (
                  <form onSubmit={handleCreateEvent} style={{ marginBottom: 16, padding: 16, background: 'var(--paper-sunken)', border: '1px solid var(--line)' }}>
                    {eventError && <div className="banner banner-error" style={{ marginBottom: 12 }}>{eventError}</div>}
                    <TextField
                      label="Service label"
                      placeholder="e.g. Mabuza funeral"
                      value={eventLabel}
                      onChange={(e) => setEventLabel(e.target.value)}
                      required
                    />
                    <div className="field">
                      <label htmlFor="event-date">Service date</label>
                      <input
                        id="event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" variant="clay" loading={creatingEvent} fullWidth={false}>
                      Create QR code
                    </Button>
                  </form>
                )}

                {events && events.length === 0 && (
                  <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                    No QR codes yet — create one and print it on the next programme.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {events?.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: '1px solid var(--line-soft)' }}>
                      <QrCode value={ev.signupUrl} size={44} darkColor="#1b241f" lightColor="#fdfbf7" radius={0} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{ev.label}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>
                          {ev.signupsThisMonth} this month · {ev.totalSignups} total
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyLink(ev)}
                        style={{
                          minHeight: 36,
                          padding: '0 13px',
                          border: '1.5px solid var(--line-strong)',
                          background: '#fff',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: 'var(--ink)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {copiedToken === ev.qrToken ? 'Copied!' : 'Copy link'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ ...panelStyle(), padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 16 }}>This month</div>
              {today && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  <MonthStatRow label="Premiums collected" value={formatCurrency(today.monthStats.premiumsCollected)} note={today.monthStats.premiumsNote} />
                  <MonthStatRow label="Members paid up" value={String(today.monthStats.membersPaidUp)} note={today.monthStats.paidUpNote} />
                  <MonthStatRow label="New members" value={String(today.monthStats.newMembers)} note={today.monthStats.newMembersNote} last />
                  <MonthStatRow label="Claims recorded" value={String(today.monthStats.claimsThisMonth)} note={today.monthStats.claimsNote} last />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MonthStatRow({ label, value, note, last }: { label: string; value: string; note: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 14, borderBottom: last ? 'none' : '1px solid var(--line-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 14, color: 'var(--body)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}>{value}</span>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{note}</div>
    </div>
  );
}

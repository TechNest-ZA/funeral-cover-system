import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SignupLayout } from '../../components/SignupLayout';
import { SignupChrome } from '../../components/SignupChrome';
import { QrCode } from '../../components/QrCode';
import { Button } from '../../components/Button';
import { getMemberBook } from '../../api/publicApi';
import { ApiError } from '../../api/client';
import { BRAND_NAME, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '../../config';
import type { MemberBookResponse } from '../../api/types';
import { formatCurrency, formatDate } from '../../utils/format';

export function ConfirmationPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const accessToken = (location.state as { accessToken?: string } | null)?.accessToken;

  const [book, setBook] = useState<MemberBookResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareLabel, setShareLabel] = useState('Save card to my phone');

  useEffect(() => {
    if (!accessToken) {
      navigate(`/join/${memberId}/pay`, { replace: true });
      return;
    }
    getMemberBook(accessToken)
      .then(setBook)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your membership card.'));
  }, [accessToken, memberId, navigate]);

  if (!accessToken) return null;

  const bookUrl = `${window.location.origin}/book/${accessToken}`;

  async function handleSave() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${BRAND_NAME} membership`, text: 'My funeral cover membership card', url: bookUrl });
        return;
      } catch {
        // user cancelled the share sheet - fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(bookUrl);
    setShareLabel('Link copied!');
    setTimeout(() => setShareLabel('Save card to my phone'), 2000);
  }

  return (
    <SignupLayout>
      <SignupChrome />
      <div style={{ padding: '26px 22px 30px' }}>
        {error && (
          <div style={{ background: '#f3ddd7', color: '#8f3a28', padding: '0.9em 1.1em', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        {book && book.status !== 'active' && (
          <div style={{ background: 'var(--paper-sunken)', color: 'var(--body)', padding: '0.9em 1.1em', fontSize: '0.9rem' }}>
            Your payment is still being processed. This page will update once it clears.
          </div>
        )}

        {book && book.status === 'active' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 29, lineHeight: 1.15, fontWeight: 400, margin: '0 0 9px', color: 'var(--ink)' }}>
              You and your family are covered.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 24px' }}>
              Bookmark this page or save the link below — it's the only way back into your account.
            </p>

            <div style={{ background: 'var(--ink)', padding: 24, color: 'var(--on-dark)', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 26 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--on-dark-muted)' }}>
                    Member
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 23, marginTop: 4, color: 'var(--on-dark)' }}>
                    {book.fullName}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--on-dark-body)', marginTop: 3, letterSpacing: '0.04em' }}>
                    {book.memberNumber}
                  </div>
                </div>
                <div style={{ background: 'var(--paper-raised)', padding: 5, display: 'flex' }}>
                  <QrCode value={bookUrl} size={62} darkColor="#1b241f" lightColor="#fdfbf7" radius={0} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--on-dark-muted)' }}>
                  Cash payout to your family
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--on-dark)', marginTop: 4 }}>
                  {formatCurrency(book.coverAmount)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 26, paddingTop: 18, borderTop: '1px solid var(--on-dark-line)' }}>
                <Stat label="Plan" value={book.planName} />
                <Stat label="Covers" value={`${book.dependents.length + 1} ${book.dependents.length === 0 ? 'person' : 'people'}`} />
                <Stat label="Status" value="Active" />
              </div>
            </div>

            {book.dependents.length === 0 && book.planName !== 'Single' && (
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted-warm)', textAlign: 'center', marginTop: -10, marginBottom: 20 }}>
                Your {book.planName} plan already covers your immediate family — add their names below so the parlor has them on hand if they're ever needed.
              </p>
            )}

            <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6, color: 'var(--muted-warm)', textAlign: 'center' }}>
              On this phone? Scanning your own screen won't work — tap your link instead:
              <br />
              <a
                href={`/book/${accessToken}`}
                style={{ color: 'var(--clay)', fontWeight: 700, wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}
              >
                {bookUrl}
              </a>
            </div>

            <div style={{ border: '1px solid var(--line)', background: 'var(--paper-sunken)', padding: 19, marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginBottom: 11 }}>
                What happens now
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  book.nextDueDate
                    ? `Your next payment of ${formatCurrency(book.monthlyPremium)} is due on ${formatDate(book.nextDueDate)}.`
                    : `Your next payment of ${formatCurrency(book.monthlyPremium)} is due next month.`,
                  'Your cover is active from today.',
                  `If someone passes away, phone ${SUPPORT_PHONE_DISPLAY} — any hour, any day.`,
                ].map((line) => (
                  <div key={line} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 14.5, lineHeight: 1.55, color: 'var(--body)' }}>
                    <span style={{ color: 'var(--clay)', fontWeight: 700 }}>—</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="clay-outline" onClick={handleSave} style={{ marginBottom: 10 }}>
              {shareLabel}
            </Button>
            <Button variant="clay-outline" onClick={() => navigate(`/book/${accessToken}`)}>
              {dependentsCtaLabel(book.planName)}
            </Button>

            <p style={{ fontSize: 13, color: 'var(--muted-warm)', marginTop: '1.25rem', textAlign: 'center' }}>
              Emergency line: <a href={`tel:${SUPPORT_PHONE_TEL}`} style={{ color: 'var(--clay)', fontWeight: 700 }}>{SUPPORT_PHONE_DISPLAY}</a>
            </p>
          </>
        )}
      </div>
    </SignupLayout>
  );
}

function dependentsCtaLabel(planName: string) {
  switch (planName) {
    case 'Family':
      return 'Add your spouse and children';
    case 'Extended':
      return 'Add your parents and in-laws';
    default:
      return 'Add a dependant';
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-dark-muted)' }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 3, color: 'var(--on-dark)' }}>{value}</div>
    </div>
  );
}

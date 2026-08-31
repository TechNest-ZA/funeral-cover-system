import { BRAND_NAME } from '../config';
import type { MemberCardResponse } from '../api/types';
import { QrCode } from './QrCode';
import { formatCurrency } from '../utils/format';

function QrPlaceholder() {
  // Decorative fallback for when there's no book link to encode yet.
  const cells = [
    '1110101',
    '1001001',
    '1011101',
    '0000010',
    '1110111',
    '0010001',
    '1011110',
  ];
  const size = 10;
  return (
    <svg width={size * 7 + 12} height={size * 7 + 12} viewBox={`0 0 ${size * 7 + 12} ${size * 7 + 12}`}>
      <rect width="100%" height="100%" fill="#ffffff" rx="6" />
      {cells.map((row, y) =>
        row.split('').map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={6 + x * size} y={6 + y * size} width={size} height={size} fill="#0b3d5c" />
          ) : null
        )
      )}
    </svg>
  );
}

export function MembershipCard({ member, bookUrl }: { member: MemberCardResponse; bookUrl?: string }) {
  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
        color: '#ffffff',
        boxShadow: 'var(--shadow-elevated)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.08em', opacity: 0.75, textTransform: 'uppercase' }}>
            {BRAND_NAME}
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.08em', opacity: 0.6, marginTop: 2 }}>
            Membership Card
          </div>
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.15)',
            padding: '0.25em 0.6em',
            borderRadius: 999,
            letterSpacing: '0.04em',
          }}
        >
          {member.status}
        </span>
      </div>

      <div style={{ marginTop: '1.75rem', fontSize: '1.35rem', fontWeight: 700 }}>{member.fullName}</div>
      <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: 2, letterSpacing: '0.03em' }}>
        {member.memberNumber}
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Cash payout to your family
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 2 }}>{formatCurrency(member.coverAmount)}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.75rem' }}>
        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Plan
          </div>
          <div style={{ fontWeight: 600 }}>{member.planName}</div>
        </div>
        {bookUrl ? <QrCode value={bookUrl} size={82} /> : <QrPlaceholder />}
      </div>
    </div>
  );
}

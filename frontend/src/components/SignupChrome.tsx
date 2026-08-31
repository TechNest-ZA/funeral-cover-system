import { BRAND_NAME, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '../config';

export function SignupChrome() {
  return (
    <div
      style={{
        background: 'var(--ink)',
        padding: '13px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'var(--sand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ink)' }} />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--on-dark)' }}>
          {BRAND_NAME}
        </span>
      </div>
      <a
        href={`tel:${SUPPORT_PHONE_TEL}`}
        style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--sand)', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        {SUPPORT_PHONE_DISPLAY}
      </a>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBook, exportMembersCsv, exportPaymentsPdf } from '../../api/adminApi';
import type { BookFilterValue, BookRow, PageResponse, StandingStatus } from '../../api/types';
import '../../components/ui.css';

const FILTERS: { value: BookFilterValue; label: string }[] = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'behind', label: 'Behind' },
  { value: 'pending', label: 'Pending' },
  { value: 'new_this_month', label: 'New this month' },
  { value: 'from_funeral', label: 'From a funeral' },
  { value: 'deceased', label: 'Deceased' },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(content: string, filename: string) {
  downloadBlob(new Blob([content], { type: 'text/csv;charset=utf-8;' }), filename);
}

function toIsoDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function standingLabel(status: StandingStatus): string {
  return { active: 'Active', pending: 'Pending', behind: 'Behind', deceased: 'Deceased' }[status];
}

export function MembersListPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [data, setData] = useState<PageResponse<BookRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BookFilterValue>('everyone');
  const [page, setPage] = useState(0);

  const [exportingMembers, setExportingMembers] = useState(false);
  const [exportingPayments, setExportingPayments] = useState(false);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      getBook({ search, filter, page })
        .then(setData)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [search, filter, page]);

  async function handleExportAllMembers() {
    setExportingMembers(true);
    try {
      const csv = await exportMembersCsv({});
      downloadCsv(csv, 'members.csv');
    } finally {
      setExportingMembers(false);
    }
  }

  async function handleExportThisMonthPayments() {
    setExportingPayments(true);
    try {
      const now = new Date();
      const from = toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
      const to = toIsoDate(now);
      const pdf = await exportPaymentsPdf({ from, to });
      downloadBlob(pdf, 'payments-this-month.pdf');
    } finally {
      setExportingPayments(false);
    }
  }

  const from = data && data.totalElements > 0 ? data.page * data.size + 1 : 0;
  const to = data ? data.page * data.size + data.content.length : 0;

  return (
    <div style={{ fontFamily: 'var(--font-warm-body)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            The book
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)', margin: '5px 0 0' }}>
            {data ? `${data.totalElements} member${data.totalElements === 1 ? '' : 's'}. ` : ''}
            Type any name or ID number.
          </p>
        </div>
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

      <div style={{ display: 'flex', gap: 11, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or ID number…"
          value={search}
          onChange={(e) => {
            setPage(0);
            setSearch(e.target.value);
          }}
          style={{
            flex: 2,
            minWidth: 260,
            minHeight: 48,
            border: '1.5px solid var(--line-strong)',
            background: '#fff',
            padding: '0 16px',
            fontSize: 16,
            color: 'var(--ink)',
            fontFamily: 'var(--font-warm-body)',
          }}
        />
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setPage(0);
                  setFilter(f.value);
                }}
                style={{
                  minHeight: 48,
                  padding: '0 16px',
                  border: `1.5px solid ${active ? 'var(--ink)' : 'var(--line-strong)'}`,
                  background: active ? 'var(--ink)' : '#fff',
                  color: active ? 'var(--on-dark)' : 'var(--ink)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-warm-body)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ border: '1px solid var(--line)', background: 'var(--paper-raised)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--paper-sunken)' }}>
                {['Member', 'ID number', 'Plan', 'Standing', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'var(--muted-2)',
                      borderBottom: '1px solid var(--line)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && data?.content.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted)' }}>
                    No members found.
                  </td>
                </tr>
              )}
              {!loading &&
                data?.content.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{m.fullName}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{m.coversLabel}</div>
                    </td>
                    <td style={{ padding: '15px 20px', fontFamily: 'var(--font-mono)', fontSize: 13.5, color: 'var(--body)' }}>
                      {m.idNumber}
                    </td>
                    <td style={{ padding: '15px 20px', fontSize: 14, color: 'var(--body)' }}>{m.planName}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          background: `var(--status-${m.standingStatus}-bg)`,
                          color: `var(--status-${m.standingStatus}-fg)`,
                        }}
                      >
                        {standingLabel(m.standingStatus)}
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{m.standingDetail}</div>
                    </td>
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <Link to={`/admin/members/${m.id}`} style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--clay)', whiteSpace: 'nowrap' }}>
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && (
          <div style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>
              {data.totalElements === 0 ? 'No members' : `Showing ${from}–${to} of ${data.totalElements}`}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  minHeight: 40,
                  padding: '0 15px',
                  border: '1.5px solid var(--line)',
                  background: '#fff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: page === 0 ? 'var(--line-faint)' : 'var(--ink)',
                  cursor: page === 0 ? 'default' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={data.page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  minHeight: 40,
                  padding: '0 15px',
                  border: '1.5px solid var(--line-strong)',
                  background: '#fff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: data.page >= data.totalPages - 1 ? 'var(--line-faint)' : 'var(--ink)',
                  cursor: data.page >= data.totalPages - 1 ? 'default' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <div
          style={{
            marginTop: 18,
            border: '1px solid var(--line)',
            background: 'var(--paper-sunken)',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--body)' }}>
            Give your accountant the whole book, or just this month's payments.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleExportAllMembers}
              disabled={exportingMembers}
              style={{
                minHeight: 42,
                padding: '0 16px',
                border: '1.5px solid var(--line-strong)',
                background: '#fff',
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--ink)',
                cursor: exportingMembers ? 'default' : 'pointer',
              }}
            >
              {exportingMembers ? 'Exporting…' : 'All members · CSV'}
            </button>
            <button
              type="button"
              onClick={handleExportThisMonthPayments}
              disabled={exportingPayments}
              style={{
                minHeight: 42,
                padding: '0 16px',
                border: '1.5px solid var(--line-strong)',
                background: '#fff',
                fontSize: 13.5,
                fontWeight: 700,
                color: 'var(--ink)',
                cursor: exportingPayments ? 'default' : 'pointer',
              }}
            >
              {exportingPayments ? 'Exporting…' : "This month's payments · PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

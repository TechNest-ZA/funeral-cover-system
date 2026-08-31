import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SignupLayout } from '../../components/SignupLayout';
import { SignupChrome } from '../../components/SignupChrome';
import { SignupProgress } from '../../components/SignupProgress';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { signupMember } from '../../api/publicApi';
import { ApiError } from '../../api/client';
import { checkSaId, formatDateOfBirth } from '../../utils/saId';

export function DetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { planId?: number; sourceCode?: string } | null;
  const planId = state?.planId;
  const sourceCode = state?.sourceCode;

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [beneficiaryIdNumber, setBeneficiaryIdNumber] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!planId) navigate('/join', { replace: true });
  }, [planId, navigate]);

  const idCheck = idNumber.length === 13 ? checkSaId(idNumber) : null;
  const idHint =
    idNumber.length === 13
      ? idCheck?.valid
        ? `✓ Checks out — born ${formatDateOfBirth(idCheck.dateOfBirth!)}`
        : "That doesn't look like a valid SA ID number"
      : 'As it appears on your ID';

  const beneficiaryIdCheck = beneficiaryIdNumber.length === 13 ? checkSaId(beneficiaryIdNumber) : null;
  const beneficiaryIdHint =
    beneficiaryIdNumber.length === 13
      ? beneficiaryIdCheck?.valid
        ? `✓ Checks out — born ${formatDateOfBirth(beneficiaryIdCheck.dateOfBirth!)}`
        : "That doesn't look like a valid SA ID number"
      : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!planId) return;

    setSubmitting(true);
    try {
      const result = await signupMember({
        fullName,
        idNumber,
        phone,
        beneficiaryName,
        beneficiaryRelationship,
        beneficiaryPhone,
        beneficiaryIdNumber: beneficiaryIdNumber || undefined,
        planId,
        sourceCode,
      });
      navigate(`/join/${result.id}/pay`, { state: { accessToken: result.accessToken } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        setFormError(err.fieldErrors ? null : err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SignupLayout>
      <SignupChrome />
      <SignupProgress step={2} />
      <div className="warm-fields" style={{ padding: '26px 22px 30px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.18, fontWeight: 400, margin: '0 0 9px', color: 'var(--ink)' }}>
          Tell us who you are
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--body)', margin: '0 0 24px' }}>
          Six things. We use your ID number to confirm your details are correct.
        </p>

        {formError && (
          <div style={{ background: '#f3ddd7', color: '#8f3a28', padding: '0.9em 1.1em', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Your full name"
            placeholder="e.g. Thandiwe Nkosi"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
            hint="As it appears on your ID"
            autoComplete="name"
            required
          />
          <TextField
            label="Your ID number"
            placeholder="13-digit SA ID number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
            error={fieldErrors.idNumber}
            hint={idHint}
            success={idCheck?.valid}
            inputMode="numeric"
            required
          />
          <TextField
            label="Your phone number"
            placeholder="e.g. 0821234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={fieldErrors.phone}
            hint="We'll send your card and reminders here on WhatsApp"
            inputMode="tel"
            autoComplete="tel"
            required
          />
          <div style={{ marginTop: 6, marginBottom: 16, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 400, margin: '0 0 6px', color: 'var(--ink)' }}>
              Who should we deal with, and who receives the payout?
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
              One person, usually the eldest child or the spouse. We phone them first, and the cash goes to them.
              You can change this any time with a phone call.
            </p>
          </div>
          <TextField
            label="Their full name"
            placeholder="e.g. Sipho Nkosi"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            error={fieldErrors.beneficiaryName}
            required
          />
          <TextField
            label="Their relationship to you"
            placeholder="e.g. Brother, spouse, daughter"
            value={beneficiaryRelationship}
            onChange={(e) => setBeneficiaryRelationship(e.target.value)}
            error={fieldErrors.beneficiaryRelationship}
            required
          />
          <TextField
            label="Their phone number"
            placeholder="e.g. 0821234567"
            value={beneficiaryPhone}
            onChange={(e) => setBeneficiaryPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={fieldErrors.beneficiaryPhone}
            inputMode="tel"
            required
          />
          <TextField
            label="Their ID number (optional)"
            placeholder="13-digit SA ID number"
            value={beneficiaryIdNumber}
            onChange={(e) => setBeneficiaryIdNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
            error={fieldErrors.beneficiaryIdNumber}
            hint={beneficiaryIdHint}
            success={beneficiaryIdCheck?.valid}
            inputMode="numeric"
          />

          <Button type="submit" variant="clay" loading={submitting} style={{ marginTop: 5 }}>
            Continue to payment
          </Button>
          <div style={{ marginTop: 15, paddingTop: 15, borderTop: '1px solid var(--line)', fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>
            We never share your details with anyone. We will not phone you to sell you something else.
          </div>
        </form>
      </div>
    </SignupLayout>
  );
}

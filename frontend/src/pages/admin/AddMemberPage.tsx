import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { createMember } from '../../api/adminApi';
import { listPlans } from '../../api/publicApi';
import { ApiError } from '../../api/client';
import type { Plan } from '../../api/types';
import { formatCurrency } from '../../utils/format';
import { checkSaId, formatDateOfBirth } from '../../utils/saId';
import '../../components/ui.css';

export function AddMemberPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);

  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [beneficiaryIdNumber, setBeneficiaryIdNumber] = useState('');
  const [email, setEmail] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listPlans().then((data) => {
      setPlans(data);
      if (data.length > 0) setPlanId(data[0].id);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (!planId) {
      setFormError('Please select a plan.');
      return;
    }

    setSubmitting(true);
    try {
      const member = await createMember({
        fullName,
        idNumber,
        phone,
        beneficiaryName,
        beneficiaryRelationship,
        beneficiaryPhone,
        beneficiaryIdNumber: beneficiaryIdNumber || undefined,
        email: email || undefined,
        planId,
      });
      navigate(`/admin/members/${member.id}`);
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
    <div>
      <Link to="/admin/members" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
        ← Back to members
      </Link>

      <h1 style={{ fontSize: '1.5rem', margin: '1rem 0 1.25rem' }}>Add a member</h1>

      {formError && <div className="banner banner-error">{formError}</div>}

      <Card style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={fieldErrors.fullName}
            autoComplete="name"
            required
          />
          <TextField
            label="ID number"
            placeholder="13-digit SA ID number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
            error={fieldErrors.idNumber}
            hint={
              idNumber.length === 13
                ? checkSaId(idNumber).valid
                  ? `✓ Checks out — born ${formatDateOfBirth(checkSaId(idNumber).dateOfBirth!)}`
                  : "That doesn't look like a valid SA ID number"
                : undefined
            }
            success={idNumber.length === 13 && checkSaId(idNumber).valid}
            inputMode="numeric"
            required
          />
          <TextField
            label="Phone number"
            placeholder="e.g. 0821234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={fieldErrors.phone}
            inputMode="tel"
            required
          />
          <TextField
            label="Who should we deal with, and who receives the payout?"
            placeholder="e.g. Sipho Nkosi"
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            error={fieldErrors.beneficiaryName}
            hint="One person, usually the eldest child or the spouse"
            required
          />
          <TextField
            label="Their relationship to the member"
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
            hint={
              beneficiaryIdNumber.length === 13
                ? checkSaId(beneficiaryIdNumber).valid
                  ? `✓ Checks out — born ${formatDateOfBirth(checkSaId(beneficiaryIdNumber).dateOfBirth!)}`
                  : "That doesn't look like a valid SA ID number"
                : undefined
            }
            success={beneficiaryIdNumber.length === 13 && checkSaId(beneficiaryIdNumber).valid}
            inputMode="numeric"
          />
          <TextField
            label="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            type="email"
          />

          <div className="field">
            <label htmlFor="plan-select">Plan</label>
            <select
              id="plan-select"
              value={planId ?? ''}
              onChange={(e) => setPlanId(Number(e.target.value))}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {formatCurrency(plan.monthlyPremium)}/mo
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" loading={submitting}>
            Add member
          </Button>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            They'll be added as pending — record their cash payment on the next screen to activate cover.
          </p>
        </form>
      </Card>
    </div>
  );
}

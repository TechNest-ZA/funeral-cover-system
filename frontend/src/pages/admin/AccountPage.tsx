import { useState, type FormEvent } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/adminApi';
import { ApiError } from '../../api/client';
import '../../components/ui.css';

export function AccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "New passwords don't match" });
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        else setError(err.message);
      } else {
        setError('Could not change the password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', margin: '0 0 1.5rem' }}>Your account</h1>

      <Card style={{ maxWidth: 420 }}>
        <h2 style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: '0.9rem' }}>
          Signed in as <strong style={{ color: 'var(--color-text)' }}>{user?.username}</strong>
        </h2>

        {success && <div className="banner banner-info">Password changed.</div>}
        {error && <div className="banner banner-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={fieldErrors.currentPassword}
            autoComplete="current-password"
            required
          />
          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={fieldErrors.newPassword}
            hint="At least 8 characters"
            autoComplete="new-password"
            required
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            required
          />
          <Button type="submit" loading={submitting}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}

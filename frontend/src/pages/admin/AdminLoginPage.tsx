import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { TextField } from '../../components/TextField';
import { Button } from '../../components/Button';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';

export function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background:
          'radial-gradient(circle at 50% -10%, var(--color-primary-light) 0%, var(--color-bg) 45%)',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <Logo size="lg" />
      </div>
      <Card style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Staff sign in</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          For parlor staff and administrators only.
        </p>
        {error && <div className="banner banner-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" loading={submitting}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}

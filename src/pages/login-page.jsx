// src/pages/login-page.jsx
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/button';
import Card from '../components/common/card';
import ErrorMessage from '../components/common/error-message';
import InputField from '../components/common/input-field';
import LoadingSpinner from '../components/common/loading-spinner';
import { APP_NAME, ROUTES } from '../config/constants';
import { useAuth } from '../hooks/use-auth';
import { bootstrapProfile } from '../services/auth-api-service';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(searchParams.get('message') || '');

  const loginAction = auth?.login || auth?.signIn || auth?.signInWithEmail;
  const resetPasswordAction = auth?.resetPassword || auth?.sendPasswordReset;

  function nextRoute() {
    const next = searchParams.get('next');
    return next && next.startsWith('/') && !next.startsWith('//') ? next : ROUTES.agents;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (!loginAction) {
        throw new Error('Login method is unavailable.');
      }

      await loginAction(email.trim(), password);
      await bootstrapProfile([]).catch(() => null);
      navigate(nextRoute(), { replace: true });
    } catch (loginError) {
      console.error('[LoginPage] handleLogin failed:', loginError);
      setError(loginError.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    setResetLoading(true);
    setError('');
    setNotice('');

    try {
      if (!resetPasswordAction) {
        throw new Error('Password reset is unavailable.');
      }

      if (!email.trim()) {
        throw new Error('Enter your email first, then request a reset link.');
      }

      await resetPasswordAction(email.trim());
      setNotice('Password reset email sent. Check your inbox, then log in here.');
    } catch (resetError) {
      console.error('[LoginPage] handlePasswordReset failed:', resetError);
      setError(resetError.message || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl border border-card-border bg-bg-navy/70 p-4 backdrop-blur md:p-8">
        <div className="mb-6 flex justify-center">
          <img src="/assets/logo.png" alt={APP_NAME} className="h-16 w-auto max-w-[240px] object-contain" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="h-full p-6" title="Welcome back" subtitle="Log in to launch, monitor, and optimize your AI workflows.">
            <form className="space-y-3" onSubmit={handleLogin}>
              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
              />

              {notice ? <div className="rounded-xl border border-mint/25 bg-mint/10 p-3 text-sm text-mint">{notice}</div> : null}
              {error ? <ErrorMessage message={error} /> : null}

              <Button type="submit" loading={loading} className="w-full">
                Log In
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-mint underline disabled:cursor-not-allowed disabled:text-text-muted"
                disabled={resetLoading}
                onClick={handlePasswordReset}
              >
                {resetLoading ? 'Sending reset email...' : 'Forgot password? Send reset email'}
              </button>
            </form>

            <p className="mt-4 text-sm text-text-dim">
              New here?{' '}
              <Link className="text-yellow underline" to={ROUTES.signup}>
                Create an account
              </Link>
            </p>
          </Card>

          <Card className="h-full p-6" title="Agentix AI - How To Signup" subtitle="Next level auto-marketing AI agents">
            {loading ? <LoadingSpinner label="Verifying session..." /> : null}
            <ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-text-dim">
              <li>Create an account to get started.</li>
              <li>Did you upgrade to "Unlimited" or "DFY"?</li>
              <li>If so, use Secret Signup below.</li>
              <li>Then, signup with the CODES on the members pages.</li>
              <li>If you forget, you can enter these later on SETTINGS.</li>
            </ul>
            <Link
              className="mt-5 block rounded-lg border border-mint/30 bg-mint/10 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.06em] text-mint hover:bg-mint/20 hover:text-white"
              to={ROUTES.secretSignup}
            >
              Secret Signup For Unlimited + DFY Customers
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

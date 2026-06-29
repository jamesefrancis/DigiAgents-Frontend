// src/pages/signup-page.jsx
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

const EMAIL_PARAM_KEYS = [
  'email',
  'awf_email',
  'subscriber_email',
  'customer_email',
  'buyer_email',
  'ccustemail',
  'cemail'
];

function isEmailAlreadyInUse(error) {
  return error?.code === 'auth/email-already-in-use'
    || String(error?.message || '').includes('email-already-in-use')
    || String(error?.message || '').toLowerCase().includes('email already in use');
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function emailFromSearchParams(searchParams) {
  for (const key of EMAIL_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (looksLikeEmail(value)) {
      return value.trim();
    }
  }

  for (const value of searchParams.values()) {
    const trimmed = String(value || '').trim();
    if (looksLikeEmail(trimmed)) {
      return trimmed;
    }
  }

  return '';
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  const [form, setForm] = useState(() => ({
    email: emailFromSearchParams(searchParams),
    password: '',
    confirmPassword: ''
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountExists, setAccountExists] = useState(false);

  const signupAction = auth?.signup || auth?.register || auth?.createAccount;

  async function handleSignup(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setAccountExists(false);

    try {
      if (!signupAction) {
        throw new Error('Signup method is unavailable.');
      }

      if (form.password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (form.password !== form.confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      await signupAction(form.email.trim(), form.password);
      await bootstrapProfile([]).catch(() => null);
      navigate(ROUTES.settings, { replace: true });
    } catch (signupError) {
      console.error('[SignupPage] handleSignup failed:', signupError);
      if (isEmailAlreadyInUse(signupError)) {
        setAccountExists(true);
        setError('Your account may already have been created from your purchase. Please use the Login page and click Forgot Password to set your password.');
      } else {
        setError(signupError.message || 'Signup failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl rounded-3xl border border-card-border bg-bg-navy/70 p-4 backdrop-blur md:p-8">
        <div className="mb-6 flex justify-center">
          <img src="/assets/logo.png" alt={APP_NAME} className="h-16 w-auto max-w-[240px] object-contain" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="h-full p-6" title="Create your workspace" subtitle="Start building repeatable agent workflows in minutes.">
            <form className="space-y-3" onSubmit={handleSignup}>
              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@company.com"
                required
              />
              <InputField
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="At least 6 characters"
                required
              />
              <InputField
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
              />

              {error ? <ErrorMessage message={error} /> : null}

              {accountExists ? (
                <Link
                  className="block rounded-lg border border-mint/30 bg-mint/10 px-4 py-3 text-center text-sm font-semibold text-mint hover:bg-mint/20 hover:text-white"
                  to={ROUTES.login}
                >
                  Go to Login and use Forgot Password
                </Link>
              ) : null}

              <Button type="submit" loading={loading} className="w-full">
                Create Account
              </Button>
            </form>

            <p className="mt-4 text-sm text-text-dim">
              Already have an account?{' '}
              <Link className="text-yellow underline" to={ROUTES.login}>
                Log in
              </Link>
            </p>
          </Card>

          <Card className="h-full p-6" title="What happens next" subtitle="You will be guided through setup after signup.">
            {loading ? <LoadingSpinner label="Creating account..." /> : null}
            <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm text-text-dim">
              <li>Account profile and tier are bootstrapped.</li>
              <li>Add provider API keys in Settings.</li>
              <li>Run your first test block from Agents.</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

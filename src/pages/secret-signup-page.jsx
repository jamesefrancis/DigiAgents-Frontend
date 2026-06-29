// src/pages/secret-signup-page.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/common/button';
import Card from '../components/common/card';
import ErrorMessage from '../components/common/error-message';
import InputField from '../components/common/input-field';
import { APP_NAME, ROUTES } from '../config/constants';
import { useAuth } from '../hooks/use-auth';
import { applyActivationCode, bootstrapProfile } from '../services/auth-api-service';

function parseCodeList(value) {
  return String(value || '')
    .split(/[+,\s]/g)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseCodes(rawSearch) {
  const searchParams = new URLSearchParams(rawSearch || '');
  const values = [searchParams.get('activate'), searchParams.get('code')].filter(Boolean);
  return values.flatMap((value) => parseCodeList(value));
}

function dedupeCodes(codes) {
  return Array.from(new Set(codes.filter(Boolean)));
}

function isEmailAlreadyInUse(error) {
  return error?.code === 'auth/email-already-in-use'
    || String(error?.message || '').includes('email-already-in-use')
    || String(error?.message || '').toLowerCase().includes('email already in use');
}

async function applyCodes(codes) {
  let profile = null;
  for (const code of codes) {
    profile = await applyActivationCode(code);
  }
  return profile;
}

export default function SecretSignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const autoAppliedRef = useRef(false);

  const codesFromQuery = useMemo(() => parseCodes(location.search), [location.search]);
  const returnToSecretSignup = `${location.pathname}${location.search}`;
  const loginWithReturn = `${ROUTES.login}?next=${encodeURIComponent(returnToSecretSignup)}&message=${encodeURIComponent('Log in to apply your upgrade code.')}`;

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    unlimitedCode: '',
    dfyCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [accountExists, setAccountExists] = useState(false);

  const signupAction = auth?.signup || auth?.register || auth?.createAccount;
  const activationCodes = useMemo(
    () => dedupeCodes([
      ...codesFromQuery,
      ...parseCodeList(form.unlimitedCode),
      ...parseCodeList(form.dfyCode)
    ]),
    [codesFromQuery, form.unlimitedCode, form.dfyCode]
  );

  async function handleApplyCodes(codes = activationCodes) {
    setApplying(true);
    setError('');
    setNotice('');

    try {
      if (!codes.length) {
        throw new Error('Enter at least one activation code.');
      }
      await applyCodes(codes);
      setNotice(`Applied upgrade code${codes.length > 1 ? 's' : ''}: ${codes.join(', ')}`);
    } catch (applyError) {
      console.error('[SecretSignupPage] handleApplyCodes failed:', applyError);
      setError(applyError.message || 'Could not apply activation code.');
    } finally {
      setApplying(false);
    }
  }

  useEffect(() => {
    if (!auth?.isAuthenticated || autoAppliedRef.current || !codesFromQuery.length) {
      return;
    }

    autoAppliedRef.current = true;
    handleApplyCodes(dedupeCodes(codesFromQuery));
  }, [auth?.isAuthenticated, codesFromQuery]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
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
      await bootstrapProfile(activationCodes);
      navigate(ROUTES.settings, { replace: true });
    } catch (submitError) {
      console.error('[SecretSignupPage] handleSubmit failed:', submitError);
      if (isEmailAlreadyInUse(submitError)) {
        setAccountExists(true);
        setError('This email already has an Agentix account. Log in and this page will apply the upgrade code to that existing account.');
      } else {
        setError(submitError.message || 'Secret signup failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  const codesDetectedText = codesFromQuery.length
    ? codesFromQuery.join(', ')
    : 'none. Please add them below and signup to activate your upsells';

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-card-border bg-bg-navy/70 p-4 backdrop-blur md:p-8">
        <div className="mb-6 flex justify-center">
          <img src="/assets/logo.png" alt={APP_NAME} className="h-16 w-auto max-w-[240px] object-contain" />
        </div>
        <Card
          className="p-6"
          title="Secret Signup"
          subtitle={'Create account and apply any Unlimited or DFY activation codes. If you signup to the upsells later, you can add the codes on the "Settings" page inside the app.'}
        >
          <div className="mb-4 rounded-xl border border-mint/25 bg-mint/10 p-3 text-sm text-mint">
            Codes detected: {codesDetectedText}
          </div>

          {notice ? <div className="mb-4 rounded-xl border border-mint/25 bg-mint/10 p-3 text-sm text-mint">{notice}</div> : null}
          {error ? <ErrorMessage message={error} /> : null}

          {auth?.isAuthenticated ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Unlimited Code"
                  value={form.unlimitedCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, unlimitedCode: event.target.value }))}
                  placeholder="From your Unlimited members page"
                />
                <InputField
                  label="DFY Code"
                  value={form.dfyCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, dfyCode: event.target.value }))}
                  placeholder="From your DFY members page"
                />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-text-dim">
                Codes to apply: {activationCodes.length ? activationCodes.join(', ') : 'none yet'}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Link className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-dim hover:text-white" to={ROUTES.settings}>
                  Settings
                </Link>
                <Button type="button" loading={applying} onClick={() => handleApplyCodes()}>
                  Apply Codes
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <InputField
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
              <InputField
                label="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
              <InputField
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Unlimited Code"
                  value={form.unlimitedCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, unlimitedCode: event.target.value }))}
                  placeholder="From your Unlimited members page"
                />
                <InputField
                  label="DFY Code"
                  value={form.dfyCode}
                  onChange={(event) => setForm((prev) => ({ ...prev, dfyCode: event.target.value }))}
                  placeholder="From your DFY members page"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-text-dim">
                Codes to apply: {activationCodes.length ? activationCodes.join(', ') : 'none yet'}
              </div>

              {accountExists ? (
                <Link
                  className="block rounded-lg border border-mint/30 bg-mint/10 px-4 py-3 text-center text-sm font-semibold text-mint hover:bg-mint/20 hover:text-white"
                  to={loginWithReturn}
                >
                  Log in to apply these codes
                </Link>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                <Link className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-dim hover:text-white" to={ROUTES.signup}>
                  Standard Signup
                </Link>
                <Link className="rounded-lg border border-white/15 px-4 py-2 text-sm text-text-dim hover:text-white" to={loginWithReturn}>
                  Log In To Apply Code
                </Link>
                <Button type="submit" loading={loading}>
                  Create & Activate
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

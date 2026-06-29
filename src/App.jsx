// filepath: frontend/src/App.jsx 
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/navbar';
import { ROUTES } from './config/constants';
import { useAuth } from './hooks/use-auth';
import { useAppBootstrap } from './hooks/use-app-bootstrap';
import AdminPage from './pages/admin-page';
import AgentsPage from './pages/agents-page';
import ChainsPage from './pages/chains-page';
import LoginPage from './pages/login-page';
import RunsPage from './pages/runs-page';
import SecretSignupPage from './pages/secret-signup-page';
import SettingsPage from './pages/settings-page';
import SignupPage from './pages/signup-page';

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-content">{children}</div>
    </div>
  );
}

function AccountDisabledPage() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-fuchsia/35 bg-fuchsia/10 p-6 text-text-dim">
      <h1 className="text-3xl text-white">Account access disabled</h1>
      <p className="mt-3">
        Base Agentix access is currently disabled for this account. If this looks wrong, contact support with your
        purchase email and JVZoo receipt so we can check the transaction log.
      </p>
    </div>
  );
}

function ProtectedPage({ children, accountDisabled = false, allowDisabled = false }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="app-loader">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (accountDisabled && !allowDisabled) {
    return (
      <AppShell>
        <AccountDisabledPage />
      </AppShell>
    );
  }

  return children;
}

export default function App() {
  const { bootstrapping, bootstrapError, accountDisabled } = useAppBootstrap();

  return (
    <>
      {bootstrapping ? <div className="app-bootstrap-banner">Syncing profile...</div> : null}
      {bootstrapError ? <div className="app-bootstrap-banner error">{bootstrapError}</div> : null}

      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signup} element={<SignupPage />} />
        <Route path={ROUTES.secretSignup} element={<SecretSignupPage />} />

        <Route
          path={ROUTES.agents}
          element={
            <ProtectedPage accountDisabled={accountDisabled}>
              <AppShell>
                <AgentsPage />
              </AppShell>
            </ProtectedPage>
          }
        />
        <Route
          path={ROUTES.chains}
          element={
            <ProtectedPage accountDisabled={accountDisabled}>
              <AppShell>
                <ChainsPage />
              </AppShell>
            </ProtectedPage>
          }
        />
        <Route
          path={ROUTES.runs}
          element={
            <ProtectedPage accountDisabled={accountDisabled}>
              <AppShell>
                <RunsPage />
              </AppShell>
            </ProtectedPage>
          }
        />
        <Route
          path={ROUTES.settings}
          element={
            <ProtectedPage accountDisabled={accountDisabled}>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </ProtectedPage>
          }
        />
        <Route
          path={ROUTES.adminzoo}
          element={
            <ProtectedPage accountDisabled={accountDisabled} allowDisabled>
              <AppShell>
                <AdminPage />
              </AppShell>
            </ProtectedPage>
          }
        />

        <Route path={ROUTES.dashboard} element={<Navigate to={ROUTES.agents} replace />} />
        <Route path={ROUTES.root} element={<Navigate to={ROUTES.agents} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.root} replace />} />
      </Routes>
    </>
  );
}

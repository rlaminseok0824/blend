'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ApiException, apiClient, authApi } from '@/shared/api';
import { useAuth } from '@/domain/auth/providers/auth-provider';
import type { UserResponse } from '@/shared/types/api';

const GOBLOX_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'https://tteokyi.com';

interface ResumeStatus {
  revision: string;
  schema_version: number;
  counts: {
    experience: number;
    projects: number;
    skill_groups: number;
    skills: number;
    links: number;
  };
  pdfs: Array<{
    locale: 'ko' | 'en';
    state: 'ready' | 'missing' | 'stale';
    expected_revision: string;
    recorded_revision?: string;
    download_url: string;
    size?: number;
    modified_at?: string;
  }>;
}

const metricLabels: Array<[keyof ResumeStatus['counts'], string]> = [
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['skill_groups', 'Skill groups'],
  ['skills', 'Skills'],
  ['links', 'Links'],
];

function absoluteGobloxURL(path: string) {
  if (!path.startsWith('/api/v1/resume/pdf/')) return '#';
  return new URL(path, GOBLOX_ORIGIN).toString();
}

function LoginForm({ onLoggedIn }: { onLoggedIn: (user: UserResponse) => Promise<void> }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const user = await apiClient<UserResponse>('/api/v1/user/me');
      await onLoggedIn(user);
    } catch (caught) {
      setError(caught instanceof ApiException ? '로그인에 실패했습니다.' : '네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-line mx-auto mt-16 max-w-md border p-6" data-testid="admin-login">
      <p className="text-gray-foreground font-mono text-xs">GOBLOX ADMIN</p>
      <h1 className="text-foreground mt-2 text-2xl font-medium">Sign in to continue</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="text-gray-foreground block font-mono text-xs">
          Email
          <input
            className="border-line bg-background text-foreground mt-2 block w-full border px-3 py-2"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="text-gray-foreground block font-mono text-xs">
          Password
          <input
            className="border-line bg-background text-foreground mt-2 block w-full border px-3 py-2"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          className="bg-foreground text-background w-full px-4 py-2 font-mono text-sm disabled:opacity-50"
          disabled={submitting}
          type="submit"
        >
          {submitting ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
    </section>
  );
}

function AdminDashboard({ user }: { user: UserResponse }) {
  const [status, setStatus] = useState<ResumeStatus | null>(null);
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await apiClient<ResumeStatus>('/api/v1/admin/resume/status'));
    } catch (caught) {
      setError(
        caught instanceof ApiException && caught.code === 5004
          ? '관리자 권한이 필요합니다.'
          : '상태를 불러오지 못했습니다.',
      );
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadStatus);
  }, [loadStatus]);

  if (error) {
    return (
      <section className="mx-auto mt-16 max-w-3xl p-6" data-testid="admin-forbidden">
        <p className="text-red-600" role="alert">
          {error}
        </p>
      </section>
    );
  }
  if (!status)
    return (
      <p className="mx-auto mt-16 max-w-3xl p-6" data-testid="admin-loading">
        Loading...
      </p>
    );

  const previewURL = `https://tteokyi.com/?lang=${locale}`;
  return (
    <section className="mx-auto max-w-7xl px-6 py-12" data-testid="admin-dashboard">
      <header className="border-line flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-gray-foreground font-mono text-xs">READ-ONLY ADMIN</p>
          <h1 className="text-3xl">Resume status</h1>
        </div>
        <p className="text-gray-foreground font-mono text-xs">{user.email}</p>
      </header>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="border-line border p-4">
          <span className="text-gray-foreground text-xs">Revision</span>
          <strong className="mt-2 block text-xl">{status.revision}</strong>
        </div>
        <div className="border-line border p-4">
          <span className="text-gray-foreground text-xs">Schema</span>
          <strong className="mt-2 block text-xl">{status.schema_version}</strong>
        </div>
        {metricLabels.map(([key, label]) => (
          <div className="border-line border p-4" key={key}>
            <span className="text-gray-foreground text-xs">{label}</span>
            <strong className="mt-2 block text-xl">{status.counts[key]}</strong>
          </div>
        ))}
      </div>
      <section className="border-line mt-8 border p-6">
        <h2 className="text-xl">PDF readiness</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {status.pdfs.map((pdf) => (
            <article className="border-line border p-4" key={pdf.locale}>
              <h3 className="font-mono">{pdf.locale.toUpperCase()}</h3>
              <p className="mt-2 font-mono uppercase">{pdf.state}</p>
              <p className="text-gray-foreground mt-2 text-sm">Expected: {pdf.expected_revision}</p>
              {pdf.recorded_revision && (
                <p className="text-gray-foreground text-sm">Recorded: {pdf.recorded_revision}</p>
              )}
              <a className="mt-4 inline-block underline" href={absoluteGobloxURL(pdf.download_url)}>
                Download PDF
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="border-line mt-8 border p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">Public preview</h2>
          <a href={previewURL} target="_blank" rel="noreferrer" className="underline">
            Open in new tab
          </a>
        </div>
        <div className="mt-4 flex gap-2" role="group" aria-label="Preview language">
          {(['ko', 'en'] as const).map((value) => (
            <button
              className="border-line border px-3 py-2 font-mono text-sm"
              aria-pressed={locale === value}
              key={value}
              onClick={() => setLocale(value)}
              type="button"
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
        <iframe
          className="border-line mt-4 h-[620px] w-full border"
          title="Goblox public portfolio preview"
          src={previewURL}
        />
      </section>
    </section>
  );
}

export default function AdminPage() {
  const { isLoading } = useAuth();
  const [verifiedUser, setVerifiedUser] = useState<UserResponse | null>(null);
  const [verificationError, setVerificationError] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    authApi
      .getMe()
      .then(setVerifiedUser)
      .catch(() => setVerificationError(true));
  }, [isLoading]);

  if (isLoading) return <p className="mx-auto mt-16 max-w-3xl p-6">Loading...</p>;
  // A failed /user/me check invalidates any cached localStorage identity.
  if (verificationError || !verifiedUser) {
    return (
      <LoginForm
        onLoggedIn={async (next) => {
          setVerificationError(false);
          setVerifiedUser(next);
        }}
      />
    );
  }
  if (!verifiedUser.is_admin)
    return (
      <section className="mx-auto mt-16 max-w-3xl p-6" data-testid="admin-forbidden">
        <h1 className="text-2xl">Forbidden</h1>
        <p className="mt-2">Administrator access is required.</p>
      </section>
    );
  return <AdminDashboard user={verifiedUser} />;
}

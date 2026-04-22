import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { JSX } from 'react';

const BECU_MEMBER_ID_COOKIE = 'becu_memberid';

function readBrowserCookie(name: string): string | undefined {
  const escaped = name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1');
  const match = typeof document !== 'undefined' && document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setMemberIdCookie(value: string): void {
  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${BECU_MEMBER_ID_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearMemberIdCookie(): void {
  document.cookie = `${BECU_MEMBER_ID_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * Testing-only simulated login. Sets / clears `becu_memberid` for local CDP identity flows.
 * Not part of Sitecore routing; visit `/simulated-login` (default locale, no prefix).
 */
export default function SimulatedLoginPage(): JSX.Element {
  const [hydrated, setHydrated] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [inputValue, setInputValue] = useState('');

  const syncFromCookie = useCallback(() => {
    const raw = readBrowserCookie(BECU_MEMBER_ID_COOKIE);
    const trimmed = raw?.trim() ?? '';
    setMemberId(trimmed);
  }, []);

  useEffect(() => {
    syncFromCookie();
    setHydrated(true);
  }, [syncFromCookie]);

  const handleLogin = (): void => {
    const id = inputValue.trim();
    if (!id) {
      return;
    }
    setMemberIdCookie(id);
    syncFromCookie();
  };

  const handleLogout = (): void => {
    clearMemberIdCookie();
    setInputValue('');
    syncFromCookie();
  };

  const isLoggedIn = memberId.length > 0;

  return (
    <>
      <Head>
        <title>Simulated login (testing)</title>
      </Head>
      <main style={{ padding: '1.5rem', fontFamily: 'system-ui, sans-serif', maxWidth: 480 }}>
        <h1 style={{ fontSize: '1.25rem' }}>Simulated login (testing)</h1>
        {!hydrated ? (
          <p>Loading…</p>
        ) : !isLoggedIn ? (
          <>
            <p style={{ color: '#555', fontSize: '0.875rem' }}>
              No <code>becu_memberid</code> cookie or value is blank.
            </p>
            <div style={{ marginTop: '1rem' }}>
              <label htmlFor="simulated-member-id" style={{ display: 'block', marginBottom: 4 }}>
                Member ID
              </label>
              <input
                id="simulated-member-id"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoComplete="off"
                style={{ width: '100%', maxWidth: 320, padding: '0.5rem' }}
              />
            </div>
            <button type="button" onClick={handleLogin} style={{ marginTop: '0.75rem' }}>
              Login
            </button>
          </>
        ) : (
          <>
            <p style={{ marginTop: '1rem' }}>
              User is known as: {memberId}
            </p>
            <button type="button" onClick={handleLogout} style={{ marginTop: '0.75rem' }}>
              Logout
            </button>
          </>
        )}
      </main>
    </>
  );
}

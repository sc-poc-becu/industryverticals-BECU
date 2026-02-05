import { useState, useRef, useEffect, JSX } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const SearchPage = (): JSX.Element => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const suggestionsData = ['Best point of sale system for growing restaurants'];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const routeQuery = (): string | null => {
    return 'search-results';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = suggestionsData.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    if (matches.length > 0) {
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeIndex >= 0) {
        setQuery(suggestions[activeIndex]);
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const target = routeQuery();
    if (target) {
      router.push(`/${target}?q=${encodeURIComponent(query)}`);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 120);
  };

  return (
    <>
      <Head>
        <title>Search</title>
        <meta name="description" content="Search page" />
      </Head>
      <div className="search-page">
        <header className="search-page__header">
          <nav className="search-page__nav search-page__nav--left" aria-label="Primary">
            <a href="https://globalpayments-poc.vercel.app/" target="_blank" rel="noreferrer">
              Home Page
            </a>
            <a
              href="https://globalpayments-poc.vercel.app/?utm_campaign=genius-retail"
              target="_blank"
              rel="noreferrer"
            >
              Retail
            </a>
            <a
              href="https://globalpayments-poc.vercel.app/?utm_campaign=genius-restaurants"
              target="_blank"
              rel="noreferrer"
            >
              Restaurants
            </a>
          </nav>
          <nav className="search-page__nav search-page__nav--right" aria-label="Secondary">
            <a
              href="https://xmapps.sitecorecloud.io/strategy/overview?tenantName=globalpayme583f-globalpayme5281-globalpayme1d82&organization=org_xRvyOVIhrfN7vQzW"
              target="_blank"
              rel="noreferrer"
            >
              SitecoreAI
            </a>
            <a
              href="https://pages.sitecorecloud.io/editor?organization=org_xRvyOVIhrfN7vQzW&tenantName=globalpayme583f-globalpayme5281-globalpayme1d82&sc_site=Financial&sc_itemid=b2a38fb8-2e85-4d58-afe5-c12beccbee3a&sc_lang=en&sc_version=1"
              target="_blank"
              rel="noreferrer"
            >
              Pages Editor
            </a>
            <button className="search-page__apps" type="button" aria-label="Google apps">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 5h3v3H5V5zm0 5.5h3v3H5v-3zm0 5.5h3v3H5v-3zM10.5 5h3v3h-3V5zm0 5.5h3v3h-3v-3zm0 5.5h3v3h-3v-3zM16 5h3v3h-3V5zm0 5.5h3v3h-3v-3zm0 5.5h3v3h-3v-3z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <a
              className="search-page__signin"
              href="https://accounts.google.com/ServiceLogin"
              target="_blank"
              rel="noreferrer"
            >
              Sign in
            </a>
          </nav>
        </header>

        <main className="search-page__main">
          <div className="search-page__logo">
            <svg
              className="search-page__logo-svg"
              aria-label="Google"
              height="92"
              role="img"
              viewBox="0 0 272 92"
              width="272"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill="#EA4335"
              />
              <path
                d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                fill="#FBBC05"
              />
              <path
                d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
                fill="#4285F4"
              />
              <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
              <path
                d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                fill="#EA4335"
              />
              <path
                d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
                fill="#4285F4"
              />
            </svg>
          </div>

          <form id="searchForm" className="search-page__form" onSubmit={handleSubmit}>
            <div className="search-page__input-container">
              <div className="search-page__input-wrapper">
                <div className="search-page__search-icon">
                  <svg
                    focusable="false"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                  </svg>
                </div>
                <textarea
                  ref={inputRef}
                  id="q"
                  className="search-page__input"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  placeholder=""
                  aria-label="Search"
                  rows={1}
                  autoFocus
                />
                <div className="search-page__input-actions">
                  <button type="button" aria-label="Search by voice">
                    <svg viewBox="0 -960 960 960" aria-hidden="true">
                      <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Z" />
                    </svg>
                  </button>
                  <button type="button" aria-label="Search by image">
                    <svg viewBox="0 -960 960 960" aria-hidden="true">
                      <path d="M480-320q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm240 160q-33 0-56.5-23.5T640-240q0-33 23.5-56.5T720-320q33 0 56.5 23.5T800-240q0 33-23.5 56.5T720-160Zm-440 40q-66 0-113-47t-47-113v-80h80v80q0 33 23.5 56.5T280-200h200v80H280Zm480-320v-160q0-33-23.5-56.5T680-680H280q-33 0-56.5 23.5T200-600v120h-80v-120q0-66 47-113t113-47h80l40-80h160l40 80h80q66 0 113 47t47 113v160h-80Z" />
                    </svg>
                  </button>
                  <button className="search-page__ai-mode" type="button" aria-label="AI Mode">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2l2.2 6.1L20 10l-5.8 1.9L12 18l-2.2-6.1L4 10l5.8-1.9L12 2z" />
                    </svg>
                    <span>AI Mode</span>
                  </button>
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    ref={suggestionsRef}
                    id="suggestions"
                    className="search-page__suggestions"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className={`search-page__suggestion ${
                          index === activeIndex ? 'active' : ''
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(suggestion);
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="search-page__actions">
              <button className="search-page__action" type="submit">
                Google Search
              </button>
              <button className="search-page__action" type="button">
                I&apos;m Feeling Lucky
              </button>
            </div>
          </form>
        </main>

        <footer className="search-page__footer">
          <div className="search-page__footer-links">
            <a href="https://www.google.com/intl/en_us/ads/" target="_blank" rel="noreferrer">
              Advertising
            </a>
            <a href="https://www.google.com/services/" target="_blank" rel="noreferrer">
              Business
            </a>
            <a href="https://google.com/search/howsearchworks/" target="_blank" rel="noreferrer">
              How Search works
            </a>
          </div>
          <div className="search-page__footer-links">
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Privacy
            </a>
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
              Terms
            </a>
            <button type="button">Settings</button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SearchPage;

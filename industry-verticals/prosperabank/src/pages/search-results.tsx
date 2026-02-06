import { useState, useRef, useEffect, JSX } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl?: string;
}

interface SidebarAd {
  title: string;
  snippet: string;
  source: string;
  url?: string;
  imageUrl?: string;
}

const SearchResultsPage = (): JSX.Element => {
  const router = useRouter();
  const fixedQuery = 'Can I use home equity for renovations';
  const { q } = router.query;
  const [query, setQuery] = useState(fixedQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const suggestionsData = ['Global Payments Genius POS'];

  // Mock search results - in a real app, these would come from an API
  const mockResults: SearchResult[] = [
    {
      title: 'BECU Home Equity Line of Credit',
      url: 'https://becu-onsite.vercel.app/',
      snippet:
        'BECU offers flexible home equity lines of credit with competitive rates, no application fees, and member-focused guidance to help homeowners reach their financial goals....',
      displayUrl: 'becu.com › home',
    },
  ];

  const sidebarAds: SidebarAd[] = [
    {
      title: 'BECU Home Equity Line of Credit',
      snippet:
        'Put your home’s equity to work. BECU offers flexible home equity lines of credit with competitive rates, no application fees, and local expertise you can trust.',
      source: 'BECU',
      url: '/?utm_campaign=becu-heloc',
      imageUrl:
        'https://ze-verticals-26.sitecoresandbox.cloud/api/public/content/68bffaf5483e4957bae0ae5a01971847?v=6622699b',
    },
    {
      title: 'Is a HELOC Right for Your Financial Goals?',
      snippet:
        'Learn how a home equity line of credit can help fund renovations, consolidate debt, or cover major expenses — all with flexible access to your equity.',
      source: 'BECU',
      url: '/?utm_campaign=becu-heloc-education',
      imageUrl:
        'https://ze-verticals-26.sitecoresandbox.cloud/api/public/content/63624-HomepagePromoCTAs-1100x740?v=a6bdddaa',
    },
    {
      title: 'BECU Home Loans and Equity Options',
      snippet:
        'From home equity lines of credit to fixed-rate loans, BECU provides transparent, member-focused lending solutions designed for homeowners at every stage.',
      source: 'BECU',
      url: 'https://becu.org/home-loans',
      imageUrl:
        'https://ze-verticals-26.sitecoresandbox.cloud/api/public/content/5249b717cc8e4f8294816fbbcb91eea3?v=a5d7f91f',
    },
  ];

  const tabs = [
    { label: 'AI Mode', active: false },
    { label: 'All', active: true },
    { label: 'Images', active: false },
    { label: 'Shopping', active: false },
    { label: 'Videos', active: false },
    { label: 'News', active: false },
    { label: 'Short videos', active: false },
    { label: 'More', active: false },
  ];

  useEffect(() => {
    if (query !== fixedQuery) {
      setQuery(fixedQuery);
    }
  }, [fixedQuery, query, q]);

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

    if (query.trim()) {
      router.push(`/search-results?q=${encodeURIComponent(fixedQuery)}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 120);
  };

  return (
    <>
      <Head>
        <title>{query ? `${query} - Search Results` : 'Search Results'}</title>
        <meta name="description" content="Search results page" />
      </Head>
      <div className="search-results-page">
        <header className="search-results-page__header">
          <div className="search-results-page__header-container">
            <div className="search-results-page__logo">
              <Link href="/search" className="search-results-page__logo-link">
                <svg
                  className="search-results-page__logo-svg"
                  aria-label="Google"
                  height="30"
                  role="img"
                  viewBox="0 0 272 92"
                  width="92"
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
              </Link>
            </div>

            <form
              id="searchForm"
              className="search-results-page__form"
              onSubmit={handleSubmit}
            >
              <div className="search-results-page__input-container">
                <div className="search-results-page__input-wrapper">
                  <div className="search-results-page__search-icon">
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
                    className="search-results-page__input"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder=""
                    aria-label="Search"
                    rows={1}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      ref={suggestionsRef}
                      id="suggestions"
                      className="search-results-page__suggestions"
                    >
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className={`search-results-page__suggestion ${
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
            </form>
          </div>
          <div className="search-results-page__tabs">
            <nav className="search-results-page__tabs-nav" aria-label="Search filters">
              <ul className="search-results-page__tabs-list">
                {tabs.map((tab) => (
                  <li
                    key={tab.label}
                    className={`search-results-page__tab ${tab.active ? 'is-active' : ''}`}
                  >
                    <span>{tab.label}</span>
                  </li>
                ))}
              </ul>
              <button className="search-results-page__tools" type="button">
                Tools
              </button>
            </nav>
          </div>
        </header>

        <main className="search-results-page__main" id="main">
          <div className="search-results-page__content-wrapper">
            <div className="search-results-page__container">
              <div className="search-results-page__stats">
                {query && (
                  <p>
                    About {mockResults.length} results for <strong>{query}</strong>
                  </p>
                )}
              </div>

              {/* AI Overview Section */}
              {query &&
                (query.toLowerCase().includes('home equity') ||
                  query.toLowerCase().includes('renovation')) && (
                <div className="search-results-page__ai-overview">
                  <div className="search-results-page__ai-header">
                    <div className="search-results-page__ai-title-wrap">
                      <span className="search-results-page__ai-spark" aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                          <path
                            d="M12 2l2.2 6.1L20 10l-5.8 1.9L12 18l-2.2-6.1L4 10l5.8-1.9L12 2z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      <h2 className="search-results-page__ai-title">AI Overview</h2>
                    </div>
                    <button
                      className="search-results-page__ai-menu"
                      type="button"
                      aria-label="More options"
                    >
                      <span aria-hidden="true">⋮</span>
                    </button>
                  </div>
                  <div className="search-results-page__ai-content">
                    <p>
                      Yes, you can use home equity for renovations through BECU (and other
                      lenders) by leveraging the difference between your home&apos;s value and your
                      mortgage balance. Options include a Home Equity Line of Credit (HELOC) for
                      flexible, revolving funds, or a fixed-rate home equity loan for a lump sum.
                    </p>
                    <div className="search-results-page__ai-features">
                      <h3 className="search-results-page__ai-features-title">
                        Key Details on Using Equity for Renovations
                      </h3>
                      <ul className="search-results-page__ai-features-list">
                        <li>
                          <strong>Best Options:</strong> HELOCs are ideal for ongoing projects,
                          while fixed-rate loans are better for defined, one-time renovations.
                        </li>
                        <li>
                          <strong>Available Projects:</strong> Funds can be used for kitchens,
                          baths, roofs, energy-efficient upgrades, and landscaping.
                        </li>
                        <li>
                          <strong>Limitations:</strong> BECU considers your current equity and the
                          home&apos;s projected value after construction.
                        </li>
                        <li>
                          <strong>Risks:</strong> Because these are secured by your home, failing to
                          make payments can risk foreclosure.
                        </li>
                        <li>
                          <strong>Tax Tip:</strong> Interest on home equity loans/HELOCs may be
                          tax-deductible if used to substantially improve the home, according to
                          YouTube video and Bankrate.
                        </li>
                      </ul>
                      <p>
                        It is recommended to obtain multiple contractor quotes and ensure the
                        renovations add value to your home.
                      </p>
                    </div>
                    <div className="search-results-page__ai-link">
                      <a
                        href="https://globalpayments-poc.vercel.app/?utm_campaign=genius-restaurants"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Learn more about BECU Loan Options
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {query &&
                (query.toLowerCase().includes('home equity') ||
                  query.toLowerCase().includes('renovation')) && (
                <div className="search-results-page__ai-actions">
                  <button className="search-results-page__ai-deeper" type="button">
                    Dive deeper in AI Mode
                  </button>
                  <div className="search-results-page__ai-footer">
                    <span>AI responses may include mistakes.</span>
                    <a href="https://support.google.com/websearch" target="_blank" rel="noreferrer">
                      Learn more
                    </a>
                    <div className="search-results-page__ai-feedback">
                      <button type="button" aria-label="Copy">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M8 7h9a2 2 0 0 1 2 2v9H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                      <button type="button" aria-label="Thumbs down">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M10 14H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M10 14l1.5 6a2 2 0 0 0 3.9-.7L14 14h3a2 2 0 0 0 2-2l-1-6a2 2 0 0 0-2-2H10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                      <button type="button" aria-label="Thumbs up">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M10 10H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M10 10l1.5-6a2 2 0 0 1 3.9.7L14 10h3a2 2 0 0 1 2 2l-1 6a2 2 0 0 1-2 2H10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="search-results-page__results" id="search">
                {mockResults.map((result, index) => (
                  <div key={index} className="search-results-page__result">
                    <div className="search-results-page__result-header">
                      {result.displayUrl && (
                        <div className="search-results-page__result-url">
                          {result.displayUrl}
                        </div>
                      )}
                      <h3 className="search-results-page__result-title">
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          {result.title}
                        </a>
                      </h3>
                    </div>
                    <div className="search-results-page__result-snippet">{result.snippet}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar with Ads */}
            <aside className="search-results-page__sidebar">
              <div className="search-results-page__sidebar-card">
                {sidebarAds.map((ad, index) => (
                  <div
                    key={index}
                    className={`search-results-page__sidebar-item ${
                      index === 0 ? 'is-featured' : ''
                    }`}
                  >
                    <div className="search-results-page__sidebar-item-main">
                      <div className="search-results-page__sidebar-item-meta">
                        <span className="search-results-page__sidebar-item-source">
                          {ad.source}
                        </span>
                        <button
                          className="search-results-page__sidebar-item-menu"
                          type="button"
                          aria-label="More options"
                        >
                          ⋮
                        </button>
                      </div>
                      <h4 className="search-results-page__sidebar-item-title">
                        {ad.url ? (
                          <a href={ad.url} target="_blank" rel="noopener noreferrer">
                            {ad.title}
                          </a>
                        ) : (
                          ad.title
                        )}
                      </h4>
                      <p className="search-results-page__sidebar-item-snippet">{ad.snippet}</p>
                    </div>
                    {ad.imageUrl && (
                      <div className="search-results-page__sidebar-item-image">
                        {ad.url ? (
                          <a href={ad.url} target="_blank" rel="noopener noreferrer">
                            <img src={ad.imageUrl} alt={ad.title} />
                          </a>
                        ) : (
                          <img src={ad.imageUrl} alt={ad.title} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <button className="search-results-page__sidebar-show-all" type="button">
                  Show all
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchResultsPage;

'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          background: '#1E272E',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>The application hit a critical error</h1>
          <p style={{ opacity: 0.8 }}>
            Please try again. If the problem persists, contact the site operator.
          </p>
          {error.digest ? <p style={{ fontSize: 12, opacity: 0.6 }}>Reference: {error.digest}</p> : null}
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'white',
              color: '#1E272E',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

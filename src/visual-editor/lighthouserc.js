/**
 * Lighthouse CI Configuration
 *
 * Defines performance budgets and CI thresholds for automated testing.
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

module.exports = {
  ci: {
    collect: {
      // Build the app before running Lighthouse
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:4173/'],
      numberOfRuns: 3, // Run 3 times and take median
      settings: {
        preset: 'desktop',
        // Throttling settings for consistent results
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Skip certain audits that aren't relevant
        skipAudits: [
          'canonical',
          'maskable-icon',
          'themed-omnibox',
          'uses-http2',
        ],
      },
    },
    assert: {
      // Performance budgets and thresholds
      preset: 'lighthouse:recommended',
      assertions: {
        // Core Web Vitals thresholds
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],

        // Performance score
        'categories:performance': ['warn', { minScore: 0.9 }],

        // Accessibility
        'categories:accessibility': ['warn', { minScore: 0.9 }],

        // Best practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],

        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 512000 }], // 500KB
        'resource-summary:stylesheet:size': [
          'error',
          { maxNumericValue: 102400 },
        ], // 100KB
        'resource-summary:image:size': ['warn', { maxNumericValue: 512000 }], // 500KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 2048000 }], // 2MB

        // Render performance
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        interactive: ['warn', { maxNumericValue: 3800 }],

        // JavaScript execution
        'bootup-time': ['warn', { maxNumericValue: 3500 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],

        // Network
        'network-requests': ['warn', { maxNumericValue: 50 }],
        'network-rtt': ['warn', { maxNumericValue: 150 }],
        'network-server-latency': ['warn', { maxNumericValue: 150 }],

        // Images
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'offscreen-images': 'warn',

        // Code optimization
        'unused-javascript': 'warn',
        'unused-css-rules': 'warn',
        'unminified-javascript': 'error',
        'unminified-css': 'error',

        // Caching
        'uses-long-cache-ttl': 'warn',

        // Modern web features
        'uses-text-compression': 'warn',
        'modern-image-formats': 'warn',
        'uses-rel-preconnect': 'off',
        'uses-rel-preload': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
      // If you want to store results permanently, configure:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};

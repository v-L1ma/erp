/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-warm': 'var(--surface-warm)',
        fg: 'var(--fg)',
        'fg-2': 'var(--fg-2)',
        muted: 'var(--muted)',
        meta: 'var(--meta)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-on': 'var(--accent-on)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)'
      },
      boxShadow: {
        raised: '0 12px 32px rgba(0,0,0,0.08)'
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
}


// ═══════════════════════════════════════════════════════════════
// SellSight Rebrand — 3 Aesthetic Directions
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

// ── Theme Definitions ──────────────────────────────────────────

const THEMES = {
  obsidian: {
    name: 'Obsidian',
    desc: 'Dark premium with electric accents — data-forward, glass effects',
    bg: '#0a0a0f',
    bgCard: 'rgba(255,255,255,0.04)',
    bgCardHover: 'rgba(255,255,255,0.07)',
    bgSurface: '#111118',
    bgNav: 'rgba(10,10,15,0.85)',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(255,255,255,0.15)',
    text: '#f0f0f5',
    textSecondary: 'rgba(240,240,245,0.55)',
    textTertiary: 'rgba(240,240,245,0.35)',
    accent: '#6366f1',
    accentHover: '#818cf8',
    accentBg: 'rgba(99,102,241,0.12)',
    accentText: '#a5b4fc',
    success: '#34d399',
    danger: '#f87171',
    warning: '#fbbf24',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
    gradientSubtle: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.08))',
    glass: 'rgba(255,255,255,0.03)',
    glassBorder: 'rgba(255,255,255,0.06)',
    glassBlur: '20px',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    shadowLg: '0 24px 80px rgba(0,0,0,0.5)',
    fontHeading: "'Space Grotesk', sans-serif",
    fontBody: "'DM Sans', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    radius: '14px',
    radiusSm: '10px',
    radiusXs: '7px',
    inputBg: 'rgba(255,255,255,0.05)',
    btnPrimary: '#6366f1',
    btnPrimaryHover: '#818cf8',
    btnPrimaryText: '#fff',
    btnSecondary: 'rgba(255,255,255,0.06)',
    btnSecondaryHover: 'rgba(255,255,255,0.1)',
    btnSecondaryText: '#f0f0f5',
  },
  aurora: {
    name: 'Aurora',
    desc: 'Soft light with teal + warm coral — modern, airy glass',
    bg: '#f6f7f9',
    bgCard: '#ffffff',
    bgCardHover: '#ffffff',
    bgSurface: '#eef0f4',
    bgNav: 'rgba(246,247,249,0.88)',
    border: 'rgba(0,0,0,0.07)',
    borderHover: 'rgba(0,0,0,0.13)',
    text: '#1a1a2e',
    textSecondary: 'rgba(26,26,46,0.55)',
    textTertiary: 'rgba(26,26,46,0.35)',
    accent: '#0d9488',
    accentHover: '#14b8a6',
    accentBg: 'rgba(13,148,136,0.08)',
    accentText: '#0d9488',
    success: '#059669',
    danger: '#e11d48',
    warning: '#d97706',
    gradient: 'linear-gradient(135deg, #0d9488, #06b6d4, #f97316)',
    gradientSubtle: 'linear-gradient(135deg, rgba(13,148,136,0.08), rgba(249,115,22,0.05))',
    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(255,255,255,0.8)',
    glassBlur: '16px',
    shadow: '0 4px 24px rgba(0,0,0,0.06)',
    shadowLg: '0 16px 64px rgba(0,0,0,0.08)',
    fontHeading: "'Space Grotesk', sans-serif",
    fontBody: "'DM Sans', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    radius: '16px',
    radiusSm: '12px',
    radiusXs: '8px',
    inputBg: '#fff',
    btnPrimary: '#0d9488',
    btnPrimaryHover: '#14b8a6',
    btnPrimaryText: '#fff',
    btnSecondary: '#fff',
    btnSecondaryHover: '#f0fdf4',
    btnSecondaryText: '#1a1a2e',
  },
  editorial: {
    name: 'Editorial',
    desc: 'Magazine-inspired with serif headlines, bold type, structured grid',
    bg: '#faf9f7',
    bgCard: '#ffffff',
    bgCardHover: '#ffffff',
    bgSurface: '#f0eeea',
    bgNav: 'rgba(250,249,247,0.92)',
    border: 'rgba(0,0,0,0.09)',
    borderHover: 'rgba(0,0,0,0.18)',
    text: '#1c1917',
    textSecondary: 'rgba(28,25,23,0.55)',
    textTertiary: 'rgba(28,25,23,0.35)',
    accent: '#b45309',
    accentHover: '#d97706',
    accentBg: 'rgba(180,83,9,0.08)',
    accentText: '#b45309',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#ca8a04',
    gradient: 'linear-gradient(135deg, #b45309, #dc2626)',
    gradientSubtle: 'linear-gradient(135deg, rgba(180,83,9,0.06), rgba(220,38,38,0.04))',
    glass: 'rgba(255,255,255,0.7)',
    glassBorder: 'rgba(0,0,0,0.06)',
    glassBlur: '12px',
    shadow: '0 2px 16px rgba(0,0,0,0.06)',
    shadowLg: '0 12px 48px rgba(0,0,0,0.1)',
    fontHeading: "'Playfair Display', serif",
    fontBody: "'DM Sans', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    radius: '8px',
    radiusSm: '6px',
    radiusXs: '4px',
    inputBg: '#fff',
    btnPrimary: '#1c1917',
    btnPrimaryHover: '#44403c',
    btnPrimaryText: '#faf9f7',
    btnSecondary: '#faf9f7',
    btnSecondaryHover: '#f0eeea',
    btnSecondaryText: '#1c1917',
  },
};

// ── Context ────────────────────────────────────────────────────

const AppCtx = createContext();

function useApp() { return useContext(AppCtx); }

// ── Mock Data ──────────────────────────────────────────────────

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty'];

const PRODUCTS = Array.from({ length: 24 }, (_, i) => ({
  id: `p${i + 1}`,
  name: [
    'Wireless Noise-Cancelling Headphones', 'Merino Wool Crewneck Sweater',
    'Smart Home Hub Pro', 'Running Shoes Ultra Boost', 'Ceramic Pour-Over Set',
    'Organic Face Serum', 'Mechanical Keyboard 75%', 'Linen Blend Shirt',
    'Air Purifier HEPA', 'Trail Running Pack 12L', 'Cast Iron Dutch Oven',
    'Vitamin C Moisturizer', 'USB-C Docking Station', 'Cashmere Beanie',
    'Robot Vacuum S7', 'Yoga Mat Premium', 'French Press 34oz',
    'Retinol Night Cream', '4K Webcam Pro', 'Down Puffer Jacket',
    'Smart Thermostat', 'Resistance Band Set', 'Stoneware Dinner Set',
    'Hair Oil Treatment',
  ][i],
  category: CATEGORIES[i % 6],
  price: [179, 89, 129, 159, 45, 38, 149, 65, 199, 79, 85, 42, 119, 55, 399, 35, 29, 48, 99, 245, 169, 25, 95, 32][i],
  rating: [4.5, 4.2, 4.7, 4.3, 4.8, 4.1, 4.6, 4.0, 4.4, 4.5, 4.9, 4.3, 4.2, 4.6, 4.7, 4.4, 4.8, 4.1, 4.5, 4.3, 4.6, 4.0, 4.7, 4.2][i],
  reviews: [234, 89, 567, 312, 45, 156, 423, 67, 189, 234, 34, 278, 145, 98, 876, 203, 56, 167, 345, 78, 432, 89, 123, 201][i],
  seller: ['TechVault', 'NordStitch', 'SmartLiving', 'PeakGear', 'BrewCraft', 'GlowLab'][i % 6],
  aiPick: i < 6,
  stock: i !== 7,
}));

// ── Icons (inline SVG) ─────────────────────────────────────────

function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { width: size, height: size, flexShrink: 0 };
  const icons = {
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    cart: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
    arrow: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    arrowLeft: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
    star: <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    starHalf: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M12 2v15.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color}/></svg>,
    heart: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    minus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M5 12h14"/></svg>,
    plus: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
    trash: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    truck: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    shield: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
    sparkle: <svg style={s} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 2L14.4 8.8 22 10 16 15.2 17.6 22 12 18.4 6.4 22 8 15.2 2 10 9.6 8.8z"/></svg>,
    refresh: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>,
    package: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>,
    user: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    chart: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    grid: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>,
    x: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
    credit: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
    eye: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    chevDown: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>,
    menu: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
    filter: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>,
  };
  return icons[name] || null;
}

function Stars({ rating, size = 14, t }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name={i < full ? 'star' : (i === full && half ? 'starHalf' : 'star')}
          size={size} color={i < full || (i === full && half) ? '#fbbf24' : (t.name === 'Obsidian' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')} />
      ))}
    </div>
  );
}

// ── Shared Styles ──────────────────────────────────────────────

function getGlassStyle(t) {
  return {
    background: t.glass,
    backdropFilter: `blur(${t.glassBlur})`,
    WebkitBackdropFilter: `blur(${t.glassBlur})`,
    border: `1px solid ${t.glassBorder}`,
  };
}

// ── Navbar ─────────────────────────────────────────────────────

function Navbar() {
  const { t, page, setPage, cart } = useApp();
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50, height: 64,
      background: t.bgNav,
      backdropFilter: `blur(${t.glassBlur})`,
      WebkitBackdropFilter: `blur(${t.glassBlur})`,
      borderBottom: `1px solid ${t.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      fontFamily: t.fontBody,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setPage({ name: 'landing' })}>
        <div style={{
          width: 28, height: 28, borderRadius: t.radiusXs,
          background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="eye" size={14} color="#fff" />
        </div>
        <span style={{ fontFamily: t.fontHeading, fontWeight: 700, fontSize: 18, color: t.text, letterSpacing: '-0.02em' }}>
          SellSight
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
        {['Products', 'Sellers', 'Insights'].map(label => (
          <button key={label} onClick={() => label === 'Products' ? setPage({ name: 'products' }) : null}
            style={{
              height: 36, padding: '0 14px', borderRadius: t.radiusXs,
              background: (label === 'Products' && page.name === 'products') ? t.accentBg : 'transparent',
              color: (label === 'Products' && page.name === 'products') ? t.accentText : t.textSecondary,
              border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              fontFamily: t.fontBody, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!(label === 'Products' && page.name === 'products')) e.target.style.background = t.bgCard; }}
            onMouseLeave={e => { if (!(label === 'Products' && page.name === 'products')) e.target.style.background = 'transparent'; }}
          >{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setPage({ name: 'cart' })} style={{
          position: 'relative', width: 36, height: 36, borderRadius: t.radiusXs,
          background: page.name === 'cart' ? t.accentBg : 'transparent',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          <Icon name="cart" size={18} color={page.name === 'cart' ? t.accentText : t.textSecondary} />
          {cartCount > 0 && <span style={{
            position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8,
            background: t.accent, color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            fontFamily: t.fontBody,
          }}>{cartCount}</span>}
        </button>
        <button style={{
          width: 34, height: 34, borderRadius: '50%',
          background: t.gradient, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="user" size={15} color="#fff" />
        </button>
      </div>
    </nav>
  );
}

// ── Landing Page ───────────────────────────────────────────────

function LandingPage() {
  const { t, setPage } = useApp();
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const statCards = [
    { label: 'Products listed', value: '160K+', icon: 'package' },
    { label: 'Interactions analyzed', value: '285M+', icon: 'chart' },
    { label: 'Active sellers', value: '12K+', icon: 'user' },
  ];

  const features = [
    { icon: 'sparkle', title: 'AI-Powered Discovery', desc: 'Smart recommendations that learn your taste and surface products you\'ll love.' },
    { icon: 'shield', title: 'Secure Transactions', desc: 'End-to-end encrypted payments with buyer protection on every order.' },
    { icon: 'chart', title: 'Seller Insights', desc: 'Real-time analytics dashboard to optimize your listings and grow revenue.' },
    { icon: 'truck', title: 'Fast Fulfillment', desc: 'Integrated logistics with live tracking from warehouse to doorstep.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontBody, transition: 'all 0.3s' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 60px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Background orbs */}
        <div style={{
          position: 'absolute', top: -100, left: '20%', width: 500, height: 500,
          borderRadius: '50%', background: t.accent, opacity: 0.06, filter: 'blur(120px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -200, right: '15%', width: 600, height: 600,
          borderRadius: '50%', background: t.name === 'Obsidian' ? '#a855f7' : t.accent, opacity: 0.04, filter: 'blur(150px)',
          pointerEvents: 'none',
        }} />

        {/* AI Badge */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s ease 0.1s',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 20,
          background: t.accentBg, border: `1px solid ${t.border}`,
          fontSize: 13, fontWeight: 500, color: t.accentText,
          marginBottom: 28,
        }}>
          <Icon name="sparkle" size={13} color={t.accent} />
          Powered by AI personalization
        </div>

        {/* Headline */}
        <h1 style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease 0.2s',
          fontFamily: t.fontHeading, fontSize: 60, fontWeight: 700,
          color: t.text, lineHeight: 1.08, letterSpacing: '-0.035em',
          maxWidth: 700, marginBottom: 20,
        }}>
          See what sells.{' '}
          <span style={{
            background: t.gradient, WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>Sell what's seen.</span>
        </h1>

        <p style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.3s',
          fontSize: 17, color: t.textSecondary, maxWidth: 480, lineHeight: 1.6,
          marginBottom: 36,
        }}>
          A data-first marketplace where sellers get insights and customers get smart recommendations.
        </p>

        {/* CTAs */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.6s ease 0.4s',
          display: 'flex', gap: 12, marginBottom: 64,
        }}>
          <button onClick={() => setPage({ name: 'products' })} style={{
            height: 48, padding: '0 28px', borderRadius: t.radiusSm,
            background: t.btnPrimary, color: t.btnPrimaryText,
            border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            fontFamily: t.fontBody, display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: `0 4px 16px ${t.accent}40`,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            Browse products <Icon name="arrow" size={16} color={t.btnPrimaryText} />
          </button>
          <button style={{
            height: 48, padding: '0 28px', borderRadius: t.radiusSm,
            background: t.btnSecondary, color: t.btnSecondaryText,
            border: `1px solid ${t.border}`, cursor: 'pointer', fontSize: 15, fontWeight: 600,
            fontFamily: t.fontBody, transition: 'all 0.15s',
          }}>
            Start selling
          </button>
        </div>

        {/* Stats */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.5s',
          display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              ...getGlassStyle(t),
              borderRadius: t.radius, padding: '20px 28px',
              display: 'flex', alignItems: 'center', gap: 14,
              minWidth: 200,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: t.radiusXs,
                background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={s.icon} size={18} color={t.accent} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: t.text, fontFamily: t.fontHeading }}>{s.value}</div>
                <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '40px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: t.fontHeading, fontSize: 32, fontWeight: 700, color: t.text,
          textAlign: 'center', marginBottom: 12, letterSpacing: '-0.02em',
        }}>Everything you need</h2>
        <p style={{ textAlign: 'center', color: t.textSecondary, fontSize: 15, marginBottom: 40 }}>
          Powerful tools for buyers, sellers, and administrators.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {features.map(f => (
            <div key={f.title} style={{
              padding: 24, borderRadius: t.radius,
              background: t.bgCard, border: `1px solid ${t.border}`,
              transition: 'all 0.2s', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderHover; e.currentTarget.style.boxShadow = t.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: t.radiusXs,
                background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <Icon name={f.icon} size={18} color={t.accent} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 6, fontFamily: t.fontHeading }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        margin: '0 24px 60px', borderRadius: t.radius, overflow: 'hidden',
        background: t.name === 'Obsidian'
          ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
          : t.name === 'Aurora'
          ? 'linear-gradient(135deg, #0d9488, #0891b2)'
          : '#1c1917',
        padding: '48px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        <div>
          <h2 style={{ fontFamily: t.fontHeading, fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            Join thousands of buyers and sellers on SellSight today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setPage({ name: 'products' })} style={{
            height: 42, padding: '0 20px', borderRadius: t.radiusXs,
            background: '#fff', color: '#111', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: t.fontBody,
          }}>Browse products</button>
          <button style={{
            height: 42, padding: '0 20px', borderRadius: t.radiusXs,
            background: 'rgba(255,255,255,0.12)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: t.fontBody,
          }}>Create account</button>
        </div>
      </section>
    </div>
  );
}

// ── Product Listing Page ───────────────────────────────────────

function ProductsPage() {
  const { t, setPage, addToCart } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cat && p.category !== cat) return false;
      return true;
    });
  }, [search, cat]);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontBody }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>
        {/* Header */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.4s ease',
          marginBottom: 24,
        }}>
          <h1 style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: '-0.02em' }}>Shop</h1>
          <p style={{ fontSize: 14, color: t.textSecondary, marginTop: 4 }}>Discover products from quality sellers worldwide</p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center',
          opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease 0.1s',
        }}>
          <div style={{
            flex: '1 1 240px', maxWidth: 320, height: 40, borderRadius: t.radiusSm,
            background: t.inputBg, border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
          }}>
            <Icon name="search" size={16} color={t.textTertiary} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 14, color: t.text, fontFamily: t.fontBody,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                height: 34, padding: '0 14px', borderRadius: 17,
                background: cat === c ? t.accent : t.bgCard,
                color: cat === c ? '#fff' : t.textSecondary,
                border: cat === c ? 'none' : `1px solid ${t.border}`,
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                fontFamily: t.fontBody, transition: 'all 0.15s',
              }}>{c || 'All'}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.2s',
        }}>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} delay={i * 30} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: t.textSecondary }}>
            <Icon name="package" size={40} color={t.textTertiary} />
            <p style={{ marginTop: 12, fontSize: 15, fontWeight: 500 }}>No products match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product: p, delay = 0 }) {
  const { t, setPage, addToCart } = useApp();
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => setPage({ name: 'detail', id: p.id })}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer', borderRadius: t.radius, overflow: 'hidden',
        background: t.bgCard, border: `1px solid ${hover ? t.borderHover : t.border}`,
        boxShadow: hover ? t.shadow : 'none',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative', aspectRatio: '1', background: t.bgSurface, overflow: 'hidden',
      }}>
        {/* Placeholder stripes */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: t.name === 'Obsidian'
            ? 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.02) 8px, rgba(255,255,255,0.02) 16px)'
            : 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.02) 8px, rgba(0,0,0,0.02) 16px)',
          transform: hover ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="package" size={28} color={t.textTertiary} />
          <span style={{ fontSize: 10, color: t.textTertiary, fontFamily: t.fontMono }}>{p.category.toLowerCase()}</span>
        </div>

        {/* AI badge */}
        {p.aiPick && (
          <div style={{
            position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 12,
            background: t.name === 'Obsidian' ? 'rgba(99,102,241,0.85)' : t.accent,
            color: '#fff', fontSize: 11, fontWeight: 600,
            backdropFilter: 'blur(8px)',
          }}>
            <Icon name="sparkle" size={11} color="#fff" />
            AI Pick
          </div>
        )}

        {/* Add to cart on hover */}
        <button onClick={e => { e.stopPropagation(); addToCart(p); }} style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          height: 34, padding: '0 16px', borderRadius: 17,
          background: t.name === 'Obsidian' ? 'rgba(255,255,255,0.9)' : '#fff',
          color: '#111', border: `1px solid ${t.border}`,
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          opacity: hover ? 1 : 0, transition: 'all 0.2s',
          fontFamily: t.fontBody, whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          <Icon name="cart" size={13} color="#111" /> Add to cart
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 16px' }}>
        <div style={{
          fontSize: 11, fontWeight: 500, color: t.accentText,
          textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
        }}>{p.category}</div>
        <h3 style={{
          fontSize: 14, fontWeight: 500, color: t.text, lineHeight: 1.35,
          marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{p.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: t.fontHeading }}>
            ${p.price}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Stars rating={p.rating} size={12} t={t} />
            <span style={{ fontSize: 11, color: t.textTertiary }}>({p.reviews})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Detail Page ────────────────────────────────────────

function DetailPage({ id }) {
  const { t, setPage, addToCart } = useApp();
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('details');
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); setQty(1); }, [id]);

  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontBody }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 24px 60px' }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.textTertiary, marginBottom: 24,
          opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          <span style={{ cursor: 'pointer', color: t.textSecondary }} onClick={() => setPage({ name: 'products' })}>Products</span>
          <span>›</span>
          <span style={{ color: t.textSecondary }}>{p.category}</span>
          <span>›</span>
          <span style={{ color: t.text }}>{p.name.substring(0, 30)}...</span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s ease',
        }}>
          {/* Image */}
          <div>
            <div style={{
              aspectRatio: '1', borderRadius: t.radius, overflow: 'hidden',
              background: t.bgSurface, border: `1px solid ${t.border}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundImage: t.name === 'Obsidian'
                ? 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.015) 12px, rgba(255,255,255,0.015) 24px)'
                : 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(0,0,0,0.015) 12px, rgba(0,0,0,0.015) 24px)',
            }}>
              <Icon name="package" size={48} color={t.textTertiary} />
              <span style={{ fontSize: 12, color: t.textTertiary, fontFamily: t.fontMono }}>product shot — {p.category.toLowerCase()}</span>
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: 12, color: t.textTertiary, marginBottom: 8 }}>by {p.seller}</div>
            <h1 style={{
              fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.text,
              lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 12,
            }}>{p.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Stars rating={p.rating} size={15} t={t} />
              <span style={{ fontSize: 13, color: t.textSecondary }}>{p.rating} ({p.reviews} reviews)</span>
            </div>

            <div style={{ fontSize: 32, fontWeight: 700, color: t.text, fontFamily: t.fontHeading, marginBottom: 20 }}>
              ${p.price}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                background: t.accentBg, color: t.accentText,
              }}>{p.category}</span>
              <span style={{
                padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                background: p.stock ? (t.name === 'Obsidian' ? 'rgba(52,211,153,0.12)' : 'rgba(5,150,105,0.08)') : 'rgba(248,113,113,0.12)',
                color: p.stock ? t.success : t.danger,
              }}>{p.stock ? 'In stock' : 'Out of stock'}</span>
              {p.aiPick && <span style={{
                padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                background: t.gradient, color: '#fff',
                display: 'flex', alignItems: 'center', gap: 4,
              }}><Icon name="sparkle" size={11} color="#fff" />AI Pick</span>}
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: t.text, marginBottom: 8 }}>Quantity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[{ icon: 'minus', fn: () => setQty(q => Math.max(1, q - 1)) },
                  null,
                  { icon: 'plus', fn: () => setQty(q => q + 1) }
                ].map((item, i) => item ? (
                  <button key={i} onClick={item.fn} style={{
                    width: 40, height: 40, borderRadius: t.radiusXs,
                    background: t.inputBg, border: `1px solid ${t.border}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={item.icon} size={16} color={t.text} />
                  </button>
                ) : (
                  <span key={i} style={{
                    width: 48, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 600, color: t.text, borderRadius: t.radiusXs,
                    background: t.inputBg, border: `1px solid ${t.border}`,
                  }}>{qty}</span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => { addToCart(p, qty); }} style={{
                flex: 1, height: 50, borderRadius: t.radiusSm,
                background: t.btnPrimary, color: t.btnPrimaryText,
                border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                fontFamily: t.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 16px ${t.accent}30`,
                transition: 'all 0.15s',
              }}>
                <Icon name="cart" size={18} color={t.btnPrimaryText} /> Add to cart
              </button>
              <button style={{
                width: 50, height: 50, borderRadius: t.radiusSm,
                background: t.inputBg, border: `1px solid ${t.border}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="heart" size={18} color={t.textSecondary} />
              </button>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.textSecondary,
              padding: '12px 0', borderTop: `1px solid ${t.border}`,
            }}>
              <Icon name="truck" size={16} color={t.accent} /> Free delivery on orders over $30
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 48, borderTop: `1px solid ${t.border}` }}>
          <div style={{ display: 'flex', gap: 0, marginTop: -1 }}>
            {['details', 'reviews'].map(tb => (
              <button key={tb} onClick={() => setTab(tb)} style={{
                height: 44, padding: '0 20px', fontSize: 14, fontWeight: 500,
                color: tab === tb ? t.text : t.textSecondary,
                borderBottom: `2px solid ${tab === tb ? t.accent : 'transparent'}`,
                background: 'transparent', border: 'none', borderBottomWidth: 2,
                borderBottomStyle: 'solid', borderBottomColor: tab === tb ? t.accent : 'transparent',
                cursor: 'pointer', fontFamily: t.fontBody, textTransform: 'capitalize',
              }}>{tb === 'reviews' ? `Reviews (${p.reviews})` : 'Details'}</button>
            ))}
          </div>
          <div style={{ padding: '24px 0' }}>
            {tab === 'details' ? (
              <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.7, maxWidth: 600 }}>
                Premium quality {p.name.toLowerCase()} from {p.seller}. Designed with attention to detail and built to last. 
                This product features industry-leading materials and craftsmanship that sets it apart from the competition.
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{
                  padding: 24, borderRadius: t.radius, border: `1px solid ${t.border}`,
                  textAlign: 'center', minWidth: 140,
                }}>
                  <div style={{ fontSize: 40, fontWeight: 700, color: t.text, fontFamily: t.fontHeading }}>{p.rating}</div>
                  <Stars rating={p.rating} size={16} t={t} />
                  <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 6 }}>{p.reviews} reviews</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(n => {
                    const pct = n === 5 ? 60 : n === 4 ? 22 : n === 3 ? 10 : n === 2 ? 5 : 3;
                    return (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: t.textSecondary, width: 12 }}>{n}</span>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: t.bgSurface, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: t.accent, transition: 'width 0.5s ease' }} />
                        </div>
                        <span style={{ fontSize: 11, color: t.textTertiary, width: 28, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontFamily: t.fontHeading, fontSize: 20, fontWeight: 600, color: t.text, marginBottom: 16 }}>
              You might also like
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {related.map(r => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cart Page ──────────────────────────────────────────────────

function CartPage() {
  const { t, cart, setPage, updateCartQty, removeFromCart } = useApp();
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const shipping = subtotal >= 30 ? 0 : 5.99;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontBody }}>
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', textAlign: 'center' }}>
          <Icon name="cart" size={48} color={t.textTertiary} />
          <h2 style={{ fontFamily: t.fontHeading, fontSize: 22, fontWeight: 600, color: t.text, marginTop: 16 }}>Your cart is empty</h2>
          <p style={{ fontSize: 14, color: t.textSecondary, marginTop: 8, marginBottom: 24 }}>Browse our catalogue and add items to your cart.</p>
          <button onClick={() => setPage({ name: 'products' })} style={{
            height: 42, padding: '0 24px', borderRadius: t.radiusSm,
            background: t.btnPrimary, color: t.btnPrimaryText,
            border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            fontFamily: t.fontBody, display: 'flex', alignItems: 'center', gap: 8,
          }}>Browse products <Icon name="arrow" size={16} color={t.btnPrimaryText} /></button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: t.fontBody }}>
      <Navbar />
      <div style={{
        maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.4s ease',
      }}>
        <h1 style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 4 }}>
          Cart
        </h1>
        <p style={{ fontSize: 14, color: t.textSecondary, marginBottom: 28 }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
        </p>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Items */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map(({ product: p, qty }) => (
              <div key={p.id} style={{
                display: 'flex', gap: 16, padding: 16, borderRadius: t.radius,
                background: t.bgCard, border: `1px solid ${t.border}`,
                transition: 'all 0.2s',
              }}>
                {/* Image */}
                <div onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                  width: 80, height: 80, borderRadius: t.radiusSm, background: t.bgSurface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                  backgroundImage: t.name === 'Obsidian'
                    ? 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.015) 6px, rgba(255,255,255,0.015) 12px)'
                    : 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.015) 6px, rgba(0,0,0,0.015) 12px)',
                }}>
                  <Icon name="package" size={24} color={t.textTertiary} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, color: t.textTertiary, marginBottom: 2 }}>{p.category}</div>
                    <div onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                      fontSize: 14, fontWeight: 500, color: t.text, cursor: 'pointer',
                    }}>{p.name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {[{ icon: 'minus', fn: () => updateCartQty(p.id, qty - 1) },
                        null,
                        { icon: 'plus', fn: () => updateCartQty(p.id, qty + 1) }
                      ].map((item, i) => item ? (
                        <button key={i} onClick={item.fn} style={{
                          width: 30, height: 30, borderRadius: t.radiusXs,
                          background: t.inputBg, border: `1px solid ${t.border}`,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon name={item.icon} size={13} color={t.text} />
                        </button>
                      ) : (
                        <span key={i} style={{
                          width: 36, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 600, color: t.text,
                          background: t.inputBg, border: `1px solid ${t.border}`, borderRadius: t.radiusXs,
                        }}>{qty}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: t.fontHeading }}>
                        ${(p.price * qty).toFixed(2)}
                      </span>
                      <button onClick={() => removeFromCart(p.id)} style={{
                        width: 30, height: 30, borderRadius: t.radiusXs,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon name="trash" size={15} color={t.danger} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <div style={{
              ...getGlassStyle(t),
              borderRadius: t.radius, padding: 24,
              position: 'sticky', top: 80,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 20 }}>Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: t.textSecondary }}>Subtotal ({itemCount} items)</span>
                  <span style={{ color: t.text, fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: t.textSecondary }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? t.success : t.text, fontWeight: 500 }}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && <p style={{ fontSize: 11, color: t.textTertiary }}>Free shipping on orders over $30</p>}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700,
                color: t.text, padding: '16px 0', borderTop: `1px solid ${t.border}`,
                marginBottom: 16, fontFamily: t.fontHeading,
              }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button style={{
                width: '100%', height: 48, borderRadius: t.radiusSm,
                background: t.btnPrimary, color: t.btnPrimaryText,
                border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                fontFamily: t.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 4px 16px ${t.accent}30`,
              }}>
                Complete order <Icon name="arrow" size={16} color={t.btnPrimaryText} />
              </button>

              <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
                {[{ icon: 'credit', text: 'Secure payment' }, { icon: 'truck', text: 'Live tracking' }].map(x => (
                  <div key={x.text} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.textTertiary }}>
                    <Icon name={x.icon} size={13} color={t.textTertiary} /> {x.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tweaks Panel ───────────────────────────────────────────────

function TweaksPanel({ visible, onClose }) {
  const { t, theme, setTheme } = useApp();
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 999,
      width: 280, borderRadius: t.radius, overflow: 'hidden',
      background: t.name === 'Obsidian' ? '#1a1a24' : '#fff',
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowLg,
      fontFamily: t.fontBody,
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Tweaks</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Icon name="x" size={16} color={t.textSecondary} />
        </button>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: t.textSecondary, marginBottom: 8 }}>Theme Direction</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(THEMES).map(([key, th]) => (
              <button key={key} onClick={() => setTheme(key)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: t.radiusXs, cursor: 'pointer',
                background: theme === key ? t.accentBg : 'transparent',
                border: `1px solid ${theme === key ? t.accent : 'transparent'}`,
                textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: key === 'obsidian' ? '#0a0a0f' : key === 'aurora' ? '#0d9488' : '#1c1917',
                  border: `2px solid ${key === 'obsidian' ? '#6366f1' : key === 'aurora' ? '#14b8a6' : '#b45309'}`,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{th.name}</div>
                  <div style={{ fontSize: 10, color: t.textTertiary, lineHeight: 1.3 }}>{th.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────

function App() {
  const [theme, setThemeState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss-tweaks') || '{}').theme || TWEAK_DEFAULTS.theme; } catch { return TWEAK_DEFAULTS.theme; }
  });
  const [page, setPageState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss-page') || '{}'); } catch { return { name: 'landing' }; }
  });
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ss-cart') || '[]'); } catch { return []; }
  });
  const [tweaksVisible, setTweaksVisible] = useState(false);

  const setPage = useCallback((p) => { setPageState(p); localStorage.setItem('ss-page', JSON.stringify(p)); }, []);
  const setTheme = useCallback((th) => {
    setThemeState(th);
    const tweaks = { ...TWEAK_DEFAULTS, theme: th };
    localStorage.setItem('ss-tweaks', JSON.stringify(tweaks));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: th } }, '*');
  }, []);

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      const next = existing
        ? prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { product, qty }];
      localStorage.setItem('ss-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCartQty = useCallback((id, qty) => {
    setCart(prev => {
      const next = qty <= 0 ? prev.filter(c => c.product.id !== id) : prev.map(c => c.product.id === id ? { ...c, qty } : c);
      localStorage.setItem('ss-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const next = prev.filter(c => c.product.id !== id);
      localStorage.setItem('ss-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const t = THEMES[theme] || THEMES.obsidian;

  // Edit mode
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksVisible(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const ctx = useMemo(() => ({
    t, theme, setTheme, page, setPage, cart, addToCart, updateCartQty, removeFromCart,
  }), [t, theme, setTheme, page, setPage, cart, addToCart, updateCartQty, removeFromCart]);

  let content;
  switch (page.name) {
    case 'products': content = <ProductsPage />; break;
    case 'detail': content = <DetailPage id={page.id} />; break;
    case 'cart': content = <CartPage />; break;
    default: content = <LandingPage />;
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div style={{
        height: '100vh', overflow: 'auto',
        background: t.bg, transition: 'background 0.3s ease',
      }}>
        {content}
        <TweaksPanel visible={tweaksVisible} onClose={() => setTweaksVisible(false)} />
      </div>
    </AppCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

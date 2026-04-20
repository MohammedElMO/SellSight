// ── Shared Components ──────────────────────────────────────────
const { useState, useRef, useEffect, useCallback, useContext, createContext } = React;

const SSCtx = createContext();
function useSSCtx() { return useContext(SSCtx); }

// ── Magnetic hover button ──────────────────────────────────────
function MagButton({ children, onClick, primary, secondary, style: extraStyle, disabled }) {
  const { t } = useSSCtx();
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setOffset({ x, y });
  }, []);

  const bg = primary ? t.accent : secondary ? t.bgCard : 'transparent';
  const bgH = primary ? t.accentHover : secondary ? t.bgCardHover : t.accentMuted;
  const col = primary ? '#fff' : secondary ? t.text : t.text;
  const brd = primary ? 'none' : secondary ? `1px solid ${t.border}` : `1px solid ${t.border}`;

  return (
    <button ref={ref} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setOffset({ x: 0, y: 0 }); }}
      onMouseMove={handleMove}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 46, padding: '0 24px', borderRadius: t.rSm,
        background: hover ? bgH : bg, color: col, border: brd,
        fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${hover ? 1.02 : 1})`,
        transition: 'background 0.2s, transform 0.15s ease-out, box-shadow 0.2s',
        boxShadow: hover && primary ? `0 8px 32px ${t.accentGlow}` : 'none',
        whiteSpace: 'nowrap',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

// ── Tilt Card wrapper ──────────────────────────────────────────
function TiltCard({ children, style: extraStyle, onClick, intensity = 8 }) {
  const { t } = useSSCtx();
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -intensity;
    setTilt({ x, y });
  }, [intensity]);

  return (
    <div ref={ref} onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
      onMouseMove={handleMove}
      style={{
        transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) scale(${hover ? 1.02 : 1})`,
        transition: 'transform 0.15s ease-out, box-shadow 0.25s, border-color 0.2s',
        boxShadow: hover ? t.shadow : t.shadowSm,
        borderColor: hover ? t.borderHover : t.border,
        willChange: 'transform',
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

// ── Animated counter ───────────────────────────────────────────
function AnimCounter({ target, suffix = '', prefix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const num = parseInt(String(target).replace(/[^\d]/g, ''));
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(num * ease));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Reveal on scroll ───────────────────────────────────────────
function Reveal({ children, delay = 0, y = 30, style: extraStyle }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVis(true);
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

// ── Placeholder image ──────────────────────────────────────────
function PlaceholderImg({ label, aspect = '1', style: extraStyle }) {
  const { t } = useSSCtx();
  return (
    <div style={{
      aspectRatio: aspect, borderRadius: t.rSm, overflow: 'hidden',
      background: t.bgSurface, position: 'relative',
      backgroundImage: t.isDark
        ? 'repeating-linear-gradient(135deg, transparent, transparent 10px, oklch(0.95 0 0 / 0.015) 10px, oklch(0.95 0 0 / 0.015) 20px)'
        : 'repeating-linear-gradient(135deg, transparent, transparent 10px, oklch(0.2 0 0 / 0.02) 10px, oklch(0.2 0 0 / 0.02) 20px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      ...extraStyle,
    }}>
      <SSIcon name="package" size={28} color={t.textFaint} />
      {label && <span style={{ fontSize: 10, color: t.textFaint, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>}
    </div>
  );
}

// ── Pill / Badge ───────────────────────────────────────────────
function Pill({ children, accent, gradient, small, style: extraStyle }) {
  const { t } = useSSCtx();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '3px 8px' : '5px 12px',
      borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 600,
      background: gradient ? t.gradient : accent ? t.accentMuted : t.bgSurface,
      color: gradient ? '#fff' : accent ? t.accentText : t.textMuted,
      letterSpacing: '0.02em', textTransform: 'uppercase',
      ...extraStyle,
    }}>
      {children}
    </span>
  );
}

// ── Nav ────────────────────────────────────────────────────────
function SSNav() {
  const { t, page, setPage, cart, mode, setMode } = useSSCtx();
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 60,
      background: t.bgNav,
      backdropFilter: 'blur(24px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
      borderBottom: `1px solid ${t.borderSubtle}`,
      display: 'flex', alignItems: 'center', padding: '0 28px',
      transition: 'all 0.35s ease',
    }}>
      {/* Logo */}
      <div onClick={() => setPage({ name: 'landing' })}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: t.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 12px ${t.accentGlow}`,
          transition: 'box-shadow 0.3s',
        }}>
          <SSIcon name="eye" size={15} color="#fff" />
        </div>
        <span style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 19,
          color: t.text, letterSpacing: '-0.03em',
        }}>SellSight</span>
      </div>

      {/* Center links */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {[{ label: 'Discover', pg: 'landing' }, { label: 'Products', pg: 'products' }, { label: 'Sellers', pg: null }, { label: 'Insights', pg: null }].map(n => {
          const active = page.name === n.pg || (n.pg === 'landing' && page.name === 'landing');
          return (
            <button key={n.label} onClick={() => n.pg && setPage({ name: n.pg })}
              style={{
                height: 34, padding: '0 14px', borderRadius: t.rXs,
                background: active ? t.accentMuted : 'transparent',
                color: active ? t.accentText : t.textMuted,
                border: 'none', cursor: n.pg ? 'pointer' : 'default',
                fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s', opacity: n.pg ? 1 : 0.5,
              }}>{n.label}</button>
          );
        })}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Dark/Light toggle */}
        <button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} style={{
          width: 34, height: 34, borderRadius: t.rXs,
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          <SSIcon name={mode === 'dark' ? 'sun' : 'moon'} size={17} color={t.textMuted} />
        </button>

        {/* Cart */}
        <button onClick={() => setPage({ name: 'cart' })} style={{
          position: 'relative', width: 34, height: 34, borderRadius: t.rXs,
          background: page.name === 'cart' ? t.accentMuted : 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          <SSIcon name="cart" size={17} color={page.name === 'cart' ? t.accentText : t.textMuted} />
          {cartCount > 0 && <span style={{
            position: 'absolute', top: 1, right: 1, minWidth: 15, height: 15, borderRadius: 8,
            background: t.secondary, color: '#fff', fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
            transition: 'all 0.2s',
          }}>{cartCount}</span>}
        </button>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: t.gradient, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px ${t.accentGlow}`,
        }}>
          <SSIcon name="user" size={14} color="#fff" />
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { SSCtx, useSSCtx, MagButton, TiltCard, AnimCounter, Reveal, PlaceholderImg, Pill, SSNav });

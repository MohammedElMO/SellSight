// ── App Shell ──────────────────────────────────────────────────
const { useState: _useS, useEffect: _useE, useCallback: _useCB, useMemo: _useM } = React;

function SSApp() {
  const [mode, setModeState] = _useS(() => {
    try { return JSON.parse(localStorage.getItem('ss2-tweaks') || '{}').mode || TWEAK_DEFAULTS.mode; } catch { return TWEAK_DEFAULTS.mode; }
  });
  const [heroLayout, setHeroLayout] = _useS(() => {
    try { return JSON.parse(localStorage.getItem('ss2-tweaks') || '{}').heroLayout || TWEAK_DEFAULTS.heroLayout; } catch { return TWEAK_DEFAULTS.heroLayout; }
  });
  const [gridLayout, setGridLayout] = _useS(() => {
    try { return JSON.parse(localStorage.getItem('ss2-tweaks') || '{}').gridLayout || TWEAK_DEFAULTS.gridLayout; } catch { return TWEAK_DEFAULTS.gridLayout; }
  });
  const [page, setPageState] = _useS(() => {
    try { return JSON.parse(localStorage.getItem('ss2-page') || '{}'); } catch { return { name: 'landing' }; }
  });
  const [cart, setCart] = _useS(() => {
    try { return JSON.parse(localStorage.getItem('ss2-cart') || '[]'); } catch { return []; }
  });
  const [tweaksOpen, setTweaksOpen] = _useS(false);

  const setPage = _useCB(p => { setPageState(p); localStorage.setItem('ss2-page', JSON.stringify(p)); }, []);

  const persistTweaks = _useCB((updates) => {
    const current = { mode, heroLayout, gridLayout, ...updates };
    localStorage.setItem('ss2-tweaks', JSON.stringify(current));
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: updates }, '*');
  }, [mode, heroLayout, gridLayout]);

  const setMode = _useCB(m => { setModeState(m); persistTweaks({ mode: m }); }, [persistTweaks]);
  const setHeroLayoutWrap = _useCB(v => { setHeroLayout(v); persistTweaks({ heroLayout: v }); }, [persistTweaks]);
  const setGridLayoutWrap = _useCB(v => { setGridLayout(v); persistTweaks({ gridLayout: v }); }, [persistTweaks]);

  const addToCart = _useCB((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      const next = existing
        ? prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { product, qty }];
      localStorage.setItem('ss2-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateCartQty = _useCB((id, qty) => {
    setCart(prev => {
      const next = qty <= 0 ? prev.filter(c => c.product.id !== id) : prev.map(c => c.product.id === id ? { ...c, qty } : c);
      localStorage.setItem('ss2-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = _useCB(id => {
    setCart(prev => {
      const next = prev.filter(c => c.product.id !== id);
      localStorage.setItem('ss2-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const t = SS_THEMES[mode] || SS_THEMES.dark;

  // Edit mode protocol
  _useE(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const ctx = _useM(() => ({
    t, mode, setMode, heroLayout, setHeroLayout: setHeroLayoutWrap,
    gridLayout, setGridLayout: setGridLayoutWrap,
    page, setPage, cart, addToCart, updateCartQty, removeFromCart,
  }), [t, mode, setMode, heroLayout, setHeroLayoutWrap, gridLayout, setGridLayoutWrap, page, setPage, cart, addToCart, updateCartQty, removeFromCart]);

  let content;
  switch (page.name) {
    case 'products': content = <SSProducts />; break;
    case 'detail': content = <SSDetail id={page.id} />; break;
    case 'cart': content = <SSCart />; break;
    default: content = <SSLanding />;
  }

  return (
    <SSCtx.Provider value={ctx}>
      <div style={{
        height: '100vh', overflow: 'auto', background: t.bg,
        color: t.text, fontFamily: "'Outfit', sans-serif",
        transition: 'background 0.4s ease, color 0.4s ease',
      }}>
        {content}
        {tweaksOpen && <SSTweaksPanel onClose={() => setTweaksOpen(false)} />}
      </div>
    </SSCtx.Provider>
  );
}

// ── Tweaks Panel ───────────────────────────────────────────────
function SSTweaksPanel({ onClose }) {
  const { t, mode, setMode, heroLayout, setHeroLayout, gridLayout, setGridLayout } = useSSCtx();

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );

  const Toggle = ({ options, value, onChange }) => (
    <div style={{ display: 'flex', gap: 4, background: t.bgSurface, borderRadius: t.rXs, padding: 3 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, height: 30, borderRadius: t.rXs - 2,
          background: value === o.value ? t.accent : 'transparent',
          color: value === o.value ? '#fff' : t.textMuted,
          border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
          fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
        }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 999,
      width: 260, borderRadius: t.r, overflow: 'hidden',
      background: t.bgElevated, border: `1px solid ${t.border}`,
      boxShadow: t.shadow,
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: `1px solid ${t.borderSubtle}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Tweaks</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <SSIcon name="x" size={15} color={t.textMuted} />
        </button>
      </div>
      <div style={{ padding: 14 }}>
        <Section title="Color Mode">
          <Toggle value={mode} onChange={setMode} options={[
            { label: '● Dark', value: 'dark' },
            { label: '○ Light', value: 'light' },
          ]} />
        </Section>
        <Section title="Hero Layout">
          <Toggle value={heroLayout} onChange={setHeroLayout} options={[
            { label: 'Split', value: 'split' },
            { label: 'Dashboard', value: 'dashboard' },
          ]} />
        </Section>
        <Section title="Product Grid">
          <Toggle value={gridLayout} onChange={setGridLayout} options={[
            { label: 'Editorial', value: 'editorial' },
            { label: 'Masonry', value: 'masonry' },
          ]} />
        </Section>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SSApp />);

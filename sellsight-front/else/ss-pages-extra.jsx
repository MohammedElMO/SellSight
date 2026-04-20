// ── Additional Pages ───────────────────────────────────────────
const { useState: _uS, useEffect: _uE, useMemo: _uM, useCallback: _uCB } = React;

// ════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════

function SSLogin() {
  const { t, setPage, mode } = useSSCtx();
  const [email, setEmail] = _uS('');
  const [pwd, setPwd] = _uS('');
  const [showPwd, setShowPwd] = _uS(false);
  const [loading, setLoading] = _uS(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage({ name: 'seller-dash' }); }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg }}>
      {/* Left panel — brand */}
      <div style={{
        width: 440, flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: t.gradient, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 44px',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 0.2)' }} />
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '15%', right: '-10%', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setPage({ name: 'landing' })}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SSIcon name="eye" size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff' }}>SellSight</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, fontWeight: 800,
            color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Your marketplace,<br />intelligently powered.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            Join thousands of buyers and sellers using AI-driven insights to grow their business.
          </p>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© 2026 SellSight</p>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Reveal>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800,
              color: t.text, marginBottom: 6, letterSpacing: '-0.02em',
            }}>Sign in</h1>
            <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 32 }}>Welcome back — enter your credentials</p>
          </Reveal>

          <Reveal delay={100}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SSInput label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
              <div style={{ position: 'relative' }}>
                <SSInput label="Password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={pwd} onChange={setPwd} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 12, bottom: 12, background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0,
                }}>
                  <SSIcon name="eye" size={16} color={t.textFaint} />
                </button>
              </div>

              <MagButton primary disabled={loading} style={{ width: '100%', height: 48, marginTop: 8 }}>
                {loading ? <SSSpinner /> : <><span>Sign in</span> <SSIcon name="arrow" size={15} color="#fff" /></>}
              </MagButton>
            </form>
          </Reveal>

          <Reveal delay={200}>
            <p style={{ textAlign: 'center', fontSize: 14, color: t.textMuted, marginTop: 24 }}>
              No account yet?{' '}
              <span onClick={() => setPage({ name: 'register' })} style={{ color: t.accentText, fontWeight: 600, cursor: 'pointer' }}>Create one</span>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// REGISTER PAGE
// ════════════════════════════════════════════════════════════════

function SSRegister() {
  const { t, setPage } = useSSCtx();
  const [role, setRole] = _uS('customer');
  const [loading, setLoading] = _uS(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage({ name: role === 'seller' ? 'seller-dash' : 'products' }); }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg }}>
      {/* Left brand panel */}
      <div style={{
        width: 440, flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: t.gradient, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 44px',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 0.2)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-15%', width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setPage({ name: 'landing' })}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SSIcon name="eye" size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff' }}>SellSight</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Start your journey<br />with SellSight.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            Whether you're buying or selling — our AI-powered platform has you covered.
          </p>
        </div>

        <p style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>© 2026 SellSight</p>
      </div>

      {/* Right — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Reveal>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>Create account</h1>
            <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 28 }}>Choose your role and get started</p>
          </Reveal>

          {/* Role picker */}
          <Reveal delay={80}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {[{ val: 'customer', icon: 'cart', label: 'Customer', desc: 'Shop & discover' },
                { val: 'seller', icon: 'package', label: 'Seller', desc: 'List & sell' }
              ].map(r => (
                <div key={r.val} onClick={() => setRole(r.val)} style={{
                  flex: 1, padding: 16, borderRadius: t.r, cursor: 'pointer',
                  background: role === r.val ? t.accentMuted : t.bgCard,
                  border: `2px solid ${role === r.val ? t.accent : t.border}`,
                  transition: 'all 0.2s', textAlign: 'center',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: t.rXs, margin: '0 auto 8px',
                    background: role === r.val ? t.accent : t.bgSurface,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    <SSIcon name={r.icon} size={18} color={role === r.val ? '#fff' : t.textMuted} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={160}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <SSInput label="First name" placeholder="Jane" />
                <SSInput label="Last name" placeholder="Doe" />
              </div>
              <SSInput label="Email address" type="email" placeholder="you@example.com" />
              <SSInput label="Password" type="password" placeholder="Min 8 characters" />
              <MagButton primary disabled={loading} style={{ width: '100%', height: 48, marginTop: 8 }}>
                {loading ? <SSSpinner /> : <><span>Create account</span> <SSIcon name="arrow" size={15} color="#fff" /></>}
              </MagButton>
            </form>
          </Reveal>

          <Reveal delay={240}>
            <p style={{ textAlign: 'center', fontSize: 14, color: t.textMuted, marginTop: 24 }}>
              Already have an account?{' '}
              <span onClick={() => setPage({ name: 'login' })} style={{ color: t.accentText, fontWeight: 600, cursor: 'pointer' }}>Sign in</span>
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SELLER DASHBOARD
// ════════════════════════════════════════════════════════════════

const SELLER_STATS = [
  { icon: 'package', label: 'Total Products', value: 24, change: '+3 this week' },
  { icon: 'eye', label: 'Active Listings', value: 18, change: '75% of total' },
  { icon: 'chart', label: 'Avg. Price', value: '$94.50', change: '+5.2% vs last month' },
  { icon: 'trending', label: 'Revenue', value: '$12,480', change: '+18.3% growth' },
];

const RECENT_ORDERS = [
  { id: 'ORD-2847', customer: 'Sarah K.', items: 2, total: 268, status: 'shipped', date: 'Apr 17' },
  { id: 'ORD-2846', customer: 'Mike R.', items: 1, total: 149, status: 'processing', date: 'Apr 17' },
  { id: 'ORD-2845', customer: 'Anna L.', items: 3, total: 183, status: 'delivered', date: 'Apr 16' },
  { id: 'ORD-2844', customer: 'James W.', items: 1, total: 399, status: 'delivered', date: 'Apr 16' },
  { id: 'ORD-2843', customer: 'Lisa M.', items: 2, total: 124, status: 'shipped', date: 'Apr 15' },
];

function SSSellerDash() {
  const { t, setPage } = useSSCtx();
  const myProducts = SS_PRODUCTS.slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 80px' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: '-0.02em' }}>Dashboard</h1>
              <p style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Welcome back, Jane</p>
            </div>
            <MagButton primary onClick={() => setPage({ name: 'seller-products' })}>
              <SSIcon name="plus" size={15} color="#fff" /> New product
            </MagButton>
          </div>
        </Reveal>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {SELLER_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <TiltCard intensity={4} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: t.r, padding: 20, cursor: 'default',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: t.textFaint, fontWeight: 500 }}>{s.label}</span>
                  <div style={{ width: 32, height: 32, borderRadius: t.rXs, background: t.accentMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SSIcon name={s.icon} size={15} color={t.accent} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 800, color: t.text }}>{s.value}</div>
                <div style={{ fontSize: 12, color: t.success, fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <SSIcon name="arrowUp" size={12} color={t.success} /> {s.change}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Two column: Orders + Products */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          {/* Recent Orders */}
          <Reveal delay={300}>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Recent Orders</h2>
                <span onClick={() => setPage({ name: 'orders' })} style={{ fontSize: 12, color: t.accentText, fontWeight: 500, cursor: 'pointer' }}>View all →</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.5fr 0.6fr 0.7fr', gap: 8, padding: '8px 0', borderBottom: `1px solid ${t.borderSubtle}` }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Status'].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                  ))}
                </div>
                {RECENT_ORDERS.map(o => (
                  <div key={o.id} onClick={() => setPage({ name: 'order-detail', id: o.id })}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 0.8fr 0.5fr 0.6fr 0.7fr', gap: 8,
                      padding: '12px 0', borderBottom: `1px solid ${t.borderSubtle}`,
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = t.accentMuted}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</span>
                    <span style={{ fontSize: 13, color: t.textMuted }}>{o.customer}</span>
                    <span style={{ fontSize: 13, color: t.textMuted }}>{o.items}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>${o.total}</span>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Top Products */}
          <Reveal delay={400}>
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Your Products</h2>
                <span onClick={() => setPage({ name: 'seller-products' })} style={{ fontSize: 12, color: t.accentText, fontWeight: 500, cursor: 'pointer' }}>Manage →</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myProducts.slice(0, 5).map(p => (
                  <div key={p.id} onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
                    borderRadius: t.rSm, cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = t.accentMuted}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: t.rXs, background: t.bgSurface, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SSIcon name="package" size={16} color={t.textFaint} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: t.textFaint }}>{p.category}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>${p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SELLER PRODUCTS MANAGEMENT
// ════════════════════════════════════════════════════════════════

function SSSellerProducts() {
  const { t, setPage } = useSSCtx();
  const products = SS_PRODUCTS.slice(0, 12);

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 80px' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span onClick={() => setPage({ name: 'seller-dash' })} style={{ fontSize: 13, color: t.textMuted, cursor: 'pointer' }}>Dashboard</span>
                <span style={{ color: t.textFaint }}>›</span>
                <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>Products</span>
              </div>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: t.text }}>My Products</h1>
            </div>
            <MagButton primary>
              <SSIcon name="plus" size={15} color="#fff" /> Add product
            </MagButton>
          </div>
        </Reveal>

        {/* Table */}
        <Reveal delay={100}>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr',
              gap: 12, padding: '14px 20px', borderBottom: `1px solid ${t.border}`, background: t.bgSurface,
            }}>
              {['Product', 'Category', 'Price', 'Rating', 'Reviews', 'Status'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {products.map((p, i) => (
              <div key={p.id}
                onClick={() => setPage({ name: 'detail', id: p.id })}
                style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.8fr 0.6fr',
                  gap: 12, padding: '14px 20px', borderBottom: `1px solid ${t.borderSubtle}`,
                  cursor: 'pointer', transition: 'background 0.15s', alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.accentMuted}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: t.rXs, background: t.bgSurface, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SSIcon name="package" size={15} color={t.textFaint} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                </div>
                <Pill accent small>{p.category}</Pill>
                <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>${p.price}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SSIcon name="star" size={12} color="#fbbf24" />
                  <span style={{ fontSize: 13, color: t.textMuted }}>{p.rating}</span>
                </div>
                <span style={{ fontSize: 13, color: t.textMuted }}>{p.reviews}</span>
                <StatusBadge status={i % 3 === 2 ? 'inactive' : 'active'} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ORDER HISTORY
// ════════════════════════════════════════════════════════════════

const ALL_ORDERS = [
  { id: 'ORD-2847', customer: 'Sarah K.', items: 2, total: 268, status: 'shipped', date: 'Apr 17, 2026', products: ['p1', 'p2'] },
  { id: 'ORD-2846', customer: 'Mike R.', items: 1, total: 149, status: 'processing', date: 'Apr 17, 2026', products: ['p7'] },
  { id: 'ORD-2845', customer: 'Anna L.', items: 3, total: 183, status: 'delivered', date: 'Apr 16, 2026', products: ['p5', 'p6', 'p8'] },
  { id: 'ORD-2844', customer: 'James W.', items: 1, total: 399, status: 'delivered', date: 'Apr 16, 2026', products: ['p15'] },
  { id: 'ORD-2843', customer: 'Lisa M.', items: 2, total: 124, status: 'shipped', date: 'Apr 15, 2026', products: ['p4', 'p16'] },
  { id: 'ORD-2842', customer: 'Tom B.', items: 1, total: 89, status: 'delivered', date: 'Apr 14, 2026', products: ['p2'] },
  { id: 'ORD-2841', customer: 'Emily S.', items: 4, total: 311, status: 'delivered', date: 'Apr 13, 2026', products: ['p3', 'p9', 'p5', 'p17'] },
  { id: 'ORD-2840', customer: 'Chris D.', items: 1, total: 245, status: 'cancelled', date: 'Apr 12, 2026', products: ['p20'] },
];

function SSOrders() {
  const { t, setPage } = useSSCtx();
  const [filter, setFilter] = _uS('all');

  const filtered = _uM(() => {
    if (filter === 'all') return ALL_ORDERS;
    return ALL_ORDERS.filter(o => o.status === filter);
  }, [filter]);

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 80px' }}>
        <Reveal>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 4 }}>Orders</h1>
          <p style={{ fontSize: 14, color: t.textMuted, marginBottom: 24 }}>Track and manage all orders</p>
        </Reveal>

        {/* Filters */}
        <Reveal delay={80}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 24 }}>
            {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                height: 34, padding: '0 14px', borderRadius: 17,
                background: filter === f ? t.accent : 'transparent',
                color: filter === f ? '#fff' : t.textMuted,
                border: filter === f ? 'none' : `1px solid ${t.border}`,
                cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
              }}>{f === 'all' ? `All (${ALL_ORDERS.length})` : f}</button>
            ))}
          </div>
        </Reveal>

        {/* Order cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((o, i) => (
            <Reveal key={o.id} delay={i * 50}>
              <TiltCard intensity={2} onClick={() => setPage({ name: 'order-detail', id: o.id })} style={{
                display: 'flex', alignItems: 'center', gap: 20, padding: '18px 20px',
                background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, cursor: 'pointer',
              }}>
                <div style={{ flex: '0 0 100px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</div>
                  <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>{o.date}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{o.customer}</div>
                  <div style={{ fontSize: 12, color: t.textFaint }}>{o.items} item{o.items > 1 ? 's' : ''}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>${o.total}</div>
                <StatusBadge status={o.status} />
                <SSIcon name="arrow" size={16} color={t.textFaint} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ORDER DETAIL
// ════════════════════════════════════════════════════════════════

function SSOrderDetail({ id }) {
  const { t, setPage } = useSSCtx();
  const order = ALL_ORDERS.find(o => o.id === id) || ALL_ORDERS[0];
  const orderProducts = order.products.map(pid => SS_PRODUCTS.find(p => p.id === pid)).filter(Boolean);

  const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
  const stepMap = { processing: 1, shipped: 2, delivered: 3, cancelled: -1 };
  const currentStep = stepMap[order.status] ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* Breadcrumb */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.textFaint, marginBottom: 24 }}>
            <span style={{ cursor: 'pointer', color: t.textMuted }} onClick={() => setPage({ name: 'orders' })}>Orders</span>
            <span>›</span>
            <span style={{ color: t.text, fontWeight: 500 }}>{order.id}</span>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: t.text }}>
                {order.id}
              </h1>
              <p style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>{order.date} · {order.customer}</p>
            </div>
            <StatusBadge status={order.status} large />
          </div>
        </Reveal>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <Reveal delay={100}>
            <div style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r,
              padding: '28px 32px', marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: i <= currentStep ? t.accent : t.bgSurface,
                        color: i <= currentStep ? '#fff' : t.textFaint,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, transition: 'all 0.4s',
                        boxShadow: i === currentStep ? `0 0 20px ${t.accentGlow}` : 'none',
                      }}>
                        {i < currentStep ? <SSIcon name="check" size={15} color="#fff" /> : i + 1}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: i === currentStep ? 600 : 400, color: i <= currentStep ? t.text : t.textFaint }}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 24, borderRadius: 1, background: i < currentStep ? t.accent : t.borderSubtle, transition: 'all 0.4s' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Items */}
        <Reveal delay={200}>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, padding: 20, marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 16 }}>Items</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orderProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0', borderBottom: `1px solid ${t.borderSubtle}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: t.rXs, background: t.bgSurface, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SSIcon name="package" size={18} color={t.textFaint} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: t.textFaint }}>{p.category} · by {p.seller}</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>${p.price}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Summary */}
        <Reveal delay={300}>
          <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r, padding: 20,
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <div style={{ width: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                <span style={{ color: t.textMuted }}>Subtotal</span>
                <span style={{ color: t.text, fontWeight: 500 }}>${order.total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                <span style={{ color: t.textMuted }}>Shipping</span>
                <span style={{ color: t.success, fontWeight: 500 }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: t.text, paddingTop: 12, borderTop: `1px solid ${t.borderSubtle}`, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <span>Total</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

// ── Shared Helpers ─────────────────────────────────────────────

function StatusBadge({ status, large }) {
  const { t } = useSSCtx();
  const map = {
    active: { bg: t.successMuted, color: t.success },
    inactive: { bg: t.dangerMuted, color: t.danger },
    processing: { bg: t.accentMuted, color: t.accentText },
    shipped: { bg: t.secondaryMuted, color: t.secondaryText },
    delivered: { bg: t.successMuted, color: t.success },
    cancelled: { bg: t.dangerMuted, color: t.danger },
  };
  const s = map[status] || map.active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: large ? '6px 14px' : '3px 10px', borderRadius: 12,
      background: s.bg, color: s.color,
      fontSize: large ? 13 : 11, fontWeight: 600, textTransform: 'capitalize',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {status}
    </span>
  );
}

function SSInput({ label, type = 'text', placeholder, value, onChange }) {
  const { t } = useSSCtx();
  return (
    <div>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 6, display: 'block' }}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%', height: 44, padding: '0 14px', borderRadius: t.rSm,
          background: t.bgInput, border: `1px solid ${t.border}`,
          color: t.text, fontSize: 14, fontFamily: "'Outfit', sans-serif",
          outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = t.accent}
        onBlur={e => e.target.style.borderColor = t.border}
      />
    </div>
  );
}

function SSSpinner() {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      animation: 'ssSpin 0.6s linear infinite',
    }}>
      <style>{`@keyframes ssSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

Object.assign(window, { SSLogin, SSRegister, SSSellerDash, SSSellerProducts, SSOrders, SSOrderDetail, StatusBadge, SSInput, SSSpinner });

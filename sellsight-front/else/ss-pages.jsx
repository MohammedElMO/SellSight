// ── Pages ──────────────────────────────────────────────────────
const { useState: useS, useEffect: useE, useMemo: useM, useCallback: useCB, useRef: useR } = React;

// ════════════════════════════════════════════════════════════════
// LANDING PAGE
// ════════════════════════════════════════════════════════════════

function SSLanding() {
  const { t, setPage, heroLayout } = useSSCtx();

  return heroLayout === 'dashboard' ? <LandingDashboard /> : <LandingSplit />;
}

// ── Layout A: Split Hero ───────────────────────────────────────
function LandingSplit() {
  const { t, setPage } = useSSCtx();

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />

      {/* Hero — asymmetric split */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 60px)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Left content */}
        <div style={{
          padding: '80px 48px 80px 56px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', zIndex: 2,
        }}>
          <Reveal>
            <Pill accent><SSIcon name="sparkle" size={11} color={t.accent} /> AI-Powered Marketplace</Pill>
          </Reveal>

          <Reveal delay={100}>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 56, fontWeight: 800,
              color: t.text, lineHeight: 1.05, letterSpacing: '-0.04em',
              marginTop: 24, marginBottom: 20,
            }}>
              See what{' '}
              <span style={{
                background: t.gradientText, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>sells.</span>
              <br />Sell what's{' '}
              <span style={{
                background: t.gradientText, WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>seen.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p style={{
              fontSize: 16, color: t.textMuted, lineHeight: 1.65, maxWidth: 420, marginBottom: 32,
            }}>
              A data-first marketplace where sellers get real-time insights and customers discover products through intelligent recommendations.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
              <MagButton primary onClick={() => setPage({ name: 'products' })}>
                Browse products <SSIcon name="arrow" size={15} color="#fff" />
              </MagButton>
              <MagButton secondary>Start selling</MagButton>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal delay={400}>
            <div style={{ display: 'flex', gap: 32 }}>
              {[
                { val: '285', suffix: 'M+', label: 'Interactions' },
                { val: '160', suffix: 'K+', label: 'Products' },
                { val: '12', suffix: 'K+', label: 'Sellers' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800,
                    color: t.text, letterSpacing: '-0.03em',
                  }}>
                    <AnimCounter target={s.val} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 12, color: t.textFaint, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right — floating product cards composition */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: t.gradientHero,
        }}>
          {/* Decorative orbs */}
          <div style={{
            position: 'absolute', top: '10%', right: '10%', width: 300, height: 300,
            borderRadius: '50%', background: t.accent, opacity: 0.08, filter: 'blur(80px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', left: '5%', width: 200, height: 200,
            borderRadius: '50%', background: t.secondary, opacity: 0.06, filter: 'blur(60px)',
          }} />

          {/* Floating cards */}
          {[
            { product: SS_PRODUCTS[0], top: '12%', left: '8%', rot: -3, z: 3 },
            { product: SS_PRODUCTS[2], top: '35%', left: '35%', rot: 2, z: 4 },
            { product: SS_PRODUCTS[6], top: '58%', left: '10%', rot: -1, z: 2 },
            { product: SS_PRODUCTS[14], top: '18%', left: '60%', rot: 4, z: 1 },
          ].map((item, i) => (
            <Reveal key={i} delay={300 + i * 150} y={40}>
              <div style={{
                position: 'absolute', top: item.top, left: item.left,
                width: 200, zIndex: item.z,
                transform: `rotate(${item.rot}deg)`,
                cursor: 'pointer',
              }} onClick={() => {}}>
                <TiltCard style={{
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderRadius: t.r, overflow: 'hidden',
                }}>
                  <PlaceholderImg label={item.product.category.toLowerCase()} style={{ borderRadius: 0, aspectRatio: '1.2' }} />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.accentText, marginBottom: 3 }}>{item.product.category}</div>
                    <div style={{
                      fontSize: 12, fontWeight: 500, color: t.text, lineHeight: 1.3,
                      display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{item.product.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif", marginTop: 4 }}>${item.product.price}</div>
                  </div>
                </TiltCard>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <FeaturesSection />
      <CTABanner />
    </div>
  );
}

// ── Layout B: Dashboard Hero ───────────────────────────────────
function LandingDashboard() {
  const { t, setPage } = useSSCtx();

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />

      {/* Hero with live data widgets */}
      <section style={{
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
        background: t.gradientHero, minHeight: 'calc(100vh - 60px)',
      }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -100, left: '30%', width: 500, height: 500, borderRadius: '50%', background: t.accent, opacity: 0.05, filter: 'blur(120px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row: headline + CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48, gap: 40 }}>
            <Reveal>
              <div>
                <Pill accent style={{ marginBottom: 16 }}><SSIcon name="zap" size={11} color={t.accent} /> Live Marketplace Data</Pill>
                <h1 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 48, fontWeight: 800,
                  color: t.text, lineHeight: 1.08, letterSpacing: '-0.04em', maxWidth: 500,
                }}>
                  Your marketplace,{' '}
                  <span style={{ background: t.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    intelligently powered.
                  </span>
                </h1>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div style={{ display: 'flex', gap: 10, paddingTop: 40 }}>
                <MagButton primary onClick={() => setPage({ name: 'products' })}>
                  Browse products <SSIcon name="arrow" size={15} color="#fff" />
                </MagButton>
                <MagButton secondary>Start selling</MagButton>
              </div>
            </Reveal>
          </div>

          {/* Dashboard grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              { icon: 'trending', label: 'Revenue Today', val: '$142,847', change: '+23.5%', up: true },
              { icon: 'package', label: 'Products Listed', val: '160,482', change: '+1,204', up: true },
              { icon: 'user', label: 'Active Users', val: '84,291', change: '+12.8%', up: true },
              { icon: 'chart', label: 'AI Matches', val: '285M+', change: '99.2% accuracy', up: true },
            ].map((s, i) => (
              <Reveal key={s.label} delay={100 + i * 80}>
                <TiltCard intensity={4} style={{
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderRadius: t.r, padding: 20, cursor: 'default',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: t.textFaint, fontWeight: 500 }}>{s.label}</span>
                    <div style={{
                      width: 32, height: 32, borderRadius: t.rXs, background: t.accentMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <SSIcon name={s.icon} size={15} color={t.accent} />
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: '-0.02em' }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 12, color: t.success, fontWeight: 500, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <SSIcon name="arrowUp" size={12} color={t.success} /> {s.change}
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          {/* Featured products row */}
          <Reveal delay={500}>
            <div style={{
              background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: t.r,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SSIcon name="sparkle" size={15} color={t.accent} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>AI Trending Now</span>
                </div>
                <button onClick={() => setPage({ name: 'products' })} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: t.accentText, fontWeight: 500,
                }}>View all →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {SS_PRODUCTS.filter(p => p.aiPick).slice(0, 5).map(p => (
                  <div key={p.id} onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                    cursor: 'pointer', borderRadius: t.rSm, overflow: 'hidden',
                    border: `1px solid ${t.borderSubtle}`, transition: 'all 0.2s',
                  }}>
                    <PlaceholderImg label={p.category.toLowerCase()} style={{ borderRadius: 0, aspectRatio: '1.1' }} />
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: t.text, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif", marginTop: 3 }}>${p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FeaturesSection />
      <CTABanner />
    </div>
  );
}

// ── Shared sections ────────────────────────────────────────────
function FeaturesSection() {
  const { t } = useSSCtx();
  const features = [
    { icon: 'sparkle', title: 'AI Discovery', desc: 'Smart recommendations that learn your taste and surface products you\'ll love.' },
    { icon: 'shield', title: 'Secure Payments', desc: 'End-to-end encrypted transactions with buyer protection on every order.' },
    { icon: 'chart', title: 'Seller Analytics', desc: 'Real-time dashboard to optimize listings and track revenue growth.' },
    { icon: 'truck', title: 'Fast Fulfillment', desc: 'Integrated logistics with live tracking from warehouse to doorstep.' },
    { icon: 'globe', title: 'Global Reach', desc: 'Sell to customers worldwide with multi-currency support built in.' },
    { icon: 'zap', title: 'Instant Setup', desc: 'Launch your storefront in minutes with our guided onboarding flow.' },
  ];

  return (
    <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 36, fontWeight: 800, color: t.text, letterSpacing: '-0.03em' }}>
            Everything you need
          </h2>
          <p style={{ fontSize: 15, color: t.textMuted, marginTop: 8, maxWidth: 400, margin: '8px auto 0' }}>
            Powerful tools for buyers, sellers, and administrators.
          </p>
        </div>
      </Reveal>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <TiltCard intensity={4} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: t.r, padding: 24, cursor: 'default', height: '100%',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: t.rXs, background: t.accentMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <SSIcon name={f.icon} size={18} color={t.accent} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 6, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>{f.desc}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CTABanner() {
  const { t, setPage } = useSSCtx();
  return (
    <section style={{ padding: '0 40px 60px', maxWidth: 1200, margin: '0 auto' }}>
      <Reveal>
        <div style={{
          borderRadius: t.r, overflow: 'hidden', position: 'relative',
          background: t.gradient, padding: '48px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 0.15)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Ready to get started?
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
              Join thousands of buyers and sellers on SellSight today.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 10 }}>
            <MagButton style={{ background: '#fff', color: '#111', border: 'none' }} onClick={() => setPage({ name: 'products' })}>
              Browse products
            </MagButton>
            <MagButton style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
              Create account
            </MagButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// PRODUCTS PAGE
// ════════════════════════════════════════════════════════════════

function SSProducts() {
  const { t, setPage, addToCart, gridLayout } = useSSCtx();
  const [search, setSearch] = useS('');
  const [cat, setCat] = useS('');

  const filtered = useM(() => {
    return SS_PRODUCTS.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cat && p.category !== cat) return false;
      return true;
    });
  }, [search, cat]);

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px 80px' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, fontWeight: 800, color: t.text, letterSpacing: '-0.03em' }}>Shop</h1>
              <p style={{ fontSize: 14, color: t.textMuted, marginTop: 4 }}>Discover products from quality sellers worldwide</p>
            </div>
            <div style={{ fontSize: 13, color: t.textFaint }}>{filtered.length} products</div>
          </div>
        </Reveal>

        {/* Filters */}
        <Reveal delay={80}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              flex: '0 1 280px', height: 40, borderRadius: t.rSm,
              background: t.bgInput, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8,
              transition: 'border-color 0.2s',
            }}>
              <SSIcon name="search" size={15} color={t.textFaint} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: t.text, fontFamily: "'Outfit', sans-serif" }}
              />
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['', ...SS_CATEGORIES].map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  height: 34, padding: '0 14px', borderRadius: 17,
                  background: cat === c ? t.accent : 'transparent',
                  color: cat === c ? '#fff' : t.textMuted,
                  border: cat === c ? 'none' : `1px solid ${t.border}`,
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s',
                }}>{c || 'All'}</button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        {gridLayout === 'editorial' ? (
          <EditorialGrid products={filtered} />
        ) : (
          <MasonryGrid products={filtered} />
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: t.textMuted }}>
            <SSIcon name="package" size={40} color={t.textFaint} />
            <p style={{ marginTop: 12, fontSize: 15, fontWeight: 500 }}>No products match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Editorial Grid (mixed sizes, featured hero) ────────────────
function EditorialGrid({ products }) {
  const { t, setPage, addToCart } = useSSCtx();
  const featured = products.filter(p => p.featured);
  const rest = products.filter(p => !p.featured);

  return (
    <div>
      {/* Featured — large cards */}
      {featured.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {featured.slice(0, 2).map((p, i) => (
            <Reveal key={p.id} delay={i * 100}>
              <TiltCard intensity={4} onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                borderRadius: t.r, overflow: 'hidden', cursor: 'pointer', height: '100%',
                display: 'flex', flexDirection: i === 0 ? 'row' : 'column',
              }}>
                <div style={{ flex: i === 0 ? '0 0 55%' : 'none', position: 'relative' }}>
                  <PlaceholderImg label={p.category.toLowerCase()} aspect={i === 0 ? 'auto' : '1.3'}
                    style={{ borderRadius: 0, height: i === 0 ? '100%' : 'auto' }} />
                  {p.aiPick && (
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <Pill gradient small><SSIcon name="sparkle" size={10} color="#fff" /> AI Pick</Pill>
                    </div>
                  )}
                </div>
                <div style={{ padding: i === 0 ? '24px 28px' : '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Pill accent small style={{ marginBottom: 10, alignSelf: 'flex-start' }}>{p.category}</Pill>
                  <h3 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: i === 0 ? 22 : 15, fontWeight: 700,
                    color: t.text, lineHeight: 1.2, marginBottom: 8,
                  }}>{p.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SSStars rating={p.rating} size={12} t={t} />
                    <span style={{ fontSize: 11, color: t.textFaint }}>({p.reviews})</span>
                  </div>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: i === 0 ? 26 : 18, fontWeight: 800,
                    color: t.text, marginTop: 12,
                  }}>${p.price}</div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      {/* Rest — standard grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {rest.map((p, i) => (
          <Reveal key={p.id} delay={i * 40}>
            <SSProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ── Masonry Grid ───────────────────────────────────────────────
function MasonryGrid({ products }) {
  const cols = [[], [], [], []];
  products.forEach((p, i) => cols[i % 4].push(p));

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {cols.map((col, ci) => (
        <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {col.map((p, i) => (
            <Reveal key={p.id} delay={(ci * 4 + i) * 40}>
              <SSProductCard product={p} tallImage={i % 3 === 0} />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────
function SSProductCard({ product: p, tallImage }) {
  const { t, setPage, addToCart } = useSSCtx();
  const [hover, setHover] = useS(false);

  return (
    <TiltCard intensity={6} onClick={() => setPage({ name: 'detail', id: p.id })} style={{
      background: t.bgCard, border: `1px solid ${t.border}`,
      borderRadius: t.r, overflow: 'hidden', cursor: 'pointer',
    }}>
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <PlaceholderImg label={p.category.toLowerCase()} aspect={tallImage ? '0.75' : '1'}
          style={{ borderRadius: 0 }} />
        {p.aiPick && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <Pill gradient small><SSIcon name="sparkle" size={10} color="#fff" /> AI Pick</Pill>
          </div>
        )}
        <button onClick={e => { e.stopPropagation(); addToCart(p); }} style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          height: 34, padding: '0 16px', borderRadius: 17,
          background: t.isDark ? 'rgba(255,255,255,0.92)' : '#fff',
          color: '#111', border: 'none', fontSize: 12, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          opacity: hover ? 1 : 0, transform: hover ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(6px)',
          transition: 'all 0.25s ease', fontFamily: "'Outfit', sans-serif",
          boxShadow: '0 4px 16px oklch(0 0 0 / 0.12)',
        }}>
          <SSIcon name="cart" size={12} color="#111" /> Add to cart
        </button>
      </div>
      <div style={{ padding: '12px 14px 16px' }}>
        <Pill accent small style={{ marginBottom: 6 }}>{p.category}</Pill>
        <h3 style={{
          fontSize: 13, fontWeight: 500, color: t.text, lineHeight: 1.35, marginBottom: 8,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{p.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>${p.price}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <SSStars rating={p.rating} size={11} t={t} />
            <span style={{ fontSize: 10, color: t.textFaint }}>({p.reviews})</span>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

// ════════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE
// ════════════════════════════════════════════════════════════════

function SSDetail({ id }) {
  const { t, setPage, addToCart } = useSSCtx();
  const p = SS_PRODUCTS.find(x => x.id === id) || SS_PRODUCTS[0];
  const [qty, setQty] = useS(1);
  const [tab, setTab] = useS('details');
  const [added, setAdded] = useS(false);

  useE(() => { setQty(1); setTab('details'); setAdded(false); }, [id]);

  const handleAdd = () => {
    addToCart(p, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const related = SS_PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 40px 80px' }}>
        {/* Breadcrumb */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: t.textFaint, marginBottom: 28 }}>
            <span style={{ cursor: 'pointer', color: t.textMuted }} onClick={() => setPage({ name: 'products' })}>Products</span>
            <span>›</span><span style={{ color: t.textMuted }}>{p.category}</span>
            <span>›</span><span style={{ color: t.text, fontWeight: 500 }}>{p.name.substring(0, 35)}...</span>
          </div>
        </Reveal>

        {/* Main — sticky image left, scrollable details right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56 }}>
          {/* Image column — sticky */}
          <Reveal>
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{
                aspectRatio: '0.9', borderRadius: t.r, overflow: 'hidden',
                border: `1px solid ${t.border}`, position: 'relative',
              }}>
                <PlaceholderImg label={`product shot — ${p.category.toLowerCase()}`} aspect="auto"
                  style={{ borderRadius: 0, height: '100%' }} />
                {p.aiPick && (
                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <Pill gradient><SSIcon name="sparkle" size={11} color="#fff" /> AI Recommended</Pill>
                  </div>
                )}
              </div>
              {/* Thumbnail row */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    flex: 1, aspectRatio: '1', borderRadius: t.rSm,
                    background: t.bgSurface, border: `2px solid ${i === 0 ? t.accent : t.borderSubtle}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'border-color 0.2s',
                  }}>
                    <SSIcon name="package" size={16} color={t.textFaint} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Details column */}
          <div>
            <Reveal>
              <div style={{ fontSize: 12, color: t.textFaint, marginBottom: 8 }}>by {p.seller}</div>
              <h1 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 800, color: t.text,
                lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 14,
              }}>{p.name}</h1>
            </Reveal>

            <Reveal delay={80}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <SSStars rating={p.rating} size={14} t={t} />
                <span style={{ fontSize: 13, color: t.textMuted }}>{p.rating} ({p.reviews} reviews)</span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div style={{
                fontSize: 36, fontWeight: 800, color: t.text,
                fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 20, letterSpacing: '-0.02em',
              }}>${p.price}</div>
            </Reveal>

            <Reveal delay={160}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                <Pill accent>{p.category}</Pill>
                <Pill style={{ background: p.stock !== false ? t.successMuted : t.dangerMuted, color: p.stock !== false ? t.success : t.danger }}>
                  {p.stock !== false ? 'In stock' : 'Out of stock'}
                </Pill>
                {p.aiPick && <Pill gradient><SSIcon name="sparkle" size={10} color="#fff" /> AI Pick</Pill>}
              </div>
            </Reveal>

            {/* Quantity */}
            <Reveal delay={200}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 8 }}>Quantity</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: t.rSm, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
                  {[
                    { icon: 'minus', fn: () => setQty(q => Math.max(1, q - 1)) },
                    null,
                    { icon: 'plus', fn: () => setQty(q => q + 1) },
                  ].map((item, i) => item ? (
                    <button key={i} onClick={item.fn} style={{
                      width: 42, height: 42, background: 'transparent', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.target.style.background = t.accentMuted}
                      onMouseLeave={e => e.target.style.background = 'transparent'}
                    >
                      <SSIcon name={item.icon} size={15} color={t.text} />
                    </button>
                  ) : (
                    <span key={i} style={{
                      width: 52, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: t.text, borderLeft: `1px solid ${t.border}`,
                      borderRight: `1px solid ${t.border}`,
                    }}>{qty}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Actions */}
            <Reveal delay={240}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <MagButton primary onClick={handleAdd} style={{ flex: 1, height: 52 }}>
                  {added ? (
                    <><SSIcon name="check" size={18} color="#fff" /> Added!</>
                  ) : (
                    <><SSIcon name="cart" size={17} color="#fff" /> Add to cart — ${(p.price * qty).toFixed(0)}</>
                  )}
                </MagButton>
                <MagButton secondary style={{ width: 52, height: 52, padding: 0 }}>
                  <SSIcon name="heart" size={18} color={t.textMuted} />
                </MagButton>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div style={{
                display: 'flex', gap: 20, padding: '16px 0', borderTop: `1px solid ${t.borderSubtle}`,
                borderBottom: `1px solid ${t.borderSubtle}`, marginBottom: 32,
              }}>
                {[
                  { icon: 'truck', text: 'Free delivery over $30' },
                  { icon: 'shield', text: 'Buyer protection' },
                ].map(x => (
                  <div key={x.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.textMuted }}>
                    <SSIcon name={x.icon} size={16} color={t.accent} /> {x.text}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Tabs */}
            <Reveal delay={320}>
              <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${t.borderSubtle}`, marginBottom: 24 }}>
                {['details', 'reviews'].map(tb => (
                  <button key={tb} onClick={() => setTab(tb)} style={{
                    height: 42, padding: '0 18px', fontSize: 13, fontWeight: 500,
                    color: tab === tb ? t.text : t.textFaint,
                    borderBottom: `2px solid ${tab === tb ? t.accent : 'transparent'}`,
                    background: 'transparent', border: 'none',
                    borderBottomWidth: 2, borderBottomStyle: 'solid',
                    borderBottomColor: tab === tb ? t.accent : 'transparent',
                    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}>{tb === 'reviews' ? `Reviews (${p.reviews})` : 'Details'}</button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={360}>
              {tab === 'details' ? (
                <p style={{ fontSize: 14, color: t.textMuted, lineHeight: 1.7, maxWidth: 500 }}>
                  Premium quality {p.name.toLowerCase()} from {p.seller}. Designed with meticulous attention to detail
                  and built with industry-leading materials. This product stands apart through superior craftsmanship
                  and thoughtful engineering that you can feel in every interaction.
                </p>
              ) : (
                <div style={{ display: 'flex', gap: 24 }}>
                  <div style={{
                    padding: 20, borderRadius: t.rSm, border: `1px solid ${t.border}`,
                    textAlign: 'center', minWidth: 120, background: t.bgCard,
                  }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{p.rating}</div>
                    <SSStars rating={p.rating} size={14} t={t} />
                    <div style={{ fontSize: 12, color: t.textMuted, marginTop: 6 }}>{p.reviews} reviews</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(n => {
                      const pct = n === 5 ? 60 : n === 4 ? 22 : n === 3 ? 10 : n === 2 ? 5 : 3;
                      return (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: t.textMuted, width: 12 }}>{n}</span>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: t.bgSurface, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: t.accent, transition: 'width 0.8s ease' }} />
                          </div>
                          <span style={{ fontSize: 11, color: t.textFaint, width: 30, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <Reveal>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 20 }}>
                You might also like
              </h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 60}>
                  <SSProductCard product={r} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CART PAGE — with progress steps
// ════════════════════════════════════════════════════════════════

function SSCart() {
  const { t, cart, setPage, updateCartQty, removeFromCart } = useSSCtx();
  const [step, setStep] = useS(0); // 0=cart, 1=shipping, 2=payment

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const shipping = subtotal >= 30 ? 0 : 5.99;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg }}>
        <SSNav />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: t.accentMuted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <SSIcon name="cart" size={32} color={t.accent} />
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: t.text }}>Your cart is empty</h2>
          <p style={{ fontSize: 14, color: t.textMuted, marginTop: 8, marginBottom: 28 }}>Browse our catalogue and add items to get started.</p>
          <MagButton primary onClick={() => setPage({ name: 'products' })}>
            Browse products <SSIcon name="arrow" size={15} color="#fff" />
          </MagButton>
        </div>
      </div>
    );
  }

  const steps = ['Cart', 'Shipping', 'Payment'];

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <SSNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 40px 80px' }}>
        {/* Progress bar */}
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div onClick={() => i <= step ? setStep(i) : null} style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: i <= step ? 'pointer' : 'default',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i <= step ? t.accent : t.bgSurface,
                    color: i <= step ? '#fff' : t.textFaint,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, transition: 'all 0.3s',
                    boxShadow: i === step ? `0 0 20px ${t.accentGlow}` : 'none',
                  }}>
                    {i < step ? <SSIcon name="check" size={14} color="#fff" /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: i === step ? 600 : 400,
                    color: i <= step ? t.text : t.textFaint, transition: 'all 0.3s',
                  }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: 80, height: 2, borderRadius: 1, margin: '0 12px',
                    background: i < step ? t.accent : t.borderSubtle,
                    transition: 'background 0.3s',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Reveal>

        {step === 0 && (
          <div style={{ display: 'flex', gap: 32 }}>
            {/* Items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cart.map(({ product: p, qty }, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <TiltCard intensity={3} style={{
                    display: 'flex', gap: 16, padding: 16, background: t.bgCard,
                    border: `1px solid ${t.border}`, borderRadius: t.r, cursor: 'default',
                  }}>
                    <div onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                      width: 88, height: 88, borderRadius: t.rSm, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                    }}>
                      <PlaceholderImg label={p.category.toLowerCase()} aspect="1" style={{ borderRadius: 0, height: '100%' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <Pill accent small style={{ marginBottom: 4 }}>{p.category}</Pill>
                        <div onClick={() => setPage({ name: 'detail', id: p.id })} style={{
                          fontSize: 14, fontWeight: 500, color: t.text, cursor: 'pointer', lineHeight: 1.3,
                        }}>{p.name}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: t.rXs, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
                          <button onClick={() => updateCartQty(p.id, qty - 1)} style={{
                            width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><SSIcon name="minus" size={13} color={t.text} /></button>
                          <span style={{
                            width: 34, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: t.text,
                            borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}`,
                          }}>{qty}</span>
                          <button onClick={() => updateCartQty(p.id, qty + 1)} style={{
                            width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}><SSIcon name="plus" size={13} color={t.text} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            ${(p.price * qty).toFixed(0)}
                          </span>
                          <button onClick={() => removeFromCart(p.id)} style={{
                            width: 30, height: 30, borderRadius: t.rXs, background: t.dangerMuted,
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s',
                          }}>
                            <SSIcon name="trash" size={14} color={t.danger} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            {/* Summary */}
            <Reveal delay={200}>
              <div style={{ width: 320, flexShrink: 0 }}>
                <div style={{
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderRadius: t.r, padding: 24, position: 'sticky', top: 80,
                }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 20, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Order Summary
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: t.textMuted }}>Subtotal ({itemCount})</span>
                      <span style={{ color: t.text, fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: t.textMuted }}>Shipping</span>
                      <span style={{ color: shipping === 0 ? t.success : t.text, fontWeight: 500 }}>
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 18, fontWeight: 800, color: t.text,
                    padding: '16px 0', borderTop: `1px solid ${t.borderSubtle}`,
                    marginBottom: 20, fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                  <MagButton primary onClick={() => setStep(1)} style={{ width: '100%', height: 50 }}>
                    Continue to shipping <SSIcon name="arrow" size={15} color="#fff" />
                  </MagButton>
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center' }}>
                    {[{ icon: 'shield', text: 'Secure checkout' }, { icon: 'truck', text: 'Free over $30' }].map(x => (
                      <div key={x.text} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.textFaint }}>
                        <SSIcon name={x.icon} size={12} color={t.textFaint} /> {x.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        )}

        {step === 1 && (
          <Reveal>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 24 }}>Shipping Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Full name', placeholder: 'Jane Doe' },
                  { label: 'Email', placeholder: 'jane@email.com' },
                  { label: 'Address', placeholder: '123 Market St' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <input placeholder={f.placeholder} style={{
                      width: '100%', height: 44, padding: '0 14px', borderRadius: t.rSm,
                      background: t.bgInput, border: `1px solid ${t.border}`,
                      color: t.text, fontSize: 14, fontFamily: "'Outfit', sans-serif",
                      outline: 'none', transition: 'border-color 0.2s',
                    }}
                      onFocus={e => e.target.style.borderColor = t.accent}
                      onBlur={e => e.target.style.borderColor = t.border}
                    />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 6, display: 'block' }}>City</label>
                    <input placeholder="San Francisco" style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: t.rSm, background: t.bgInput, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 6, display: 'block' }}>Postal code</label>
                    <input placeholder="94105" style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: t.rSm, background: t.bgInput, border: `1px solid ${t.border}`, color: t.text, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <MagButton secondary onClick={() => setStep(0)}>
                  <SSIcon name="arrowLeft" size={15} color={t.text} /> Back
                </MagButton>
                <MagButton primary onClick={() => setStep(2)} style={{ flex: 1 }}>
                  Continue to payment <SSIcon name="arrow" size={15} color="#fff" />
                </MagButton>
              </div>
            </div>
          </Reveal>
        )}

        {step === 2 && (
          <Reveal>
            <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: t.successMuted,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <SSIcon name="check" size={36} color={t.success} />
              </div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 8 }}>
                Order Confirmed!
              </h2>
              <p style={{ fontSize: 15, color: t.textMuted, marginBottom: 8 }}>
                Total: <strong style={{ color: t.text }}>${total.toFixed(2)}</strong>
              </p>
              <p style={{ fontSize: 14, color: t.textFaint, marginBottom: 32 }}>
                We'll send tracking details to your email shortly.
              </p>
              <MagButton primary onClick={() => { setStep(0); setPage({ name: 'products' }); }}>
                Continue shopping <SSIcon name="arrow" size={15} color="#fff" />
              </MagButton>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SSLanding, SSProducts, SSDetail, SSCart });

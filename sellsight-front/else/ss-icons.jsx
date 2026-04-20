// ── Icon System ────────────────────────────────────────────────

function SSIcon({ name, size = 18, color = 'currentColor', style: extraStyle }) {
  const s = { width: size, height: size, flexShrink: 0, display: 'block', ...extraStyle };
  const p = { style: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    search: <svg {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    cart: <svg {...p}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
    arrow: <svg {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    arrowLeft: <svg {...p}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>,
    arrowUp: <svg {...p}><path d="m18 15-6-6-6 6"/></svg>,
    star: <svg {...p} fill={color} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    heart: <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    minus: <svg {...p}><path d="M5 12h14"/></svg>,
    plus: <svg {...p}><path d="M12 5v14M5 12h14"/></svg>,
    trash: <svg {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    truck: <svg {...p}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    shield: <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
    sparkle: <svg {...p} fill={color} stroke="none"><path d="M12 2L14.4 8.8 22 10 16 15.2 17.6 22 12 18.4 6.4 22 8 15.2 2 10 9.6 8.8z"/></svg>,
    package: <svg {...p}><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>,
    user: <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    chart: <svg {...p}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
    check: <svg {...p} strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>,
    x: <svg {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
    credit: <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
    eye: <svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    sun: <svg {...p}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    moon: <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    grid: <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    layers: <svg {...p}><path d="m12 2 10 6.5v7L12 22 2 15.5v-7L12 2z"/><path d="M12 22v-6.5"/><path d="m22 8.5-10 7-10-7"/><path d="m2 15.5 10-7 10 7"/></svg>,
    zap: <svg {...p} fill={color} stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    globe: <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    trending: <svg {...p}><path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>,
  };
  return icons[name] || null;
}

function SSStars({ rating, size = 13, t }) {
  const full = Math.floor(rating);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <SSIcon key={i} name="star" size={size}
          color={i < full ? '#fbbf24' : (t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')} />
      ))}
    </div>
  );
}

Object.assign(window, { SSIcon, SSStars });

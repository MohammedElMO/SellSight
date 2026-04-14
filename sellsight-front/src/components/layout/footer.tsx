import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[#e5e4e0] bg-[#f7f6f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-block font-bold text-[22px] text-[#111] mb-3">
              SellSight
            </Link>
            <p className="text-sm text-[#666] leading-relaxed max-w-[180px]">
              The modern marketplace for quality products.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#999] mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {['About us', 'Careers', 'Stores', 'Partners'].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-[#666] hover:text-[#111] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#999] mb-4">
              Support
            </h4>
            <ul className="flex flex-col gap-3">
              {['Help Center', 'Delivery', 'Returns & Refunds', 'Track Order'].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-[#666] hover:text-[#111] transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#999] mb-4">
              Contacts
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-[#666]">
              <li>+1 (555) 000-0000</li>
              <li>
                <a
                  href="mailto:support@sellsight.com"
                  className="hover:text-[#111] transition-colors"
                >
                  support@sellsight.com
                </a>
              </li>
              <li className="text-[#999] text-xs mt-1">Mon–Fri, 9am–6pm EST</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e5e4e0]">
          <p className="text-xs text-[#999]">
            © 2026 SellSight. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs text-[#999] hover:text-[#111] transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

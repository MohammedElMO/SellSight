import { Navbar } from './navbar';
import { Footer } from './footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  raw?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function PageLayout({ children, title, subtitle, raw, className, style }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', ...style }}>
      <Navbar />
      <main
        className={cn(
          'flex-1',
          !raw && 'max-w-7xl mx-auto w-full px-4 sm:px-6 py-8',
          className
        )}
      >
        {title && (
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default PageLayout;

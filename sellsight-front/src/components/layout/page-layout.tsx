import { Navbar } from './navbar';
import { Footer } from './footer';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Remove the default horizontal padding / max-width wrapper */
  raw?: boolean;
  className?: string;
}

export function PageLayout({ children, raw, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main
        className={cn(
          'flex-1',
          !raw && 'max-w-7xl mx-auto w-full px-4 sm:px-6 py-8',
          className
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

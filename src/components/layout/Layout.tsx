import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { PageTransition } from '@/components/animation';

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  hideFooter?: boolean;
}

export const Layout = ({ children, hideNavigation = false, hideFooter = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNavigation && <Navigation />}
      <main className={!hideNavigation ? "pt-16 md:pt-20 flex-1" : "flex-1"}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

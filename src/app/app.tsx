import { useEffect } from 'react';

import { usePathname } from './router/hooks';
import { ThemeProvider, QueryProvider } from './providers';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export const App = ({ children }: Props) => {
  useScrollToTop();

  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
};

// ----------------------------------------------------------------------

const useScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import './globals.css';
import '../styles/components.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/theme-context';
// import { AnalysisProvider } from '@/contexts/analysis-context';
import { ErrorBoundary } from '@/components/common/error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legacy Code Analyzer - Modernization Dashboard',
  description: 'Automate legacy code inventory and complexity analysis for enterprise systems including Perl, TIBCO, and Pentaho.',
  keywords: ['legacy code', 'code analysis', 'complexity analyzer', 'modernization', 'perl', 'tibco', 'pentaho'],
  authors: [{ name: 'Legacy Code Analyzer Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <AnalysisProvider> */}
              {children}
            {/* </AnalysisProvider> */}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

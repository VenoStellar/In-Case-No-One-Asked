import Script from 'next/script';
import { SiteStructure } from './components/SiteStructure';

export const dynamic = 'force-static';

export default function Home() {
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" strategy="beforeInteractive" />
      <SiteStructure />
      <Script src="/legacy-app.js" strategy="afterInteractive" />
    </>
  );
}

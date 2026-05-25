import Script from 'next/script';
import { SiteStructure } from './components/SiteStructure';

export const dynamic = 'force-static';

export default function Home() {
  return (
    <>
      <SiteStructure />
      <Script src="/legacy-app.js" strategy="afterInteractive" />
    </>
  );
}

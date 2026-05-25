import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';

export const dynamic = 'force-static';

type LegacyDocument = {
  styles: string;
  body: string;
  script: string;
};

function getLegacyDocument(): LegacyDocument {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const styles = html.match(/<style>([\s\S]*?)<\/style>/i)?.[1] ?? '';
  const body = html.match(/<body>([\s\S]*?)<script>/i)?.[1] ?? '';
  const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i)?.[1] ?? '';

  return {
    styles,
    body,
    script: makeStartupSafe(script),
  };
}

function makeStartupSafe(script: string): string {
  const scriptWithSafeGlobals = script
    .replace(/\bsupabase\b/g, 'supabaseClient')
    .replace(/window\.supabaseClient/g, 'window.supabase');

  return scriptWithSafeGlobals.replace(
    /document\.addEventListener\('DOMContentLoaded', async \(\) => \{([\s\S]*?)\n\}\);/,
    (_match: string, startupBody: string) => `async function startLegacyApp() {${startupBody}\n}\nif (document.readyState === 'loading') {\n  document.addEventListener('DOMContentLoaded', startLegacyApp);\n} else {\n  startLegacyApp();\n}`,
  );
}

export default function Home() {
  const { styles, body, script } = getLegacyDocument();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" strategy="beforeInteractive" />
      <Script id="legacy-blog-app" strategy="afterInteractive">
        {script}
      </Script>
    </>
  );
}

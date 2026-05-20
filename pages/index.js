import fs from 'fs';
import path from 'path';
import Head from 'next/head';

export default function HomePage({ styleContent, bodyContent, scriptContent }) {
  return (
    <>
      <Head>
        <title>Gifty — Celebrate together.</title>
        <meta name="description" content="Gifty ti pomáha organizovať darčeky pre tvojich blízkych." />
        <meta property="og:title" content="Gifty — Celebrate together." />
        <meta property="og:url" content="https://gifty.cloud" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      </Head>
      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public', 'landing.html');
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract style
  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  const styleContent = styleMatch ? styleMatch[1] : '';

  // Extract body
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  const bodyContent = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/g, '') : '';

  // Extract last script (translations + logic)
  const scripts = [...content.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
  const scriptContent = scripts.length > 0 ? scripts[scripts.length - 1][1] : '';

  return { props: { styleContent, bodyContent, scriptContent } };
}

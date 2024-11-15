import { sql } from '@vercel/postgres'
import { track } from '@vercel/analytics'
import { Metadata, ResolvingMetadata } from 'next/types'

export async function generateMetadata(
  { params }: { params: { 'app-name': string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const appName = params['app-name']

  // Fetch title, description and image_url from database
  const result = await sql`SELECT title, description, image_url FROM apps WHERE app_name = ${appName}`
  const title = result.rows[0]?.title || appName
  const description = result.rows[0]?.description || `Check out ${appName} built using Widecanvas.ai`
  const imageUrl = result.rows[0]?.image_url || 'https://zupe.app/social-og.png'

  return {
    title,
    description,
    openGraph: {
      title: `${title} - Zupe App`,
      description,
      type: 'website',
      url: `https://zupe.app/${appName}`,
      siteName: title,
      images: [{
        url: imageUrl,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function AppPage({ params }: { params: { 'app-name': string } }) {
  const appName = params['app-name']

  try {
    // Fetch the HTML content based on the app-name
    const row = await sql`SELECT html FROM apps WHERE app_name = ${appName}`

    if (row.rows.length === 0) {
      throw new Error('App not found')
    }

    const injectEthereumScript = `
      <script>
        function injectEthereum() {
          if (typeof window.ethereum === 'undefined' && window.parent.ethereum) {
            window.ethereum = window.parent.ethereum;
            console.log('Injected parent window ethereum object');
          } else if (typeof window.ethereum === 'undefined') {
            console.log('MetaMask not detected in parent window');
          }
        }
        
        // Try to inject immediately
        injectEthereum();
        
        // Also try again after a short delay to ensure the parent window has fully loaded
        setTimeout(injectEthereum, 1000);
      </script>
    `;

    const modifiedHtml = injectEthereumScript + row.rows[0].html;

    return (
      <div>
        <iframe
          srcDoc={modifiedHtml}
          width={'100%'}
          height={'100%'}
          draggable={false}
          style={{ position: 'fixed', inset: 0 }}
        />
      </div>
    )
  } catch (e) {
    return (
      <div style={{ padding: 12 }}>
        Sorry, no app found with this name. It may have been deleted or never existed. <br />
        <br />
        <a style={{ color: 'blue' }} href="https://zupe.app">
          Go back
        </a>
      </div>
    )
  }
}
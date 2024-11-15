import { sql } from '@vercel/postgres'
import { track } from '@vercel/analytics'
import { LinkLockupLink } from '../../components/LinkLockupLink'

export default async function LinkPage({ params }: { params: { id: string } }) {
	const { id } = params
	try {
		const row = await sql`SELECT html FROM links WHERE shape_id = ${id}`

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
				<LinkLockupLink />
			</div>
		)
	} catch (e) {
		return (
			<div style={{ padding: 12 }}>
				Sorry, no link for this one. It must have been made before we added links! <br />
				<br />
				<a style={{ color: 'blue' }} href="https://widecanvas.ai">
					Go back
				</a>
			</div>
		)
	}
}

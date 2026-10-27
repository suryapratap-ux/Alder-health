// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import keystatic from '@keystatic/astro';

/*
 * The Keystatic admin is a React app served from two server-rendered routes, so
 * it is only mounted while `astro dev` is running. `astro build` stays a plain
 * static export with no adapter, no React and no CMS code in the output — the
 * pages read their content from the JSON files Keystatic writes.
 *
 * Set KEYSTATIC=1 to include the admin in a build, once the site is hosted
 * somewhere that can run a server.
 */
const withAdmin = process.argv.includes('dev') || process.env.KEYSTATIC === '1';

export default defineConfig({
	/*
	 * Set this to the production origin, e.g. 'https://alderhealth.com'.
	 * The layout builds <link rel="canonical">, og:url and the absolute
	 * og:image URL from it; while it is unset those tags are left out rather
	 * than written against a guessed domain.
	 */
	// site: 'https://example.com',

	integrations: withAdmin ? [react(), keystatic()] : [],
	...(withAdmin ? { adapter: node({ mode: 'standalone' }) } : {}),
});

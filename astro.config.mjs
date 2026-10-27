// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

/*
 * `output: 'static'` with an adapter means every page is prerendered to plain
 * HTML at build time, except the two routes Keystatic injects for its admin,
 * which it marks as server-rendered. So the public site is still a static
 * export carrying no React, and only /keystatic and /api/keystatic run as
 * functions.
 */
export default defineConfig({
	/*
	 * Set this to the production origin, e.g. 'https://alderhealth.com'.
	 * The layout builds <link rel="canonical">, og:url and the absolute
	 * og:image URL from it; while it is unset those tags are left out rather
	 * than written against a guessed domain.
	 */
	// site: 'https://example.com',

	output: 'static',
	adapter: vercel(),
	integrations: [react(), keystatic()],
});

// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

/*
 * Fail the build when the CMS has no Cloud project to write to.
 *
 * Without it keystatic.config.ts quietly falls back to editing local files,
 * which on a deployed site means an admin that appears to work and saves
 * nowhere. That check cannot stop a build on its own because its module body
 * only runs when the admin is requested, so it is repeated here, where the
 * failure is useful. loadEnv covers a local .env; process.env covers the
 * variables a host injects.
 */
const isBuild = process.argv.includes('build');
const env = loadEnv(isBuild ? 'production' : 'development', process.cwd(), '');
const cloudProject =
	env.PUBLIC_KEYSTATIC_CLOUD_PROJECT || process.env.PUBLIC_KEYSTATIC_CLOUD_PROJECT;

if (isBuild && !cloudProject) {
	throw new Error(
		'PUBLIC_KEYSTATIC_CLOUD_PROJECT is not set, so the CMS would have nowhere ' +
			'to write. Set it to "team/project" from your Keystatic Cloud account, in ' +
			".env locally and in the host's environment variables. See the README."
	);
}

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

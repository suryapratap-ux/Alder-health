// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

/*
 * Fail the build when the CMS has no repository to write to.
 *
 * keystatic.config.ts checks this too, but its module body only runs when the
 * admin is requested, so on its own a misconfigured deploy builds happily and
 * then throws in the browser. This runs while the build is running, where the
 * failure is useful. loadEnv covers a local .env; process.env covers the
 * variables a host injects.
 */
const isBuild = process.argv.includes('build');
const env = loadEnv(isBuild ? 'production' : 'development', process.cwd(), '');
const repo = env.PUBLIC_KEYSTATIC_GITHUB_REPO || process.env.PUBLIC_KEYSTATIC_GITHUB_REPO;

if (isBuild && !repo) {
	throw new Error(
		'PUBLIC_KEYSTATIC_GITHUB_REPO is not set, so the CMS would have nowhere to ' +
			'write. Set it to "owner/repository" in .env locally and in the host\'s ' +
			'environment variables. See the README.'
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

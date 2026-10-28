// @ts-check
import { defineConfig } from 'astro/config';

/*
 * A plain static build. Content is edited through Pages CMS
 * (https://pagescms.org), which runs as a hosted service against this
 * repository and commits to src/content/ — so the site itself needs no admin
 * routes, no adapter and no client-side framework.
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
});

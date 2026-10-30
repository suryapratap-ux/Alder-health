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
	 * The production origin. The layout builds <link rel="canonical">, og:url
	 * and the absolute og:image URL from it, so it has to name the site people
	 * actually visit. Change this when a custom domain is added, or search
	 * engines and link previews will keep pointing at the netlify.app address.
	 */
	site: 'https://alder-health.netlify.app',

	output: 'static',
});

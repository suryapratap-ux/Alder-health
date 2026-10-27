/*
 * Per-page copy, edited in the CMS and stored under src/content/pages/.
 * Image paths are converted to served URLs on the way out — see ./asset.
 */
import { withAssetUrls } from './asset';

import homeContent from '../content/pages/home.json';
import aboutContent from '../content/pages/about.json';
import findADoctorContent from '../content/pages/find-a-doctor.json';
import resourcesContent from '../content/pages/resources.json';
import helpContent from '../content/pages/help.json';

export const home = withAssetUrls(homeContent);
export const about = withAssetUrls(aboutContent);
export const findADoctor = withAssetUrls(findADoctorContent);
export const resourcesPage = withAssetUrls(resourcesContent);
export const help = withAssetUrls(helpContent);

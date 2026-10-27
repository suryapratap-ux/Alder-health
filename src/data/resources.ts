/*
 * Patient guides, shared by the home section and /resources. Edited in the CMS
 * and stored as JSON under src/content/guides/.
 */
export interface Resource {
	kicker: string;
	title: string;
	copy: string;
	order: number;
	photo: string;
	alt: string;
}

import { assetUrl } from './asset';

const entries = import.meta.glob<{ default: Resource }>('../content/guides/*.json', {
	eager: true,
});

export const resources: Resource[] = Object.values(entries)
	.map((module) => ({ ...module.default, photo: assetUrl(module.default.photo) }))
	.sort((a, b) => a.order - b.order);

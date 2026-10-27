/*
 * Fictional clinicians shown across the site. Names, specialties, credentials
 * and availability are illustrative examples taken from the Figma design, not
 * real people or real appointments.
 *
 * The records are edited in the CMS and stored as JSON under
 * src/content/clinicians/, one file per clinician. The file name is the slug,
 * so /doctors/emma-reed comes from src/content/clinicians/emma-reed.json.
 */
export interface Clinician {
	slug: string;
	order: number;
	name: string;
	specialty: string;
	clinic: string;
	clinicAddress: string;
	note: string;
	languages: string;
	languagesSentence: string;
	credentials: string;
	formats: string;
	nextVisit: string;
	visitLength: string;
	photo: string;
	photoWidth: number;
	photoHeight: number;
	/*
	 * An object-position value. The portraits were exported at different crops,
	 * so each one declares where its subject sits and every slot crops to the
	 * face rather than to a shared alignment.
	 */
	photoFocus: string;
	alt: string;
	profile: {
		headline: string;
		quote: string;
		paragraphs: string[];
		areasIntro: string;
		areas: string[];
		inPersonHeading: string;
		inPerson: string;
		video: string;
		whatToBring: string;
	};
}

import { assetUrl } from './asset';

const entries = import.meta.glob<{ default: Omit<Clinician, 'slug'> }>(
	'../content/clinicians/*.json',
	{ eager: true }
);

export const clinicians: Clinician[] = Object.entries(entries)
	.map(([file, module]) => ({
		slug: (file.split('/').at(-1) as string).replace(/\.json$/, ''),
		...module.default,
		photo: assetUrl(module.default.photo),
	}))
	.sort((a, b) => a.order - b.order);

export const getClinician = (slug: string) =>
	clinicians.find((clinician) => clinician.slug === slug);

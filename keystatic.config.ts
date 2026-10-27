import { collection, config, fields, singleton } from '@keystatic/core';

/*
 * Keystatic content schema.
 *
 * Content is stored as JSON under src/content/ and read by the pages as plain
 * JSON imports, so none of this file ends up in the production build — the
 * admin only runs during `astro dev` (see astro.config.mjs).
 *
 * The demo application screens (booking, review, confirmation, dashboard) are
 * deliberately not modelled here: their text is interface labelling over
 * fictional appointment data, not editorial copy.
 */

/* Shared field shapes ----------------------------------------------------- */

const seo = () =>
	fields.object(
		{
			title: fields.text({
				label: 'Browser title',
				description: 'Shown in the tab and in search results.',
				validation: { length: { min: 1 } },
			}),
			description: fields.text({
				label: 'Meta description',
				multiline: true,
				description: 'One or two sentences for search results and link previews.',
				validation: { length: { min: 1 } },
			}),
		},
		{ label: 'Search and social' }
	);

const link = (label: string) =>
	fields.object(
		{
			label: fields.text({ label: 'Label' }),
			href: fields.text({ label: 'Link' }),
		},
		{ label }
	);

const photo = (label = 'Photograph') =>
	fields.object(
		{
			src: fields.pathReference({
				label: 'Image',
				pattern: 'public/images/*',
			}),
			alt: fields.text({ label: 'Alt text', multiline: true }),
		},
		{ label }
	);

/*
 * Which repository the CMS reads and writes. Kept in an environment variable
 * rather than hard-coded so the same code runs against a fork, and so the value
 * is set in one place alongside the GitHub App credentials. PUBLIC_ because
 * the admin is a browser app and needs it too.
 */
const repo = import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO;

/*
 * With the repository set, the CMS reads and writes through GitHub, so the
 * deployed site can be edited by anyone with access. Without it, it falls back
 * to the working copy on disk, which keeps `npm run dev` usable on a fresh
 * clone before the GitHub App exists. A production build has no such excuse,
 * so it fails loudly rather than deploying a CMS that writes nowhere.
 */
if (!repo && import.meta.env.PROD) {
	throw new Error(
		'PUBLIC_KEYSTATIC_GITHUB_REPO is not set. It should be "owner/repository" — ' +
			'copy .env.example to .env and fill it in, and set it on the host. See the README.'
	);
}

export default config({
	storage: repo ? { kind: 'github', repo } : { kind: 'local' },

	ui: {
		brand: { name: 'Alder Health' },
		navigation: {
			Pages: ['home', 'about', 'findADoctor', 'resourcesPage', 'help'],
			Content: ['clinicians', 'faqs', 'guides'],
			'Site-wide': ['settings'],
		},
	},

	singletons: {
		/* Header, footer and anything else repeated on every page ------------- */
		settings: singleton({
			label: 'Header & footer',
			path: 'src/content/settings',
			format: { data: 'json' },
			schema: {
				brandName: fields.text({ label: 'Brand name', description: 'Used in page titles and link previews.' }),
				wordmark: fields.text({ label: 'Wordmark', description: 'The logotype in the header and footer.' }),
				findCare: fields.object(
					{
						label: fields.text({ label: 'Menu label' }),
						items: fields.array(link('Item'), {
							label: 'Find care menu',
							itemLabel: (props) => props.fields.label.value,
						}),
					},
					{ label: 'Find care dropdown' }
				),
				primaryNav: fields.array(link('Link'), {
					label: 'Main navigation',
					itemLabel: (props) => props.fields.label.value,
				}),
				headerActions: fields.object(
					{
						account: link('Account link'),
						book: link('Booking button'),
						menu: fields.text({ label: 'Mobile menu label' }),
					},
					{ label: 'Header actions' }
				),
				footer: fields.object(
					{
						tagline: fields.text({ label: 'Tagline', multiline: true }),
						support: fields.text({ label: 'Support line', multiline: true }),
						email: fields.text({ label: 'Contact email' }),
						columns: fields.array(
							fields.object({
								title: fields.text({ label: 'Column title' }),
								links: fields.array(link('Link'), {
									label: 'Links',
									itemLabel: (props) => props.fields.label.value,
								}),
							}),
							{ label: 'Footer columns', itemLabel: (props) => props.fields.title.value }
						),
						legal: fields.text({
							label: 'Legal line',
							multiline: true,
							description: 'The © symbol and the current year are added automatically.',
						}),
						policyLinks: fields.array(link('Link'), {
							label: 'Policy links',
							itemLabel: (props) => props.fields.label.value,
						}),
					},
					{ label: 'Footer' }
				),
			},
		}),

		/* Home ---------------------------------------------------------------- */
		home: singleton({
			label: 'Home page',
			path: 'src/content/pages/home',
			format: { data: 'json' },
			schema: {
				seo: seo(),

				hero: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						lead: fields.text({ label: 'Lead paragraph', multiline: true }),
						primaryCta: link('Primary button'),
						secondaryCta: link('Secondary button'),
						formats: fields.text({ label: 'Formats line' }),
						image: photo(),
						caption: fields.text({ label: 'Caption' }),
					},
					{ label: 'Hero' }
				),

				services: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						intro: fields.text({ label: 'Intro', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
						items: fields.array(
							fields.object({
								index: fields.text({ label: 'Number' }),
								title: fields.text({ label: 'Title' }),
								copy: fields.text({ label: 'Copy', multiline: true }),
							}),
							{ label: 'Services', itemLabel: (props) => props.fields.title.value }
						),
					},
					{ label: 'Services' }
				),

				benefits: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						items: fields.array(
							fields.object({
								icon: fields.pathReference({
									label: 'Icon',
									pattern: 'public/icons/*',
								}),
								title: fields.text({ label: 'Title' }),
								copy: fields.text({ label: 'Copy', multiline: true }),
							}),
							{ label: 'Benefits', itemLabel: (props) => props.fields.title.value }
						),
					},
					{ label: 'Care benefits' }
				),

				search: fields.object(
					{
						heading: fields.text({ label: 'Heading' }),
						queryLabel: fields.text({ label: 'Query label' }),
						queryPlaceholder: fields.text({ label: 'Query placeholder' }),
						clinicLabel: fields.text({ label: 'Clinic label' }),
						visitLabel: fields.text({ label: 'Visit type label' }),
						submitLabel: fields.text({ label: 'Button label' }),
						note: fields.text({ label: 'Note', multiline: true }),
						clinics: fields.array(fields.text({ label: 'Clinic' }), { label: 'Clinic options' }),
						visitTypes: fields.array(fields.text({ label: 'Visit type' }), {
							label: 'Visit type options',
						}),
					},
					{ label: 'Search panel' }
				),

				featured: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						intro: fields.text({ label: 'Intro', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
						cardLinkLabel: fields.text({ label: 'Card link label' }),
					},
					{ label: 'Featured clinicians' }
				),

				network: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
							label: 'Paragraphs',
						}),
						clinicLinks: fields.array(link('Clinic link'), {
							label: 'Clinic links',
							itemLabel: (props) => props.fields.label.value,
						}),
						credit: fields.text({ label: 'Image credit' }),
						image: photo(),
					},
					{ label: 'Local network' }
				),

				perspective: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						quote: fields.text({ label: 'Quote', multiline: true }),
						attribution: fields.text({ label: 'Attribution', multiline: true }),
					},
					{ label: 'Patient perspective' }
				),

				resources: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						ctaLabel: fields.text({ label: 'Button label' }),
						cardLinkLabel: fields.text({ label: 'Card link label' }),
					},
					{ label: 'Educational resources' }
				),

				faq: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						supporting: fields.text({ label: 'Supporting copy', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
					},
					{ label: 'Frequently asked' }
				),

				invitation: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						supporting: fields.text({ label: 'Supporting copy', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
					},
					{ label: 'Booking invitation' }
				),
			},
		}),

		/* About ---------------------------------------------------------------- */
		about: singleton({
			label: 'About page',
			path: 'src/content/pages/about',
			format: { data: 'json' },
			schema: {
				seo: seo(),
				intro: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						title: fields.text({ label: 'Title' }),
						lead: fields.text({ label: 'Lead', multiline: true }),
					},
					{ label: 'Page introduction' }
				),
				network: fields.object(
					{
						heading: fields.text({ label: 'Heading' }),
						paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
							label: 'Paragraphs',
						}),
						ctaLabel: fields.text({ label: 'Button label' }),
						image: photo(),
					},
					{ label: 'Network' }
				),
				clinics: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						linkLabel: fields.text({ label: 'Card link label' }),
						items: fields.array(
							fields.object({
								id: fields.text({ label: 'Anchor id' }),
								name: fields.text({ label: 'Clinic name' }),
								address: fields.text({ label: 'Address' }),
								copy: fields.text({ label: 'Copy', multiline: true }),
							}),
							{ label: 'Clinics', itemLabel: (props) => props.fields.name.value }
						),
					},
					{ label: 'Clinics' }
				),
				video: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						copy: fields.text({ label: 'Copy', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
						teamLabel: fields.text({ label: 'Clinician list label' }),
					},
					{ label: 'Video consultations' }
				),
				notice: fields.object(
					{
						title: fields.text({ label: 'Title' }),
						copy: fields.text({ label: 'Copy', multiline: true }),
					},
					{ label: 'Disclosure notice' }
				),
			},
		}),

		/* Find a doctor --------------------------------------------------------- */
		findADoctor: singleton({
			label: 'Find a doctor page',
			path: 'src/content/pages/find-a-doctor',
			format: { data: 'json' },
			schema: {
				seo: seo(),
				intro: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						title: fields.text({ label: 'Title' }),
						lead: fields.text({ label: 'Lead', multiline: true }),
					},
					{ label: 'Page introduction' }
				),
				search: fields.object(
					{
						queryLabel: fields.text({ label: 'Query label' }),
						queryPlaceholder: fields.text({ label: 'Query placeholder' }),
						clinicLabel: fields.text({ label: 'Clinic label' }),
						submitLabel: fields.text({ label: 'Button label' }),
						specialties: fields.array(fields.text({ label: 'Specialty' }), {
							label: 'Specialty options',
						}),
						clinics: fields.array(fields.text({ label: 'Clinic' }), { label: 'Clinic options' }),
					},
					{ label: 'Search' }
				),
			},
		}),

		/* Resources ------------------------------------------------------------- */
		resourcesPage: singleton({
			label: 'Resources page',
			path: 'src/content/pages/resources',
			format: { data: 'json' },
			schema: {
				seo: seo(),
				intro: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						title: fields.text({ label: 'Title' }),
						lead: fields.text({ label: 'Lead', multiline: true }),
					},
					{ label: 'Page introduction' }
				),
				cardLinkLabel: fields.text({ label: 'Guide card link label' }),
				guidance: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						items: fields.array(
							fields.object({
								title: fields.text({ label: 'Title' }),
								copy: fields.text({ label: 'Copy', multiline: true }),
							}),
							{ label: 'Guidance', itemLabel: (props) => props.fields.title.value }
						),
					},
					{ label: 'Before your visit' }
				),
				next: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						copy: fields.text({ label: 'Copy', multiline: true }),
						primaryCta: link('Primary button'),
						secondaryCta: link('Secondary button'),
					},
					{ label: 'Next step' }
				),
				notice: fields.object(
					{
						title: fields.text({ label: 'Title' }),
						copy: fields.text({ label: 'Copy', multiline: true }),
					},
					{ label: 'Disclosure notice' }
				),
			},
		}),

		/* Help ------------------------------------------------------------------ */
		help: singleton({
			label: 'Help page',
			path: 'src/content/pages/help',
			format: { data: 'json' },
			schema: {
				seo: seo(),
				intro: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						title: fields.text({ label: 'Title' }),
						lead: fields.text({ label: 'Lead', multiline: true }),
					},
					{ label: 'Page introduction' }
				),
				faq: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						supporting: fields.text({ label: 'Supporting copy', multiline: true }),
						ctaLabel: fields.text({ label: 'Button label' }),
					},
					{ label: 'Questions' }
				),
				contact: fields.object(
					{
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						routes: fields.array(
							fields.object({
								label: fields.text({ label: 'Label' }),
								value: fields.text({ label: 'Value' }),
								copy: fields.text({ label: 'Copy', multiline: true }),
							}),
							{ label: 'Contact routes', itemLabel: (props) => props.fields.label.value }
						),
						notice: fields.object(
							{
								title: fields.text({ label: 'Title' }),
								copy: fields.text({ label: 'Copy', multiline: true }),
							},
							{ label: 'Notice' }
						),
					},
					{ label: 'Contact' }
				),
				policies: fields.array(
					fields.object({
						id: fields.text({ label: 'Anchor id' }),
						eyebrow: fields.text({ label: 'Eyebrow' }),
						heading: fields.text({ label: 'Heading' }),
						paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
							label: 'Paragraphs',
						}),
					}),
					{ label: 'Policy sections', itemLabel: (props) => props.fields.heading.value }
				),
			},
		}),
	},

	collections: {
		/* Clinicians ------------------------------------------------------------ */
		clinicians: collection({
			label: 'Clinicians',
			slugField: 'name',
			path: 'src/content/clinicians/*',
			format: { data: 'json' },
			columns: ['name', 'specialty', 'clinic'],
			schema: {
				name: fields.slug({ name: { label: 'Name' } }),
				order: fields.integer({
					label: 'Order',
					description: 'Lower numbers appear first in the directory and on the home page.',
					defaultValue: 1,
				}),
				specialty: fields.text({ label: 'Specialty' }),
				clinic: fields.text({ label: 'Clinic' }),
				clinicAddress: fields.text({ label: 'Clinic address' }),
				note: fields.text({ label: 'Card note' }),
				languages: fields.text({ label: 'Languages' }),
				languagesSentence: fields.text({ label: 'Languages sentence', multiline: true }),
				credentials: fields.text({ label: 'Credentials' }),
				formats: fields.text({ label: 'Visit formats' }),
				nextVisit: fields.text({ label: 'Next example visit' }),
				visitLength: fields.text({ label: 'Visit length' }),

				photo: fields.pathReference({
					label: 'Portrait',
					pattern: 'public/images/*',
				}),
				photoWidth: fields.integer({ label: 'Portrait width (px)' }),
				photoHeight: fields.integer({ label: 'Portrait height (px)' }),
				photoFocus: fields.text({
					label: 'Portrait focal point',
					description:
						'An object-position value such as "52% 20%". Keeps the face in frame when the photo is cropped to different shapes.',
				}),
				alt: fields.text({ label: 'Portrait alt text', multiline: true }),

				profile: fields.object(
					{
						headline: fields.text({ label: 'Headline' }),
						quote: fields.text({ label: 'Quote', multiline: true }),
						paragraphs: fields.array(fields.text({ label: 'Paragraph', multiline: true }), {
							label: 'Paragraphs',
						}),
						areasIntro: fields.text({ label: 'Areas intro', multiline: true }),
						areas: fields.array(fields.text({ label: 'Area' }), { label: 'Areas of focus' }),
						inPersonHeading: fields.text({ label: 'In-person heading' }),
						inPerson: fields.text({ label: 'In-person copy', multiline: true }),
						video: fields.text({ label: 'Video copy', multiline: true }),
						whatToBring: fields.text({ label: 'What to bring', multiline: true }),
					},
					{ label: 'Profile page' }
				),
			},
		}),

		/* Questions -------------------------------------------------------------- */
		faqs: collection({
			label: 'Questions',
			slugField: 'question',
			path: 'src/content/faqs/*',
			format: { data: 'json' },
			columns: ['question'],
			schema: {
				question: fields.slug({ name: { label: 'Question' } }),
				answer: fields.text({ label: 'Answer', multiline: true }),
				order: fields.integer({
					label: 'Order',
					description: 'Lower numbers appear first.',
					defaultValue: 1,
				}),
				open: fields.checkbox({
					label: 'Open by default',
					description: 'Only one question can be open at a time, so tick this on one only.',
					defaultValue: false,
				}),
			},
		}),

		/* Guides ----------------------------------------------------------------- */
		guides: collection({
			label: 'Guides',
			slugField: 'title',
			path: 'src/content/guides/*',
			format: { data: 'json' },
			columns: ['title', 'kicker'],
			schema: {
				title: fields.slug({ name: { label: 'Title' } }),
				kicker: fields.text({ label: 'Kicker' }),
				copy: fields.text({ label: 'Copy', multiline: true }),
				order: fields.integer({ label: 'Order', defaultValue: 1 }),
				photo: fields.pathReference({
					label: 'Cover image',
					pattern: 'public/images/*',
				}),
				alt: fields.text({ label: 'Cover alt text', multiline: true }),
			},
		}),
	},
});

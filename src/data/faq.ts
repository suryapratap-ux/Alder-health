/*
 * Frequently asked questions, shared by the home page and /help.
 *
 * Edited in the CMS and stored as JSON under src/content/faqs/. The accordion
 * shows one answer at a time, so only one question should be marked open.
 */
export interface Question {
	question: string;
	answer: string;
	order: number;
	open?: boolean;
}

const entries = import.meta.glob<{ default: Question }>('../content/faqs/*.json', {
	eager: true,
});

export const questions: Question[] = Object.values(entries)
	.map((module) => module.default)
	.sort((a, b) => a.order - b.order);

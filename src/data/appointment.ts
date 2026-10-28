/*
 * The example appointment carried through the booking flow, the confirmation
 * and the patient dashboard. Every value is fictional — the Figma design shows
 * the same example visit on each screen.
 *
 * The appointment and patient details are edited in the CMS. The calendar
 * grid, the time slots and the progress states below are not: they describe
 * how those controls render rather than what they say, and a month label that
 * disagreed with its day count would draw a calendar that cannot exist.
 */
import record from '../content/appointment.json';

export const exampleAppointment = record.appointment;
export const examplePatient = record.patient;

/* November 2026 starts on a Sunday; dates with example availability are underlined. */
export const calendar = {
	monthLabel: 'November 2026',
	/* The same month as a date, so the controls can move off it. */
	year: 2026,
	monthIndex: 10,
	weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	days: 30,
	startWeekday: 0,
	selected: 4,
	available: [5, 6, 9, 10],
};

export const timeSlots = [
	{ label: '9:00 AM', selected: false },
	{ label: '10:00 AM', selected: true },
	{ label: '11:30 AM', selected: false },
	{ label: '2:00 PM', selected: false },
	{ label: '3:30 PM', selected: false },
];

export const bookingSteps = [
	{ label: 'Care', state: 'done' as const },
	{ label: 'Time', state: 'current' as const },
	{ label: 'Details', state: 'upcoming' as const },
	{ label: 'Review', state: 'upcoming' as const },
];

/*
 * Copy for these screens names the clinician and the patient, so the strings
 * carry placeholders the templates fill in.
 */
export const fill = (text: string, values: Record<string, string>) =>
	text.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);

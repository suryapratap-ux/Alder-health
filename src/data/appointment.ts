/*
 * The example appointment carried through the booking flow, the confirmation
 * and the patient dashboard. Every value is fictional — the Figma design shows
 * the same example visit on each screen.
 */
export const exampleAppointment = {
	clinicianSlug: 'emma-reed',
	reference: 'AH-20481',
	dateShort: 'Wed, Nov 4, 2026',
	dayLabel: 'Wednesday, November 4',
	dayLong: 'Wednesday, November 4, 2026',
	time: '10:00 AM',
	timeRange: '10:00–10:30 AM Eastern Time',
	format: 'In-person · 30 minutes',
	duration: '30 minutes',
	visitLabel: '30-minute visits',
	timezone: 'Eastern Time (ET)',
};

/* Fictional patient details. No medical history is collected anywhere in this demo. */
export const examplePatient = {
	name: 'Jordan Lee',
	email: 'jordan@example.com',
	phone: 'Not provided (optional)',
	accessNeeds: 'None shared',
};

/* November 2026 starts on a Sunday; dates with example availability are underlined. */
export const calendar = {
	monthLabel: 'November 2026',
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

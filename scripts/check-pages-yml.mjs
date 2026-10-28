/*
 * Cross-checks .pages.yml against the JSON it claims to describe.
 *
 * A field declared in the CMS that does not exist in the data means the editor
 * shows an empty box and writes a key nothing reads. A key in the data that
 * the CMS does not declare is worse: Pages CMS writes back only what it knows
 * about, so the first save would silently drop it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.argv[2] ?? process.cwd();
const YAML = createRequire(path.join(root, 'package.json'))('yaml');
const config = YAML.parse(fs.readFileSync(path.join(root, '.pages.yml'), 'utf8'));
const components = config.components ?? {};

const problems = [];
let checkedFields = 0;
const summary = [];

/* A field entry may reference a shared component instead of declaring a type. */
const resolve = (field) => {
	if (!field.component) return field;
	const base = components[field.component];
	if (!base) {
		problems.push(`unknown component "${field.component}" on field "${field.name}"`);
		return field;
	}
	return { ...base, ...field, fields: field.fields ?? base.fields, type: base.type };
};

/* Walk a field list against the value actually stored at that level. */
function compare(fields, value, where) {
	if (value === undefined || value === null) return;

	const declared = new Set();

	for (const raw of fields ?? []) {
		const field = resolve(raw);
		declared.add(field.name);
		checkedFields++;

		const actual = value[field.name];
		if (actual === undefined) {
			problems.push(`${where}.${field.name} — declared in .pages.yml, missing from the JSON`);
			continue;
		}

		const isList = field.list === true || (field.list && typeof field.list === 'object');

		if (isList) {
			if (!Array.isArray(actual)) {
				problems.push(`${where}.${field.name} — declared as a list, JSON has ${typeof actual}`);
				continue;
			}
			if (field.type === 'object') {
				actual.forEach((item, i) => compare(field.fields, item, `${where}.${field.name}[${i}]`));
			}
			continue;
		}

		if (field.type === 'object') {
			if (typeof actual !== 'object' || Array.isArray(actual)) {
				problems.push(`${where}.${field.name} — declared as an object, JSON has ${Array.isArray(actual) ? 'array' : typeof actual}`);
				continue;
			}
			compare(field.fields, actual, `${where}.${field.name}`);
			continue;
		}

		if (field.type === 'number' && typeof actual !== 'number') {
			problems.push(`${where}.${field.name} — declared as a number, JSON has ${typeof actual}`);
		}
		if (field.type === 'boolean' && typeof actual !== 'boolean') {
			problems.push(`${where}.${field.name} — declared as a boolean, JSON has ${typeof actual}`);
		}
	}

	/* Anything in the data the CMS does not know about would be lost on save. */
	for (const key of Object.keys(value)) {
		if (!declared.has(key)) problems.push(`${where}.${key} — in the JSON but NOT declared, would be dropped on save`);
	}
}

/* Flatten groups so files and collections are checked wherever they sit. */
function* entries(items) {
	for (const item of items ?? []) {
		if (item.type === 'group') yield* entries(item.items);
		else yield item;
	}
}

for (const entry of entries(config.content)) {
	if (entry.type === 'file') {
		const file = path.join(root, entry.path);
		if (!fs.existsSync(file)) {
			problems.push(`${entry.name} — path not found: ${entry.path}`);
			continue;
		}
		compare(entry.fields, JSON.parse(fs.readFileSync(file, 'utf8')), entry.name);
		summary.push(`  file       ${entry.label.padEnd(22)} ${entry.path}`);
	}

	if (entry.type === 'collection') {
		const dir = path.join(root, entry.path);
		if (!fs.existsSync(dir)) {
			problems.push(`${entry.name} — path not found: ${entry.path}`);
			continue;
		}
		const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
		for (const f of files) {
			compare(entry.fields, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), `${entry.name}/${f}`);
		}
		summary.push(`  collection ${entry.label.padEnd(22)} ${entry.path} (${files.length} entries)`);
	}
}

/* Media sources must point at folders that exist. */
for (const source of Array.isArray(config.media) ? config.media : [config.media]) {
	if (!source) continue;
	const dir = path.join(root, source.input);
	if (!fs.existsSync(dir)) problems.push(`media "${source.name}" — input folder missing: ${source.input}`);
	else summary.push(`  media      ${String(source.label).padEnd(22)} ${source.input} -> ${source.output}`);
}

console.log('YAML parsed OK\n');
console.log(summary.join('\n'));
console.log(`\n${checkedFields} field checks across the content`);

if (problems.length) {
	console.log(`\n${problems.length} PROBLEM(S):`);
	for (const p of problems) console.log('  - ' + p);
	process.exit(1);
}
console.log('\nno mismatches between .pages.yml and the JSON');

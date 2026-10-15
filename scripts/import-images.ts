// Converts a MySQL `images` TSV export into SQL for D1, preserving ids.
// Usage: node scripts/import-images.ts images.tsv [images-import.sql] [--dry-run]
import { readFileSync, writeFileSync } from 'node:fs';

interface Row {
	line: number;
	id: number;
	url: string;
}

function sqlString(value: string): string {
	return `'${value.replaceAll('\'', '\'\'')}'`;
}

function isValidUrl(value: string): boolean {
	if (!URL.canParse(value)) {
		return false;
	}
	const { protocol } = new URL(value);
	return protocol === 'http:' || protocol === 'https:';
}

// mysql --batch escapes tab, newline and backslash in values.
function unescapeMysqlBatch(value: string): string {
	return value.replace(/\\([\\tn0])/g, (_match, char: string) => {
		if (char === 't') {
			return '\t';
		}
		if (char === 'n') {
			return '\n';
		}
		if (char === '0') {
			return '\0';
		}
		return '\\';
	});
}

function parseTsv(content: string): { rows: Row[]; malformed: number[] } {
	const lines = content.split(/\r?\n/);
	const header = lines[0]?.trim();
	if (header !== 'id\turl') {
		throw new Error(`expected header "id\\turl", got ${JSON.stringify(header)}`);
	}

	const rows: Row[] = [];
	const malformed: number[] = [];
	lines.slice(1).forEach((text, index) => {
		const line = index + 2;
		if (text === '') {
			return;
		}
		const [rawId, rawUrl, ...extra] = text.split('\t');
		const id = Number(rawId);
		if (!Number.isInteger(id) || id <= 0 || rawUrl === undefined || extra.length > 0) {
			malformed.push(line);
			return;
		}
		rows.push({ line, id, url: unescapeMysqlBatch(rawUrl) });
	});
	return { rows, malformed };
}

function main(): void {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const [input, output = 'images-import.sql'] = args.filter((arg) => arg !== '--dry-run');
	if (!input) {
		console.error('usage: node scripts/import-images.ts <images.tsv> [output.sql] [--dry-run]');
		process.exit(1);
	}

	const { rows, malformed } = parseTsv(readFileSync(input, 'utf8'));
	const seen = new Set<number>();
	const duplicateIds = new Set<number>();
	for (const row of rows) {
		if (seen.has(row.id)) {
			duplicateIds.add(row.id);
		}
		seen.add(row.id);
	}
	const invalidUrls = rows.filter((row) => !isValidUrl(row.url));
	const statements = rows.map((row) => `INSERT INTO images (id, url) VALUES (${row.id}, ${sqlString(row.url)});`);

	if (dryRun) {
		const ids = rows.map((row) => row.id);
		console.log(`rows: ${rows.length}`);
		if (ids.length > 0) {
			console.log(`id range: ${Math.min(...ids)}..${Math.max(...ids)}`);
		}
		console.log(`malformed lines: ${malformed.length ? malformed.join(', ') : 'none'}`);
		console.log(`duplicate ids: ${duplicateIds.size ? [...duplicateIds].join(', ') : 'none'}`);
		console.log(`empty/invalid urls: ${invalidUrls.length ? '' : 'none'}`);
		for (const row of invalidUrls) {
			console.log(`  line ${row.line} id ${row.id}: ${JSON.stringify(row.url)}`);
		}
		console.log('first statements:');
		statements.slice(0, 3).forEach((statement) => console.log(`  ${statement}`));
		console.log('last statements:');
		statements.slice(-3).forEach((statement) => console.log(`  ${statement}`));
		console.log(`dry run: ${output} not written`);
		return;
	}

	if (malformed.length || duplicateIds.size || invalidUrls.length) {
		console.error('refusing to write: run with --dry-run to see malformed lines, duplicate ids or invalid urls');
		process.exit(1);
	}

	writeFileSync(output, `${statements.join('\n')}\n`);
	console.log(`wrote ${statements.length} statements to ${output}`);
}

main();

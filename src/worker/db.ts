import type { Image } from '../shared/types';

export function getRandomImage(db: D1Database): Promise<Image | null> {
	return db.prepare('SELECT id, url FROM images ORDER BY RANDOM() LIMIT 1').first<Image>();
}

export async function getImageById(db: D1Database, rawId: string): Promise<Image | null> {
	// Mirrors Rails' to_i, which read the leading integer so "1.json" and "1-slug" found image 1.
	const match = /^\d{1,15}/.exec(rawId);
	if (!match) {
		return null;
	}
	return db.prepare('SELECT id, url FROM images WHERE id = ?').bind(Number(match[0])).first<Image>();
}

export async function countImages(db: D1Database): Promise<number> {
	const row = await db.prepare('SELECT COUNT(*) AS total FROM images').first<{ total: number }>();
	return row?.total ?? 0;
}

export async function listImageIds(db: D1Database): Promise<number[]> {
	const { results } = await db.prepare('SELECT id FROM images ORDER BY id').all<{ id: number }>();
	return results.map((row) => row.id);
}

export async function insertImage(db: D1Database, url: string): Promise<number> {
	const row = await db.prepare('INSERT INTO images (url) VALUES (?) RETURNING id').bind(url).first<{ id: number }>();
	if (!row) {
		throw new Error('insert returned no row');
	}
	return row.id;
}

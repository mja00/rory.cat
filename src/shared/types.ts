import type { Locale } from './i18n';

export interface Image {
	id: number;
	url: string;
}

export type PageName = 'home' | 'byId' | 'notFound' | 'license' | 'offline';

export interface AppState {
	page: PageName;
	locale: Locale;
	image: Image | null;
	total: number;
}

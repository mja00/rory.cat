import { createSSRApp } from 'vue';
import type { AppState } from '../shared/types';
import App from './App.vue';

export function createApp(state: AppState) {
	return createSSRApp(App, { state });
}

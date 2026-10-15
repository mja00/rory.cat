import './style.css';
import { createApp } from '../app/createApp';
import type { AppState } from '../shared/types';

const stateElement = document.getElementById('app-state');
const container = document.getElementById('app');

if (stateElement?.textContent && container) {
	const state = JSON.parse(stateElement.textContent) as AppState;
	createApp(state).mount(container);
}

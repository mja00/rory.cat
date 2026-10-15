<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { Image } from '../shared/types';
import { t, type Locale } from '../shared/i18n';

const props = defineProps<{
	page: 'home' | 'byId';
	image: Image;
	total: number;
	locale: Locale;
}>();

// Not in lib.dom yet; only the members used here.
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isHome = computed(() => props.page === 'home');
const installPrompt = ref<BeforeInstallPromptEvent | null>(null);
const httpsUrl = ref<string | null>(null);

function onBeforeInstallPrompt(event: Event): void {
	installPrompt.value = event as BeforeInstallPromptEvent;
}

function onAppInstalled(): void {
	installPrompt.value = null;
}

async function install(): Promise<void> {
	const promptEvent = installPrompt.value;
	if (!promptEvent) {
		return;
	}
	await promptEvent.prompt();
	await promptEvent.userChoice;
	// prompt() can only be called once per event.
	installPrompt.value = null;
}

onMounted(() => {
	if (!isHome.value) {
		return;
	}
	window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
	window.addEventListener('appinstalled', onAppInstalled);
	// beforeinstallprompt never fires over HTTP because the service worker cannot load.
	if (window.location.protocol === 'http:') {
		httpsUrl.value = window.location.href.replace('http://', 'https://');
	}
});

onBeforeUnmount(() => {
	window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
	window.removeEventListener('appinstalled', onAppInstalled);
});
</script>

<template>
	<div class="row">
		<div :class="isHome ? 'sidebar' : 'sidebar sidebar-sm'">
			<template v-if="isHome">
				<h1>{{ t(locale, 'random_rory') }}</h1>
				<p><a href="/">{{ t(locale, 'new_rory') }}</a></p>
			</template>
			<template v-else>
				<h1>{{ t(locale, 'rory_by_id') }}</h1>
				<p><a href="/">{{ t(locale, 'random_rory') }}</a></p>
			</template>
			<p>{{ t(locale, 'rory_id', { id: image.id }) }}</p>
			<p>{{ t(locale, 'total_rorys', { total }) }}</p>
			<template v-if="isHome">
				<p><a href="/purr">{{ t(locale, 'rory_rest_api') }}</a></p>
			</template>
			<template v-else>
				<p><a href="/purr">{{ t(locale, 'rory_rest_api_random') }}</a></p>
				<p><a :href="`/purr/${image.id}`">{{ t(locale, 'rory_rest_api_this') }}</a></p>
			</template>
			<p><a href="https://chew.wiki/view/Rory">{{ t(locale, 'about') }}</a></p>
			<p><a href="/license">License</a></p>
			<p>
				<a href="https://discord.gg/jTggjT2" rel="noopener" target="_blank">{{ t(locale, 'fanclub.discord') }}</a>
			</p>
			<p v-if="httpsUrl">
				<b>STOP!</b> This page <b>must</b> be served over HTTPS.
				Please <a :href="httpsUrl">reload this page via HTTPS</a>.
			</p>
			<div v-if="installPrompt">
				<button type="button" class="btn" @click="install">
					{{ t(locale, 'install_as_app') }}
				</button>
			</div>
		</div>
		<div class="col">
			<a v-if="isHome" :href="`/id/${image.id}`">
				<img id="rory" :src="image.url" alt="rory" title="rory">
			</a>
			<img v-else id="rory" :src="image.url" :alt="`rory ${image.id}`" title="rory">
		</div>
	</div>
</template>

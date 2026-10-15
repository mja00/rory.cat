<script setup lang="ts">
import { onMounted } from 'vue';
import type { AppState } from '../shared/types';
import { t } from '../shared/i18n';
import ImagePage from './ImagePage.vue';
import LicensePage from './LicensePage.vue';

defineProps<{ state: AppState }>();

onMounted(() => {
	if ('serviceWorker' in navigator) {
		void navigator.serviceWorker.register('/service-worker.js');
	}
});
</script>

<template>
	<ImagePage
		v-if="(state.page === 'home' || state.page === 'byId') && state.image"
		:page="state.page"
		:image="state.image"
		:total="state.total"
		:locale="state.locale"
	/>
	<LicensePage v-else-if="state.page === 'license'" />
	<div v-else-if="state.page === 'offline'" class="row">
		<div class="col">
			<h1>{{ t(state.locale, 'you_are_offline') }}</h1>
			<p>{{ t(state.locale, 'rory_online_only') }}</p>
		</div>
	</div>
	<p v-else>
		{{ t(state.locale, 'rory_does_not_exist') }}
	</p>
</template>

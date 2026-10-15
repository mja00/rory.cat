import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default defineConfig(
	{
		ignores: ['dist/**', '.wrangler/**', 'node_modules/**', 'worker-configuration.d.ts'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.serviceworker },
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: ['.vue'],
				sourceType: 'module',
			},
		},
		rules: {
			'vue/html-indent': ['error', 'tab'],
			'vue/max-attributes-per-line': 'off',
			'vue/singleline-html-element-content-newline': 'off',
		},
	},
	{
		files: ['scripts/**', '*.config.ts'],
		languageOptions: {
			globals: globals.node,
		},
	},
);

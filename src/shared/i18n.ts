const en = {
	random_rory: 'Random Rory',
	new_rory: 'New Rory',
	rory_id: 'Rory ID %{id}',
	about: 'About Rory',
	rory_rest_api: 'Rory REST API',
	'fanclub.discord': 'Rory Fanclub Discord Server',
	total_rorys: 'Total Rorys: %{total}',
	install_as_app: 'Install as App',
	you_are_offline: 'You are offline!',
	rory_online_only: 'Rory can only be enjoyed online.',
	rory_by_id: 'Rory By ID',
	rory_rest_api_random: 'Rory REST API (random)',
	rory_rest_api_this: 'Rory REST API (this Rory)',
	rory_does_not_exist: 'this rory does not exist',
};

export type MessageKey = keyof typeof en;

const ru: Partial<Record<MessageKey, string>> = {
	random_rory: 'Случайный Рори',
	new_rory: 'Новый Рори',
	rory_id: 'ID Рори: %{id}',
	rory_rest_api: 'REST API Рори',
	'fanclub.discord': 'Дискорд фан-клуб Рори',
	total_rorys: 'Общее количество Рори: %{total}',
	install_as_app: 'Установить приложение',
	you_are_offline: 'Вы не в сети!',
	rory_online_only: 'Наслаждаться Рори можно только в режиме онлайн.',
	rory_by_id: 'Рори по ID',
	rory_rest_api_random: 'REST API Рори (случайно)',
	rory_rest_api_this: 'REST API Рори (данный Рори)',
};

const ca: Partial<Record<MessageKey, string>> = {
	random_rory: 'Rory aleatori',
	new_rory: 'Nou Rory',
	rory_id: 'ID del Rory: %{id}',
	about: 'Sobre el Rory',
	rory_rest_api: 'API REST del Rory',
	'fanclub.discord': 'Servidor de Discord del club de fans del Rory',
	total_rorys: 'Total de Rorys: %{total}',
	install_as_app: 'Instal·la com a aplicació',
	you_are_offline: 'No tens connexió!',
	rory_online_only: 'Només es pot gaudir del Rory en línia.',
	rory_by_id: 'Rory per ID',
	rory_rest_api_random: 'API REST del Rory (aleatori)',
	rory_rest_api_this: 'API REST del Rory (aquest Rory)',
	rory_does_not_exist: 'aquest rory no existeix',
};

const messages = { en, ru, ca };

export type Locale = keyof typeof messages;

export function resolveLocale(value: string | undefined): Locale {
	if (value && Object.hasOwn(messages, value)) {
		return value as Locale;
	}
	return 'en';
}

export function t(locale: Locale, key: MessageKey, params: Record<string, string | number> = {}): string {
	const template = messages[locale][key] ?? en[key];
	return template.replace(/%\{(\w+)\}/g, (match, name: string) => {
		const value = params[name];
		if (value === undefined) {
			return match;
		}
		return String(value);
	});
}

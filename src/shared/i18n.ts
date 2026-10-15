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

const zh: Partial<Record<MessageKey, string>> = {
	random_rory: '随机 Rory',
	new_rory: '换一只 Rory',
	rory_id: 'Rory 编号：%{id}',
	about: '关于 Rory',
	rory_rest_api: 'Rory REST API',
	'fanclub.discord': 'Rory 粉丝俱乐部 Discord 服务器',
	total_rorys: 'Rory 总数：%{total}',
	install_as_app: '安装为应用',
	you_are_offline: '你已离线！',
	rory_online_only: 'Rory 只能在线欣赏。',
	rory_by_id: '按编号查看 Rory',
	rory_rest_api_random: 'Rory REST API（随机）',
	rory_rest_api_this: 'Rory REST API（这只 Rory）',
	rory_does_not_exist: '这只 Rory 不存在',
};

const hi: Partial<Record<MessageKey, string>> = {
	random_rory: 'रैंडम रोरी',
	new_rory: 'नया रोरी',
	rory_id: 'रोरी आईडी %{id}',
	about: 'रोरी के बारे में',
	rory_rest_api: 'रोरी REST API',
	'fanclub.discord': 'रोरी फ़ैन क्लब डिस्कॉर्ड सर्वर',
	total_rorys: 'कुल रोरी: %{total}',
	install_as_app: 'ऐप के रूप में इंस्टॉल करें',
	you_are_offline: 'आप ऑफ़लाइन हैं!',
	rory_online_only: 'रोरी का आनंद केवल ऑनलाइन लिया जा सकता है।',
	rory_by_id: 'आईडी से रोरी',
	rory_rest_api_random: 'रोरी REST API (रैंडम)',
	rory_rest_api_this: 'रोरी REST API (यह रोरी)',
	rory_does_not_exist: 'यह रोरी मौजूद नहीं है',
};

const es: Partial<Record<MessageKey, string>> = {
	random_rory: 'Rory aleatorio',
	new_rory: 'Nuevo Rory',
	rory_id: 'ID de Rory: %{id}',
	about: 'Acerca de Rory',
	rory_rest_api: 'API REST de Rory',
	'fanclub.discord': 'Servidor de Discord del club de fans de Rory',
	total_rorys: 'Total de Rorys: %{total}',
	install_as_app: 'Instalar como aplicación',
	you_are_offline: '¡No tienes conexión!',
	rory_online_only: 'Rory solo se puede disfrutar en línea.',
	rory_by_id: 'Rory por ID',
	rory_rest_api_random: 'API REST de Rory (aleatorio)',
	rory_rest_api_this: 'API REST de Rory (este Rory)',
	rory_does_not_exist: 'este rory no existe',
};

const ar: Partial<Record<MessageKey, string>> = {
	random_rory: 'روري عشوائي',
	new_rory: 'روري جديد',
	rory_id: 'معرّف روري: %{id}',
	about: 'عن روري',
	rory_rest_api: 'واجهة REST لروري',
	'fanclub.discord': 'خادم ديسكورد لنادي معجبي روري',
	total_rorys: 'إجمالي صور روري: %{total}',
	install_as_app: 'التثبيت كتطبيق',
	you_are_offline: 'أنت غير متصل بالإنترنت!',
	rory_online_only: 'لا يمكن الاستمتاع بروري إلا عبر الإنترنت.',
	rory_by_id: 'روري حسب المعرّف',
	rory_rest_api_random: 'واجهة REST لروري (عشوائي)',
	rory_rest_api_this: 'واجهة REST لروري (هذه الصورة)',
	rory_does_not_exist: 'صورة روري هذه غير موجودة',
};

// Non-breaking spaces before French punctuation keep "!" and ":" from wrapping onto their own line.
const fr: Partial<Record<MessageKey, string>> = {
	random_rory: 'Rory au hasard',
	new_rory: 'Nouveau Rory',
	rory_id: 'ID de Rory : %{id}',
	about: 'À propos de Rory',
	rory_rest_api: 'API REST de Rory',
	'fanclub.discord': 'Serveur Discord du fan-club de Rory',
	total_rorys: 'Nombre total de Rorys : %{total}',
	install_as_app: 'Installer l\'application',
	you_are_offline: 'Vous êtes hors ligne !',
	rory_online_only: 'Rory ne s\'apprécie qu\'en ligne.',
	rory_by_id: 'Rory par ID',
	rory_rest_api_random: 'API REST de Rory (au hasard)',
	rory_rest_api_this: 'API REST de Rory (ce Rory)',
	rory_does_not_exist: 'ce rory n\'existe pas',
};

const bn: Partial<Record<MessageKey, string>> = {
	random_rory: 'এলোমেলো রোরি',
	new_rory: 'নতুন রোরি',
	rory_id: 'রোরি আইডি %{id}',
	about: 'রোরি সম্পর্কে',
	rory_rest_api: 'রোরি REST API',
	'fanclub.discord': 'রোরি ফ্যান ক্লাব ডিসকর্ড সার্ভার',
	total_rorys: 'মোট রোরি: %{total}',
	install_as_app: 'অ্যাপ হিসেবে ইনস্টল করুন',
	you_are_offline: 'আপনি অফলাইনে আছেন!',
	rory_online_only: 'রোরিকে কেবল অনলাইনেই উপভোগ করা যায়।',
	rory_by_id: 'আইডি অনুযায়ী রোরি',
	rory_rest_api_random: 'রোরি REST API (এলোমেলো)',
	rory_rest_api_this: 'রোরি REST API (এই রোরি)',
	rory_does_not_exist: 'এই রোরির অস্তিত্ব নেই',
};

const pt: Partial<Record<MessageKey, string>> = {
	random_rory: 'Rory aleatório',
	new_rory: 'Novo Rory',
	rory_id: 'ID do Rory: %{id}',
	about: 'Sobre o Rory',
	rory_rest_api: 'API REST do Rory',
	'fanclub.discord': 'Servidor do Discord do fã-clube do Rory',
	total_rorys: 'Total de Rorys: %{total}',
	install_as_app: 'Instalar como app',
	you_are_offline: 'Você está offline!',
	rory_online_only: 'O Rory só pode ser apreciado online.',
	rory_by_id: 'Rory por ID',
	rory_rest_api_random: 'API REST do Rory (aleatório)',
	rory_rest_api_this: 'API REST do Rory (este Rory)',
	rory_does_not_exist: 'este rory não existe',
};

const id: Partial<Record<MessageKey, string>> = {
	random_rory: 'Rory Acak',
	new_rory: 'Rory Baru',
	rory_id: 'ID Rory: %{id}',
	about: 'Tentang Rory',
	rory_rest_api: 'REST API Rory',
	'fanclub.discord': 'Server Discord Klub Penggemar Rory',
	total_rorys: 'Total Rory: %{total}',
	install_as_app: 'Pasang sebagai Aplikasi',
	you_are_offline: 'Anda sedang offline!',
	rory_online_only: 'Rory hanya bisa dinikmati secara online.',
	rory_by_id: 'Rory Berdasarkan ID',
	rory_rest_api_random: 'REST API Rory (acak)',
	rory_rest_api_this: 'REST API Rory (Rory ini)',
	rory_does_not_exist: 'rory ini tidak ada',
};

const messages = { en, ru, ca, zh, hi, es, ar, fr, bn, pt, id };

export type Locale = keyof typeof messages;

const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

export function textDirection(locale: Locale): 'ltr' | 'rtl' {
	if (RTL_LOCALES.has(locale)) {
		return 'rtl';
	}
	return 'ltr';
}

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

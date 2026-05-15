import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params }) => {
	const lang = params.lang;
	if (lang === 'ja') throw redirect(301, '/');
	if (lang && lang !== 'en') throw redirect(301, '/');
	return { lang: (lang === 'en' ? 'en' : 'ja') as 'ja' | 'en' };
};

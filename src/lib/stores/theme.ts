import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'mountain';

function createThemeStore() {
	const defaultTheme: Theme = 'mountain';
	
	const initialTheme = browser 
		? (localStorage.getItem('theme') as Theme) || defaultTheme 
		: defaultTheme;

	const { subscribe, set, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
			}
			set(theme);
		},
		cycle: () => {
			update(current => {
				const themes: Theme[] = ['light', 'dark', 'mountain'];
				const currentIndex = themes.indexOf(current);
				const nextTheme = themes[(currentIndex + 1) % themes.length];
				
				if (browser) {
					localStorage.setItem('theme', nextTheme);
					document.documentElement.setAttribute('data-theme', nextTheme);
				}
				
				return nextTheme;
			});
		},
		init: () => {
			if (browser) {
				const saved = localStorage.getItem('theme') as Theme;
				const theme = saved || defaultTheme;
				document.documentElement.setAttribute('data-theme', theme);
				set(theme);
			}
		}
	};
}

export const theme = createThemeStore();

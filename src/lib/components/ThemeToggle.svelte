<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import { onMount, onDestroy } from 'svelte';

	let currentTheme = $state<Theme>('mountain');

	onMount(() => {
		theme.init();
	});

	const unsubscribe = theme.subscribe(t => currentTheme = t);
	onDestroy(unsubscribe);

	const themeInfo: Record<string, { label: string; icon: string }> = {
		light: { label: 'Light', icon: '☀️' },
		dark: { label: 'Dark', icon: '🌙' },
		mountain: { label: 'Mountain', icon: '🏔️' }
	};
</script>

<button 
	class="theme-toggle" 
	onclick={() => theme.cycle()}
	aria-label="Toggle theme. Current: {themeInfo[currentTheme]?.label || 'Mountain'}"
	title="Current theme: {themeInfo[currentTheme]?.label || 'Mountain'}"
>
	<span class="theme-icon">{themeInfo[currentTheme]?.icon || '🏔️'}</span>
	<span class="theme-label">{themeInfo[currentTheme]?.label || 'Mountain'}</span>
</button>

<style>
	.theme-toggle {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.85rem;
		background: var(--glass-bg);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--glass-border);
		border-radius: 100px;
		cursor: pointer;
		font-family: inherit;
		color: var(--text-secondary);
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		animation: fadeIn 0.6s ease 0.3s both;
	}

	.theme-toggle:hover {
		background: var(--glass-bg-solid);
		border-color: var(--glass-border-light);
		color: var(--text-primary);
		transform: translateY(-2px);
		box-shadow: var(--glass-shadow);
	}

	.theme-icon {
		font-size: 1.1rem;
		line-height: 1;
	}

	.theme-label {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	@media (max-width: 480px) {
		.theme-toggle {
			top: 0.75rem;
			right: 0.75rem;
			padding: 0.4rem 0.65rem;
		}

		.theme-label {
			display: none;
		}
	}
</style>

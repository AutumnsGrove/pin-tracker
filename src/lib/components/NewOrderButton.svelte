<script lang="ts">
	export let on: () => void;
</script>

<button class="new-order-btn" on:click={on}>
	<span class="btn-icon">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
			<line x1="12" y1="5" x2="12" y2="19"></line>
			<line x1="5" y1="12" x2="19" y2="12"></line>
		</svg>
	</span>
	<span class="btn-text">New Order</span>
</button>

<style>
	.new-order-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.85rem;
		background: linear-gradient(135deg, var(--primary-dark), var(--primary), var(--golden));
		color: white;
		border: none;
		border-radius: var(--radius);
		font-size: 0.9rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 20px rgba(232, 151, 107, 0.2);
		margin-top: 0.35rem;
	}

	.new-order-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(232, 151, 107, 0.3);
	}

	.new-order-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 10px rgba(232, 151, 107, 0.15);
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-text {
		font-size: 0.9rem;
	}
</style>

<script lang="ts">
	export let order: {
		id: string;
		customerName: string;
		pinDesign: string;
		quantity: number;
		status: string;
		estimatedCompletion: string;
		progress: number;
	};
</script>

<div class="summary">
	<h3>Order Summary</h3>
	<div class="summary-grid">
		<div class="summary-item">
			<span class="label">Order ID</span>
			<span class="value mono">{order.id}</span>
		</div>
		<div class="summary-item">
			<span class="label">Pin Design</span>
			<span class="value">{order.pinDesign}</span>
		</div>
		<div class="summary-item">
			<span class="label">Quantity</span>
			<span class="value">{order.quantity}</span>
		</div>
		<div class="summary-item">
			<span class="label">Status</span>
			<span class="value">
				<span class="status-chip">{order.status.replace('-', ' ')}</span>
			</span>
		</div>
		<div class="summary-item">
			<span class="label">Est. Completion</span>
			<span class="value">{order.estimatedCompletion}</span>
		</div>
		<div class="summary-item">
			<span class="label">Progress</span>
			<span class="value">
				<span class="progress-inline">
					<span class="progress-bar-sm">
						<span class="progress-fill-sm" style="width: {order.progress}%"></span>
					</span>
					{order.progress}%
				</span>
			</span>
		</div>
	</div>
</div>

<style>
	.summary {
		margin-top: 2.25rem;
		padding-top: 1.75rem;
		border-top: 1px solid rgba(255, 250, 245, 0.06);
		animation: fadeIn 0.5s ease 0.35s both;
	}

	h3 {
		font-size: 1.05rem;
		margin-bottom: 1.15rem;
		color: var(--slate-600);
		font-weight: 500;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.25rem;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.label {
		font-size: 0.7rem;
		color: var(--slate-400);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 400;
	}

	.value {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--slate-700);
	}

	.mono {
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 0.85rem;
	}

	.status-chip {
		display: inline-block;
		padding: 0.2rem 0.55rem;
		background: linear-gradient(135deg, var(--primary-dark), var(--primary));
		color: white;
		border-radius: 100px;
		font-size: 0.75rem;
		text-transform: capitalize;
		font-weight: 500;
	}

	.progress-inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.progress-bar-sm {
		flex: 1;
		height: 4px;
		background: rgba(255, 250, 245, 0.08);
		border-radius: 100px;
		overflow: hidden;
		max-width: 70px;
	}

	.progress-fill-sm {
		height: 100%;
		background: linear-gradient(90deg, var(--primary-dark), var(--golden));
		border-radius: 100px;
		transition: width 0.5s ease;
	}

	@media (max-width: 600px) {
		.summary-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>

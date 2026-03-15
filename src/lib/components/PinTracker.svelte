<script lang="ts">
	import { orderStages } from './stages';

	export let selectedOrder: {
		id: string;
		customerName: string;
		pinDesign: string;
		quantity: number;
		status: 'ordered' | 'design' | 'production' | 'quality' | 'shipped';
		estimatedCompletion: string;
		progress: number;
		updates: {
			status: string;
			message: string;
			timestamp: string;
		}[];
	};

	const stages = orderStages;
	$: currentStageIndex = stages.findIndex((s) => s.key === selectedOrder.status);

	function getStageStatus(index: number): 'completed' | 'current' | 'upcoming' {
		if (index < currentStageIndex) return 'completed';
		if (index === currentStageIndex) return 'current';
		return 'upcoming';
	}

	// Which stage checklist is expanded (null = none)
	let expandedStage: number | null = null;

	function toggleStage(index: number) {
		expandedStage = expandedStage === index ? null : index;
	}

	// For completed stages, all items are checked.
	// For current stage, first 3 are checked (simulated progress).
	// For upcoming, none are checked.
	function isItemChecked(stageIndex: number, itemIndex: number): boolean {
		const status = getStageStatus(stageIndex);
		if (status === 'completed') return true;
		if (status === 'current') return itemIndex < 3;
		return false;
	}

	const icons: Record<string, string> = {
		clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
		palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`,
		factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path></svg>`,
		checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
		truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 22 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`
	};

	$: currentUpdate = selectedOrder.updates[selectedOrder.updates.length - 1];
</script>

<!-- ===== HERO HORIZONTAL TRACKER ===== -->
<div class="tracker-hero">
	<div class="steps">
		{#each stages as stage, index}
			{@const status = getStageStatus(index)}
			<button
				class="step"
				class:completed={status === 'completed'}
				class:current={status === 'current'}
				class:upcoming={status === 'upcoming'}
				class:expanded={expandedStage === index}
				on:click={() => toggleStage(index)}
			>
				<div class="step-icon">
					{@html icons[stage.iconKey]}
					{#if status === 'current'}
						<div class="icon-pulse-ring"></div>
					{/if}
					{#if status === 'completed'}
						<div class="check-overlay">
							<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="14" height="14">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						</div>
					{/if}
				</div>
				<span class="step-label">{stage.title}</span>
				<span class="step-tap-hint">tap to expand</span>
			</button>
			{#if index < stages.length - 1}
				<div class="step-connector" class:filled={index < currentStageIndex} class:filling={index === currentStageIndex}>
					<div class="connector-fill"></div>
				</div>
			{/if}
		{/each}
	</div>
</div>

<!-- ===== EXPANDED CHECKLIST ===== -->
{#if expandedStage !== null}
	{@const stage = stages[expandedStage]}
	{@const status = getStageStatus(expandedStage)}
	<div class="checklist-panel">
		<div class="checklist-header">
			<div class="checklist-icon" class:completed={status === 'completed'} class:current={status === 'current'}>
				{@html icons[stage.iconKey]}
			</div>
			<div class="checklist-title-block">
				<h3>{stage.title}</h3>
				<p>{stage.description}</p>
			</div>
			<button class="checklist-close" on:click={() => expandedStage = null}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
		<div class="checklist-items">
			{#each stage.checklist as item, i}
				{@const checked = isItemChecked(expandedStage, i)}
				<div class="checklist-item" class:checked style="animation-delay: {i * 50}ms">
					<div class="check-box" class:checked>
						{#if checked}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</div>
					<span class="check-text">{item}</span>
				</div>
			{/each}
		</div>
		<div class="checklist-progress">
			<div class="checklist-bar">
				<div class="checklist-fill" style="width: {(stage.checklist.filter((_, i) => isItemChecked(expandedStage ?? 0, i)).length / stage.checklist.length) * 100}%"></div>
			</div>
			<span class="checklist-count">{stage.checklist.filter((_, i) => isItemChecked(expandedStage ?? 0, i)).length}/{stage.checklist.length} complete</span>
		</div>
	</div>
{/if}

<!-- ===== STATUS MESSAGE ===== -->
<div class="status-banner">
	<div class="status-glow"></div>
	<div class="status-content">
		<h3 class="status-title">{currentUpdate?.status || selectedOrder.status}</h3>
		<p class="status-message">{currentUpdate?.message || ''}</p>
		<span class="status-time">{currentUpdate?.timestamp || ''}</span>
	</div>
</div>

<!-- ===== ORDER INFO ===== -->
<div class="info-row">
	<div class="info-card">
		<span class="info-label">Design</span>
		<span class="info-value">{selectedOrder.pinDesign}</span>
	</div>
	<div class="info-card">
		<span class="info-label">Customer</span>
		<span class="info-value">{selectedOrder.customerName}</span>
	</div>
	<div class="info-card">
		<span class="info-label">Quantity</span>
		<span class="info-value">{selectedOrder.quantity} pins</span>
	</div>
	<div class="info-card">
		<span class="info-label">Est. Completion</span>
		<span class="info-value">{selectedOrder.estimatedCompletion}</span>
	</div>
</div>

<!-- ===== UPDATES TIMELINE ===== -->
{#if selectedOrder.updates.length > 1}
	<div class="updates-section">
		<h3>Activity</h3>
		<div class="updates-list">
			{#each [...selectedOrder.updates].reverse() as update, i (update.timestamp)}
				<div class="update-item" style="animation-delay: {i * 60}ms">
					<div class="update-marker">
						<div class="update-dot" class:latest={i === 0}></div>
						{#if i < selectedOrder.updates.length - 1}
							<div class="update-line"></div>
						{/if}
					</div>
					<div class="update-body">
						<div class="update-top">
							<span class="update-status">{update.status}</span>
							<span class="update-time">{update.timestamp}</span>
						</div>
						<p class="update-message">{update.message}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	/* ===== HERO TRACKER BAR ===== */
	.tracker-hero {
		padding: 2.5rem 0.5rem 1.5rem;
		animation: fadeIn 0.6s ease both;
	}

	.steps {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		width: 100%;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		flex-shrink: 0;
		z-index: 2;
		width: 100px;
		cursor: pointer;
		background: none;
		border: none;
		font-family: inherit;
		padding: 0.5rem 0;
		border-radius: var(--radius-sm);
		transition: all 0.25s ease;
	}

	.step:hover {
		background: rgba(255, 250, 245, 0.03);
	}

	.step.expanded {
		background: rgba(232, 151, 107, 0.06);
	}

	.step-icon {
		position: relative;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.step.upcoming .step-icon {
		background: rgba(255, 250, 245, 0.05);
		border: 2px solid rgba(255, 250, 245, 0.1);
	}
	.step.upcoming .step-icon :global(svg) { width: 26px; height: 26px; color: rgba(255, 250, 245, 0.2); }

	.step.current .step-icon {
		background: linear-gradient(135deg, var(--primary-dark), var(--primary), var(--golden));
		border: 2px solid var(--primary);
		box-shadow: 0 0 0 6px rgba(232, 151, 107, 0.12), 0 0 30px rgba(232, 151, 107, 0.25), 0 0 60px rgba(232, 151, 107, 0.1);
	}
	.step.current .step-icon :global(svg) { width: 28px; height: 28px; color: white; }

	.step.completed .step-icon {
		background: var(--emerald);
		border: 2px solid var(--emerald-light);
		box-shadow: 0 0 20px rgba(95, 170, 123, 0.2);
	}
	.step.completed .step-icon :global(svg) { width: 26px; height: 26px; color: rgba(255, 255, 255, 0.4); }

	.check-overlay {
		position: absolute; inset: 0;
		display: flex; align-items: center; justify-content: center;
		background: rgba(0, 0, 0, 0.15); border-radius: 50%;
	}

	.icon-pulse-ring {
		position: absolute; inset: -8px; border-radius: 50%;
		border: 2px solid var(--primary); opacity: 0;
		animation: pulseRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	@keyframes pulseRing { 0% { transform: scale(0.85); opacity: 0.6; } 100% { transform: scale(1.15); opacity: 0; } }

	.step-label {
		font-size: 0.72rem; font-weight: 500; text-align: center; line-height: 1.3;
		transition: color 0.3s ease; max-width: 90px;
	}
	.step.upcoming .step-label { color: var(--slate-400); }
	.step.current .step-label { color: var(--primary-light); font-weight: 600; }
	.step.completed .step-label { color: var(--emerald-light); }

	.step-tap-hint {
		font-size: 0.55rem;
		color: var(--slate-400);
		opacity: 0;
		transition: opacity 0.2s;
		margin-top: -0.3rem;
	}
	.step:hover .step-tap-hint { opacity: 0.7; }

	/* ===== CONNECTOR BAR ===== */
	.step-connector {
		flex: 1; height: 4px;
		background: rgba(255, 250, 245, 0.08);
		border-radius: 100px; margin-top: calc(0.5rem + 30px);
		position: relative; overflow: hidden; min-width: 20px;
	}
	.connector-fill {
		position: absolute; inset: 0; border-radius: 100px;
		transform-origin: left;
		transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		transform: scaleX(0);
	}
	.step-connector.filled .connector-fill {
		background: var(--emerald); box-shadow: 0 0 10px rgba(95, 170, 123, 0.3); transform: scaleX(1);
	}
	.step-connector.filling .connector-fill {
		background: linear-gradient(90deg, var(--emerald), var(--primary));
		box-shadow: 0 0 10px rgba(232, 151, 107, 0.2);
		transform: scaleX(0.5); animation: fillPulse 2s ease-in-out infinite;
	}
	@keyframes fillPulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }

	/* ===== CHECKLIST PANEL ===== */
	.checklist-panel {
		background: rgba(255, 250, 245, 0.04);
		border: 1px solid rgba(255, 250, 245, 0.08);
		border-radius: var(--radius);
		padding: 1.5rem;
		margin: 0 0 1rem;
		animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
	}

	@keyframes slideDown {
		from { opacity: 0; transform: translateY(-10px); max-height: 0; }
		to { opacity: 1; transform: translateY(0); max-height: 500px; }
	}

	.checklist-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.checklist-icon {
		width: 40px; height: 40px; border-radius: 10px;
		display: flex; align-items: center; justify-content: center;
		background: rgba(255, 250, 245, 0.06);
		flex-shrink: 0;
	}
	.checklist-icon :global(svg) { width: 20px; height: 20px; color: var(--slate-500); }
	.checklist-icon.completed { background: rgba(95, 170, 123, 0.12); }
	.checklist-icon.completed :global(svg) { color: var(--emerald-light); }
	.checklist-icon.current { background: rgba(232, 151, 107, 0.12); }
	.checklist-icon.current :global(svg) { color: var(--primary-light); }

	.checklist-title-block {
		flex: 1; min-width: 0;
	}
	.checklist-title-block h3 {
		font-size: 1.05rem; font-weight: 600; color: var(--slate-700); margin-bottom: 0.1rem;
	}
	.checklist-title-block p {
		font-size: 0.8rem; color: var(--slate-400); font-weight: 300;
	}

	.checklist-close {
		background: none; border: none; cursor: pointer;
		color: var(--slate-400); padding: 0.25rem;
		border-radius: 6px; transition: all 0.2s;
		display: flex; align-items: center; justify-content: center;
	}
	.checklist-close:hover {
		color: var(--slate-600); background: rgba(255, 250, 245, 0.06);
	}

	.checklist-items {
		display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem;
	}

	.checklist-item {
		display: flex; align-items: center; gap: 0.75rem;
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-xs);
		transition: all 0.2s ease;
		animation: fadeIn 0.3s ease both;
	}

	.checklist-item:hover {
		background: rgba(255, 250, 245, 0.03);
	}

	.check-box {
		width: 22px; height: 22px; border-radius: 6px;
		border: 2px solid rgba(255, 250, 245, 0.15);
		display: flex; align-items: center; justify-content: center;
		flex-shrink: 0; transition: all 0.25s ease;
	}

	.check-box.checked {
		background: var(--emerald);
		border-color: var(--emerald-light);
		box-shadow: 0 0 8px rgba(95, 170, 123, 0.25);
	}
	.check-box.checked svg { color: white; }

	.check-text {
		font-size: 0.88rem; color: var(--slate-500); font-weight: 400;
		transition: all 0.2s;
	}

	.checklist-item.checked .check-text {
		color: var(--slate-600);
	}

	.checklist-progress {
		display: flex; align-items: center; gap: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(255, 250, 245, 0.05);
	}

	.checklist-bar {
		flex: 1; height: 4px;
		background: rgba(255, 250, 245, 0.08);
		border-radius: 100px; overflow: hidden;
	}

	.checklist-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--emerald), var(--emerald-light));
		border-radius: 100px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.checklist-count {
		font-size: 0.75rem; color: var(--slate-400); font-weight: 500; white-space: nowrap;
	}

	/* ===== STATUS BANNER ===== */
	.status-banner {
		position: relative; text-align: center;
		padding: 1.75rem 2rem; margin: 0.5rem 0 1.75rem;
		background: rgba(255, 250, 245, 0.03);
		border: 1px solid rgba(255, 250, 245, 0.05);
		border-radius: var(--radius); overflow: hidden;
		animation: fadeIn 0.5s ease 0.15s both;
	}
	.status-glow {
		position: absolute; top: 0; left: 50%; transform: translateX(-50%);
		width: 200px; height: 2px;
		background: linear-gradient(90deg, transparent, var(--primary), transparent);
	}
	.status-content { position: relative; z-index: 1; }
	.status-title { font-size: 1.3rem; font-weight: 700; color: var(--slate-800); margin-bottom: 0.3rem; letter-spacing: -0.02em; }
	.status-message { font-size: 0.9rem; color: var(--slate-500); font-weight: 300; margin-bottom: 0.4rem; line-height: 1.5; }
	.status-time { font-size: 0.72rem; color: var(--slate-400); font-weight: 400; }

	/* ===== INFO CARDS ===== */
	.info-row {
		display: grid; grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem; margin-bottom: 1.75rem;
		animation: fadeIn 0.5s ease 0.25s both;
	}
	.info-card {
		background: rgba(255, 250, 245, 0.04);
		border: 1px solid rgba(255, 250, 245, 0.06);
		border-radius: var(--radius-sm);
		padding: 0.85rem 1rem;
		display: flex; flex-direction: column; gap: 0.25rem;
		transition: all 0.2s ease;
	}
	.info-card:hover { background: rgba(255, 250, 245, 0.06); border-color: rgba(255, 250, 245, 0.08); }
	.info-label { font-size: 0.6rem; color: var(--slate-400); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
	.info-value { font-size: 0.95rem; font-weight: 600; color: var(--slate-700); }

	/* ===== UPDATES ===== */
	.updates-section { animation: fadeIn 0.5s ease 0.35s both; }
	.updates-section h3 { font-size: 0.85rem; color: var(--slate-400); font-weight: 500; margin-bottom: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
	.updates-list { display: flex; flex-direction: column; }
	.update-item { display: flex; gap: 0.85rem; animation: fadeIn 0.4s ease both; }
	.update-marker { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; }
	.update-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 250, 245, 0.15); flex-shrink: 0; margin-top: 0.35rem; }
	.update-dot.latest { background: var(--primary); box-shadow: 0 0 10px rgba(232, 151, 107, 0.4); width: 10px; height: 10px; }
	.update-line { width: 1.5px; flex: 1; background: rgba(255, 250, 245, 0.06); min-height: 20px; }
	.update-body { flex: 1; padding-bottom: 1.15rem; }
	.update-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.15rem; gap: 0.5rem; }
	.update-status { font-weight: 600; color: var(--slate-700); font-size: 0.82rem; }
	.update-time { font-size: 0.68rem; color: var(--slate-400); white-space: nowrap; font-weight: 300; }
	.update-message { color: var(--slate-400); font-size: 0.82rem; line-height: 1.5; font-weight: 300; }

	@media (max-width: 700px) {
		.info-row { grid-template-columns: repeat(2, 1fr); }
		.step { width: 70px; }
		.step-icon { width: 48px; height: 48px; }
		.step-connector { margin-top: calc(0.5rem + 22px); }
		.step-label { font-size: 0.62rem; }
	}
</style>

<script lang="ts">
	import type { Stage } from './stages';

	interface CheckedItem {
		checked: boolean;
		completedBy: string | null;
	}

	interface PhaseSignOff {
		adminSigned: boolean;
		clientSigned: boolean;
		adminSignedBy: string | null;
		clientSignedBy: string | null;
		adminSignedAt: string | null;
		clientSignedAt: string | null;
	}

	interface Props {
		selectedOrder: {
			id: string;
			customerName: string;
			pinDesign: string;
			quantity: number;
			status: string;
			estimatedCompletion: string;
			progress: number;
			checkedItems: Record<string, CheckedItem[]>;
			stepNames: Record<string, string[]>;
			phaseSignOffs: Record<string, PhaseSignOff>;
			signedOff: boolean;
			signedOffBy: string | null;
			signedOffAt: string | null;
			auditTrail: {
				action: string;
				details: string;
				user: string;
				timestamp: string;
			}[];
			updates: {
				status: string;
				message: string;
				timestamp: string;
			}[];
		};
		onCheckItem?: (stageKey: string, itemIndex: number, checked: boolean) => void;
		onPhaseSignOff?: (stageKey: string) => void;
		onAdvancePhase?: () => void;
		onReversePhase?: () => void;
		onFinalSignOff?: () => void;
		onEditGoal?: (field: string, value: string | number) => void;
		onAddStep?: (stageKey: string, stepName: string) => void;
		onDeleteStep?: (stageKey: string, itemIndex: number) => void;
		onModifyStep?: (stageKey: string, itemIndex: number, newName: string) => void;
		stages?: Stage[];
		canCheck?: boolean;
		canSignOff?: boolean;
		canEditGoals?: boolean;
		canManageSteps?: boolean;
		isAdmin?: boolean;
		currentUserRole?: string;
		currentUserName?: string;
	}

	let { 
		selectedOrder, 
		onCheckItem, 
		onPhaseSignOff,
		onAdvancePhase,
		onReversePhase,
		onFinalSignOff,
		onEditGoal,
		onAddStep,
		onDeleteStep,
		onModifyStep,
		stages = [],
		canCheck = false, 
		canSignOff = false, 
		canEditGoals = false,
		canManageSteps = false,
		isAdmin = false,
		currentUserRole = '',
		currentUserName = ''
	}: Props = $props();

	let currentStageIndex = $derived(stages.findIndex((s) => s.key === selectedOrder.status));

	function getStepNames(stageKey: string): string[] {
		return selectedOrder.stepNames[stageKey] || stages.find(s => s.key === stageKey)?.checklist || [];
	}

	function getStageStatus(index: number): 'completed' | 'current' | 'upcoming' {
		if (index < currentStageIndex) return 'completed';
		if (index === currentStageIndex) return 'current';
		return 'upcoming';
	}

	let expandedStage: number | null = $state(null);

	function toggleStage(index: number) {
		expandedStage = expandedStage === index ? null : index;
	}

	function isItemChecked(stageIndex: number, itemIndex: number): boolean {
		const stageKey = stages[stageIndex].key;
		const checkedItems = selectedOrder.checkedItems[stageKey];
		
		if (checkedItems && checkedItems[itemIndex] !== undefined) {
			return checkedItems[itemIndex].checked;
		}
		
		return false;
	}

	function getItemCompletedBy(stageIndex: number, itemIndex: number): string | null {
		const stageKey = stages[stageIndex].key;
		const checkedItems = selectedOrder.checkedItems[stageKey];
		if (checkedItems && checkedItems[itemIndex] !== undefined) {
			return checkedItems[itemIndex].completedBy;
		}
		return null;
	}

	function handleCheckItem(stageKey: string, itemIndex: number, currentChecked: boolean) {
		if (canCheck && onCheckItem) {
			onCheckItem(stageKey, itemIndex, !currentChecked);
		}
	}

	function getPhaseSignOff(stageKey: string): PhaseSignOff {
		return selectedOrder.phaseSignOffs[stageKey] || {
			adminSigned: false, clientSigned: false,
			adminSignedBy: null, clientSignedBy: null,
			adminSignedAt: null, clientSignedAt: null
		};
	}

	function areAllItemsChecked(stageKey: string): boolean {
		const items = selectedOrder.checkedItems[stageKey];
		return items && items.length > 0 && items.every(item => item.checked);
	}

	function hasCurrentUserSignedOff(stageKey: string): boolean {
		const signOff = getPhaseSignOff(stageKey);
		if (currentUserRole === 'admin') return signOff.adminSigned;
		if (currentUserRole === 'client') return signOff.clientSigned;
		return false;
	}

	function canPhaseAdvance(stageKey: string): boolean {
		const signOff = getPhaseSignOff(stageKey);
		return signOff.adminSigned && signOff.clientSigned;
	}

	// Step management state
	let addingStepTo: string | null = $state(null);
	let newStepName: string = $state('');
	let editingStep: { stageKey: string; itemIndex: number } | null = $state(null);
	let editStepName: string = $state('');
	let confirmingDelete: { stageKey: string; itemIndex: number } | null = $state(null);

	function startAddStep(stageKey: string) {
		addingStepTo = stageKey;
		newStepName = '';
	}

	function confirmAddStep(stageKey: string) {
		if (newStepName.trim() && onAddStep) {
			onAddStep(stageKey, newStepName.trim());
		}
		addingStepTo = null;
		newStepName = '';
	}

	function cancelAddStep() {
		addingStepTo = null;
		newStepName = '';
	}

	function startModifyStep(stageKey: string, itemIndex: number, currentName: string) {
		editingStep = { stageKey, itemIndex };
		editStepName = currentName;
	}

	function confirmModifyStep() {
		if (editingStep && editStepName.trim() && onModifyStep) {
			onModifyStep(editingStep.stageKey, editingStep.itemIndex, editStepName.trim());
		}
		editingStep = null;
		editStepName = '';
	}

	function cancelModifyStep() {
		editingStep = null;
		editStepName = '';
	}

	function handleDeleteStep(stageKey: string, itemIndex: number) {
		confirmingDelete = { stageKey, itemIndex };
	}

	function confirmDeleteStep() {
		if (confirmingDelete && onDeleteStep) {
			onDeleteStep(confirmingDelete.stageKey, confirmingDelete.itemIndex);
		}
		confirmingDelete = null;
	}

	function cancelDeleteStep() {
		confirmingDelete = null;
	}

	// Editable fields state
	let editingField: string | null = $state(null);
	let editValue: string = $state('');

	function startEdit(field: string, currentValue: string | number) {
		if (!canEditGoals) return;
		editingField = field;
		editValue = String(currentValue);
	}

	function saveEdit(field: string) {
		if (onEditGoal) {
			onEditGoal(field, editValue);
		}
		editingField = null;
	}

	function cancelEdit() {
		editingField = null;
	}

	const icons: Record<string, string> = {
		clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
		palette: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>`,
		factory: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M17 18h1"></path><path d="M12 18h1"></path><path d="M7 18h1"></path></svg>`,
		checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
		truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 22 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`
	};

	let currentUpdate = $derived(selectedOrder.updates[selectedOrder.updates.length - 1]);
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
				onclick={() => toggleStage(index)}
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
			<button class="checklist-close" onclick={() => expandedStage = null}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
		<div class="checklist-items">
			{#each getStepNames(stage.key) as item, i}
				{@const checked = isItemChecked(expandedStage, i)}
				{@const completedBy = getItemCompletedBy(expandedStage, i)}
				<div class="checklist-item" class:checked style="animation-delay: {i * 50}ms">
					<button 
						class="check-box" 
						class:checked
						class:clickable={canCheck}
						onclick={() => handleCheckItem(stage.key, i, checked)}
						disabled={!canCheck}
					>
						{#if checked}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
								<polyline points="20 6 9 17 4 12"></polyline>
							</svg>
						{/if}
					</button>
					{#if editingStep?.stageKey === stage.key && editingStep?.itemIndex === i}
						<div class="edit-step-field">
							<input type="text" bind:value={editStepName} class="edit-step-input" />
							<button class="edit-step-save" onclick={confirmModifyStep}>✓</button>
							<button class="edit-step-cancel" onclick={cancelModifyStep}>✕</button>
						</div>
					{:else}
						<span class="check-text">{item}</span>
					{/if}
					{#if checked && completedBy}
						<span class="completed-by">Completed by {completedBy}</span>
					{/if}
					{#if canCheck}
						<span class="check-hint">click to {checked ? 'uncheck' : 'check'}</span>
					{/if}
					{#if canManageSteps && editingStep?.stageKey !== stage.key}
						<div class="step-actions">
							<button class="step-action-btn modify" onclick={() => startModifyStep(stage.key, i, item)} title="Modify step">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
									<path d="M12 20h9"></path>
									<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
								</svg>
							</button>
							{#if confirmingDelete?.stageKey === stage.key && confirmingDelete?.itemIndex === i}
								<button class="step-action-btn confirm-delete" onclick={confirmDeleteStep} title="Confirm delete">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
										<polyline points="20 6 9 17 4 12"></polyline>
									</svg>
								</button>
								<button class="step-action-btn cancel-delete" onclick={cancelDeleteStep} title="Cancel">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								</button>
							{:else}
								<button class="step-action-btn delete" onclick={() => handleDeleteStep(stage.key, i)} title="Delete step">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
										<polyline points="3 6 5 6 21 6"></polyline>
										<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
									</svg>
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
			{#if canManageSteps}
				{#if addingStepTo === stage.key}
					<div class="add-step-form">
						<input type="text" bind:value={newStepName} placeholder="New step name..." class="add-step-input" />
						<button class="add-step-confirm" onclick={() => confirmAddStep(stage.key)}>Add</button>
						<button class="add-step-cancel" onclick={cancelAddStep}>Cancel</button>
					</div>
				{:else}
					<button class="add-step-btn" onclick={() => startAddStep(stage.key)}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<line x1="5" y1="12" x2="19" y2="12"></line>
						</svg>
						Add Step
					</button>
				{/if}
			{/if}
		</div>
		<div class="checklist-progress">
			<div class="checklist-bar">
				<div class="checklist-fill" style="width: {(getStepNames(stage.key).filter((_, i) => isItemChecked(expandedStage ?? 0, i)).length / getStepNames(stage.key).length) * 100}%"></div>
			</div>
			<span class="checklist-count">{getStepNames(stage.key).filter((_, i) => isItemChecked(expandedStage ?? 0, i)).length}/{getStepNames(stage.key).length} complete</span>
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
		{#if editingField === 'pinDesign'}
			<div class="edit-field">
				<input type="text" bind:value={editValue} class="edit-input" />
				<button class="edit-save" onclick={() => saveEdit('pinDesign')}>✓</button>
				<button class="edit-cancel" onclick={cancelEdit}>✕</button>
			</div>
		{:else}
			<span class="info-value" class:editable={canEditGoals} onclick={() => startEdit('pinDesign', selectedOrder.pinDesign)}>
				{selectedOrder.pinDesign}
				{#if canEditGoals}<span class="edit-icon">✎</span>{/if}
			</span>
		{/if}
	</div>
	<div class="info-card">
		<span class="info-label">Customer</span>
		{#if editingField === 'customerName'}
			<div class="edit-field">
				<input type="text" bind:value={editValue} class="edit-input" />
				<button class="edit-save" onclick={() => saveEdit('customerName')}>✓</button>
				<button class="edit-cancel" onclick={cancelEdit}>✕</button>
			</div>
		{:else}
			<span class="info-value" class:editable={canEditGoals} onclick={() => startEdit('customerName', selectedOrder.customerName)}>
				{selectedOrder.customerName}
				{#if canEditGoals}<span class="edit-icon">✎</span>{/if}
			</span>
		{/if}
	</div>
	<div class="info-card">
		<span class="info-label">Quantity</span>
		{#if editingField === 'quantity'}
			<div class="edit-field">
				<input type="number" bind:value={editValue} class="edit-input" />
				<button class="edit-save" onclick={() => saveEdit('quantity')}>✓</button>
				<button class="edit-cancel" onclick={cancelEdit}>✕</button>
			</div>
		{:else}
			<span class="info-value" class:editable={canEditGoals} onclick={() => startEdit('quantity', selectedOrder.quantity)}>
				{selectedOrder.quantity} units
				{#if canEditGoals}<span class="edit-icon">✎</span>{/if}
			</span>
		{/if}
	</div>
	<div class="info-card">
		<span class="info-label">Est. Completion</span>
		{#if editingField === 'estimatedCompletion'}
			<div class="edit-field">
				<input type="date" bind:value={editValue} class="edit-input" />
				<button class="edit-save" onclick={() => saveEdit('estimatedCompletion')}>✓</button>
				<button class="edit-cancel" onclick={cancelEdit}>✕</button>
			</div>
		{:else}
			<span class="info-value" class:editable={canEditGoals} onclick={() => startEdit('estimatedCompletion', selectedOrder.estimatedCompletion)}>
				{selectedOrder.estimatedCompletion}
				{#if canEditGoals}<span class="edit-icon">✎</span>{/if}
			</span>
		{/if}
	</div>
</div>

<!-- ===== PHASE SIGN-OFF SECTION ===== -->

<!-- Show phase sign-off panel when all items are checked and phase hasn't been fully signed off -->
{#if areAllItemsChecked(selectedOrder.status) && !canPhaseAdvance(selectedOrder.status) && currentStageIndex < stages.length - 1}
	{@const currentSignOff = getPhaseSignOff(selectedOrder.status)}
	<div class="signoff-section phase-signoff">
		<div class="signoff-header">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
				<path d="M9 12l2 2 4-4"></path>
				<path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
			</svg>
			<span>All items complete — sign-off required to proceed</span>
		</div>
		<div class="signoff-status-row">
			<div class="signoff-party" class:signed={currentSignOff.adminSigned}>
				<span class="party-label">Admin</span>
				{#if currentSignOff.adminSigned}
					<span class="party-badge signed">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						Signed by {currentSignOff.adminSignedBy}
					</span>
				{:else}
					<span class="party-badge pending">Pending</span>
				{/if}
			</div>
			<div class="signoff-party" class:signed={currentSignOff.clientSigned}>
				<span class="party-label">Client</span>
				{#if currentSignOff.clientSigned}
					<span class="party-badge signed">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						Signed by {currentSignOff.clientSignedBy}
					</span>
				{:else}
					<span class="party-badge pending">Pending</span>
				{/if}
			</div>
		</div>
		{#if canSignOff && !hasCurrentUserSignedOff(selectedOrder.status)}
			<button class="signoff-button" onclick={() => onPhaseSignOff?.(selectedOrder.status)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<path d="M12 20h9"></path>
					<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
				</svg>
				Sign Off This Phase
			</button>
		{/if}
	</div>
{/if}

<!-- Admin navigation controls -->
{#if isAdmin}
	<div class="admin-nav">
		{#if currentStageIndex > 0}
			<button class="admin-nav-btn reverse" onclick={onReversePhase}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				Previous Phase
			</button>
		{:else}
			<div></div>
		{/if}
		{#if currentStageIndex < stages.length - 1}
			<button class="admin-nav-btn advance" onclick={onAdvancePhase}>
				Next Phase
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		{:else}
			<div></div>
		{/if}
	</div>
{/if}

<!-- ===== FINAL ORDER SIGN-OFF (quality/shipped) ===== -->
{#if selectedOrder.status === 'quality' || selectedOrder.status === 'shipped'}
	<div class="signoff-section">
		{#if selectedOrder.signedOff}
			<div class="signoff-badge signed">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
					<polyline points="22 4 12 14.01 9 11.01"></polyline>
				</svg>
				<span>Approved by {selectedOrder.signedOffBy}</span>
				<span class="signoff-time">on {selectedOrder.signedOffAt}</span>
			</div>
		{:else if canSignOff}
			<button class="signoff-button final" onclick={onFinalSignOff}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<path d="M12 20h9"></path>
					<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
				</svg>
				Sign Off / Approve Order
			</button>
		{/if}
	</div>
{/if}

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

<!-- ===== AUDIT TRAIL ===== -->
<div class="audit-section">
	<h3>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
			<polyline points="14 2 14 8 20 8"></polyline>
			<line x1="16" y1="13" x2="8" y2="13"></line>
			<line x1="16" y1="17" x2="8" y2="17"></line>
			<polyline points="10 9 9 9 8 9"></polyline>
		</svg>
		Audit Trail
	</h3>
	<div class="audit-list">
		{#each selectedOrder.auditTrail as entry, i (entry.timestamp + i)}
			<div class="audit-item">
				<span class="audit-action">{entry.action}</span>
				<span class="audit-details">{entry.details}</span>
				<div class="audit-meta">
					<span class="audit-user">{entry.user}</span>
					<span class="audit-time">{entry.timestamp}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	/* ===== HERO TRACKER BAR ===== */
	.tracker-hero { padding: 2.5rem 0.5rem 1.5rem; animation: fadeIn 0.6s ease both; }
	.steps { display: flex; align-items: flex-start; justify-content: center; width: 100%; }
	.step {
		display: flex; flex-direction: column; align-items: center; gap: 0.65rem;
		flex-shrink: 0; z-index: 2; width: 100px; cursor: pointer;
		background: none; border: none; font-family: inherit;
		padding: 0.5rem 0; border-radius: var(--radius-sm); transition: all 0.25s ease;
	}
	.step:hover { background: rgba(255, 250, 245, 0.03); }
	.step.expanded { background: rgba(232, 151, 107, 0.06); }
	.step-icon {
		position: relative; width: 64px; height: 64px; border-radius: 50%;
		display: flex; align-items: center; justify-content: center;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.step.upcoming .step-icon { background: rgba(255, 250, 245, 0.05); border: 2px solid rgba(255, 250, 245, 0.1); }
	.step.upcoming .step-icon :global(svg) { width: 26px; height: 26px; color: rgba(255, 250, 245, 0.2); }
	.step.current .step-icon {
		background: linear-gradient(135deg, var(--primary-dark), var(--primary), var(--golden));
		border: 2px solid var(--primary);
		box-shadow: 0 0 0 6px rgba(232, 151, 107, 0.12), 0 0 30px rgba(232, 151, 107, 0.25), 0 0 60px rgba(232, 151, 107, 0.1);
	}
	.step.current .step-icon :global(svg) { width: 28px; height: 28px; color: white; }
	.step.completed .step-icon {
		background: var(--emerald); border: 2px solid var(--emerald-light);
		box-shadow: 0 0 20px rgba(95, 170, 123, 0.2);
	}
	.step.completed .step-icon :global(svg) { width: 26px; height: 26px; color: rgba(255, 255, 255, 0.4); }
	.check-overlay {
		position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
		background: rgba(0, 0, 0, 0.15); border-radius: 50%;
	}
	.icon-pulse-ring {
		position: absolute; inset: -8px; border-radius: 50%;
		border: 2px solid var(--primary); opacity: 0;
		animation: pulseRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	@keyframes pulseRing { 0% { transform: scale(0.85); opacity: 0.6; } 100% { transform: scale(1.15); opacity: 0; } }
	.step-label { font-size: 0.72rem; font-weight: 500; text-align: center; line-height: 1.3; transition: color 0.3s ease; max-width: 90px; }
	.step.upcoming .step-label { color: var(--text-muted); }
	.step.current .step-label { color: var(--primary-light); font-weight: 600; }
	.step.completed .step-label { color: var(--emerald-light); }
	.step-tap-hint { font-size: 0.55rem; color: var(--text-muted); opacity: 0; transition: opacity 0.2s; margin-top: -0.3rem; }
	.step:hover .step-tap-hint { opacity: 0.7; }

	/* ===== CONNECTOR BAR ===== */
	.step-connector {
		flex: 1; height: 4px; background: rgba(255, 250, 245, 0.08);
		border-radius: 100px; margin-top: calc(0.5rem + 30px);
		position: relative; overflow: hidden; min-width: 20px;
	}
	.connector-fill {
		position: absolute; inset: 0; border-radius: 100px; transform-origin: left;
		transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform: scaleX(0);
	}
	.step-connector.filled .connector-fill { background: var(--emerald); box-shadow: 0 0 10px rgba(95, 170, 123, 0.3); transform: scaleX(1); }
	.step-connector.filling .connector-fill {
		background: linear-gradient(90deg, var(--emerald), var(--primary));
		box-shadow: 0 0 10px rgba(232, 151, 107, 0.2); transform: scaleX(0.5);
		animation: fillPulse 2s ease-in-out infinite;
	}
	@keyframes fillPulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }

	/* ===== CHECKLIST PANEL ===== */
	.checklist-panel {
		background: rgba(255, 250, 245, 0.04); border: 1px solid rgba(255, 250, 245, 0.08);
		border-radius: var(--radius); padding: 1.5rem; margin: 0 0 1rem;
		animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
	}
	@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
	.checklist-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
	.checklist-icon {
		width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
		background: rgba(255, 250, 245, 0.06); flex-shrink: 0;
	}
	.checklist-icon :global(svg) { width: 20px; height: 20px; color: var(--slate-500); }
	.checklist-icon.completed { background: rgba(95, 170, 123, 0.12); }
	.checklist-icon.completed :global(svg) { color: var(--emerald-light); }
	.checklist-icon.current { background: rgba(232, 151, 107, 0.12); }
	.checklist-icon.current :global(svg) { color: var(--primary-light); }
	.checklist-title-block { flex: 1; min-width: 0; }
	.checklist-title-block h3 { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.1rem; }
	.checklist-title-block p { font-size: 0.8rem; color: var(--text-muted); font-weight: 300; }
	.checklist-close {
		background: none; border: none; cursor: pointer; color: var(--text-muted);
		padding: 0.25rem; border-radius: 6px; transition: all 0.2s;
		display: flex; align-items: center; justify-content: center;
	}
	.checklist-close:hover { color: var(--text-primary); background: rgba(255, 250, 245, 0.06); }
	.checklist-items { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
	.checklist-item {
		display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem;
		border-radius: var(--radius-xs); transition: all 0.2s ease; animation: fadeIn 0.3s ease both;
	}
	.checklist-item:hover { background: rgba(255, 250, 245, 0.03); }
	.check-box {
		width: 22px; height: 22px; border-radius: 6px; border: 2px solid rgba(255, 250, 245, 0.15);
		display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.25s ease;
		background: transparent;
		cursor: default;
	}
	.check-box.checked { background: var(--emerald); border-color: var(--emerald-light); box-shadow: 0 0 8px rgba(95, 170, 123, 0.25); }
	.check-box.checked svg { color: white; }
	.check-box.clickable { cursor: pointer; }
	.check-box.clickable:hover { border-color: var(--primary); }
	.check-box:disabled { cursor: not-allowed; }
	.check-text { font-size: 0.88rem; color: var(--text-secondary); font-weight: 400; transition: all 0.2s; flex: 1; }
	.checklist-item.checked .check-text { color: var(--text-primary); }
	.check-hint {
		font-size: 0.6rem;
		color: var(--text-muted);
		opacity: 0;
		transition: opacity 0.2s;
		margin-left: auto;
	}
	.checklist-item:hover .check-hint { opacity: 0.6; }
	.completed-by {
		font-size: 0.65rem;
		color: var(--emerald-light);
		font-weight: 500;
		white-space: nowrap;
		padding: 0.1rem 0.4rem;
		background: rgba(95, 170, 123, 0.1);
		border-radius: 4px;
	}
	.step-actions {
		display: flex;
		gap: 0.25rem;
		margin-left: auto;
		opacity: 0;
		transition: opacity 0.2s;
	}
	.checklist-item:hover .step-actions { opacity: 1; }
	.step-action-btn {
		width: 22px;
		height: 22px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}
	.step-action-btn.modify:hover { background: rgba(232, 151, 107, 0.15); color: var(--primary-light); }
	.step-action-btn.delete:hover { background: rgba(220, 80, 80, 0.15); color: #e06060; }
	.step-action-btn.confirm-delete { background: rgba(95, 170, 123, 0.15); color: var(--emerald); opacity: 1; }
	.step-action-btn.confirm-delete:hover { background: rgba(95, 170, 123, 0.25); }
	.step-action-btn.cancel-delete { background: rgba(220, 80, 80, 0.1); color: #e06060; opacity: 1; }
	.step-action-btn.cancel-delete:hover { background: rgba(220, 80, 80, 0.2); }
	.edit-step-field { display: flex; align-items: center; gap: 0.35rem; flex: 1; }
	.edit-step-input {
		background: rgba(255, 250, 245, 0.08);
		border: 1px solid rgba(232, 151, 107, 0.3);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		color: var(--text-primary);
		font-size: 0.88rem;
		flex: 1;
	}
	.edit-step-input:focus { outline: none; border-color: var(--primary); }
	.edit-step-save, .edit-step-cancel {
		background: none; border: none; cursor: pointer; padding: 0.2rem; border-radius: 4px;
		display: flex; align-items: center; justify-content: center; color: var(--text-muted);
	}
	.edit-step-save { color: var(--emerald); }
	.edit-step-save:hover { background: rgba(95, 170, 123, 0.15); }
	.edit-step-cancel:hover { background: rgba(255, 250, 245, 0.08); }
	.add-step-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		border: 1px dashed rgba(232, 151, 107, 0.25);
		background: transparent;
		color: var(--primary-light);
		font-size: 0.8rem;
		font-weight: 500;
		border-radius: var(--radius-xs);
		cursor: pointer;
		transition: all 0.2s;
		font-family: inherit;
		width: 100%;
		justify-content: center;
	}
	.add-step-btn:hover { background: rgba(232, 151, 107, 0.06); border-color: rgba(232, 151, 107, 0.4); }
	.add-step-form {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.75rem;
	}
	.add-step-input {
		flex: 1;
		background: rgba(255, 250, 245, 0.08);
		border: 1px solid rgba(232, 151, 107, 0.3);
		border-radius: 4px;
		padding: 0.35rem 0.5rem;
		color: var(--text-primary);
		font-size: 0.85rem;
		font-family: inherit;
	}
	.add-step-input:focus { outline: none; border-color: var(--primary); }
	.add-step-confirm, .add-step-cancel {
		padding: 0.3rem 0.6rem;
		border: none;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.2s;
	}
	.add-step-confirm { background: var(--emerald); color: white; }
	.add-step-confirm:hover { background: #4a9b6d; }
	.add-step-cancel { background: rgba(255, 250, 245, 0.08); color: var(--text-muted); }
	.add-step-cancel:hover { background: rgba(255, 250, 245, 0.12); }
	.checklist-progress {
		display: flex; align-items: center; gap: 0.75rem; padding-top: 0.75rem;
		border-top: 1px solid rgba(255, 250, 245, 0.05);
	}
	.checklist-bar { flex: 1; height: 4px; background: rgba(255, 250, 245, 0.08); border-radius: 100px; overflow: hidden; }
	.checklist-fill { height: 100%; background: linear-gradient(90deg, var(--emerald), var(--emerald-light)); border-radius: 100px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
	.checklist-count { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

	/* ===== STATUS BANNER ===== */
	.status-banner {
		position: relative; text-align: center; padding: 1.75rem 2rem; margin: 0.5rem 0 1.75rem;
		background: rgba(255, 250, 245, 0.03); border: 1px solid rgba(255, 250, 245, 0.05);
		border-radius: var(--radius); overflow: hidden; animation: fadeIn 0.5s ease 0.15s both;
	}
	.status-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 200px; height: 2px; background: linear-gradient(90deg, transparent, var(--primary), transparent); }
	.status-content { position: relative; z-index: 1; }
	.status-title { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.3rem; letter-spacing: -0.02em; }
	.status-message { font-size: 0.9rem; color: var(--text-secondary); font-weight: 300; margin-bottom: 0.4rem; line-height: 1.5; }
	.status-time { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }

	/* ===== INFO CARDS ===== */
	.info-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.75rem; animation: fadeIn 0.5s ease 0.25s both; }
	.info-card {
		background: rgba(255, 250, 245, 0.04); border: 1px solid rgba(255, 250, 245, 0.06);
		border-radius: var(--radius-sm); padding: 0.85rem 1rem;
		display: flex; flex-direction: column; gap: 0.25rem; transition: all 0.2s ease;
	}
	.info-card:hover { background: rgba(255, 250, 245, 0.06); border-color: rgba(255, 250, 245, 0.08); }
	.info-label { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; }
	.info-value { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem; }
	.info-value.editable { cursor: pointer; transition: all 0.2s; padding: 0.15rem 0.35rem; margin: -0.15rem -0.35rem; border-radius: 4px; }
	.info-value.editable:hover { background: rgba(232, 151, 107, 0.1); }
	.edit-icon { font-size: 0.75rem; opacity: 0; transition: opacity 0.2s; color: var(--primary); }
	.info-value.editable:hover .edit-icon { opacity: 0.8; }
	.edit-field { display: flex; align-items: center; gap: 0.35rem; }
	.edit-input {
		background: rgba(255, 250, 245, 0.08);
		border: 1px solid rgba(232, 151, 107, 0.3);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 600;
		width: 100%;
	}
	.edit-input:focus { outline: none; border-color: var(--primary); }
	.edit-save, .edit-cancel {
		background: none; border: none; cursor: pointer; padding: 0.2rem; border-radius: 4px;
		display: flex; align-items: center; justify-content: center;
	}
	.edit-save { color: var(--emerald); }
	.edit-cancel { color: var(--text-muted); }
	.edit-save:hover { background: rgba(95, 170, 123, 0.15); }
	.edit-cancel:hover { background: rgba(255, 250, 245, 0.08); }

	/* ===== UPDATES ===== */
	.updates-section { animation: fadeIn 0.5s ease 0.35s both; }
	.updates-section h3 { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
	.updates-list { display: flex; flex-direction: column; }
	.update-item { display: flex; gap: 0.85rem; animation: fadeIn 0.4s ease both; }
	.update-marker { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; }
	.update-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 250, 245, 0.15); flex-shrink: 0; margin-top: 0.35rem; }
	.update-dot.latest { background: var(--primary); box-shadow: 0 0 10px rgba(232, 151, 107, 0.4); width: 10px; height: 10px; }
	.update-line { width: 1.5px; flex: 1; background: rgba(255, 250, 245, 0.06); min-height: 20px; }
	.update-body { flex: 1; padding-bottom: 1.15rem; }
	.update-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.15rem; gap: 0.5rem; }
	.update-status { font-weight: 600; color: var(--text-primary); font-size: 0.82rem; }
	.update-time { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; font-weight: 300; }
	.update-message { color: var(--text-secondary); font-size: 0.82rem; line-height: 1.5; font-weight: 300; }

	/* ===== SIGN-OFF SECTION ===== */
	.signoff-section {
		margin: 1.5rem 0;
		animation: fadeIn 0.5s ease both;
	}
	.signoff-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.9rem 1.5rem;
		background: linear-gradient(135deg, var(--emerald), #4a9b6d);
		border: none;
		border-radius: var(--radius-sm);
		color: white;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s ease;
		font-family: inherit;
		box-shadow: 0 4px 15px rgba(95, 170, 123, 0.25);
	}
	.signoff-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(95, 170, 123, 0.35);
	}
	.signoff-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(95, 170, 123, 0.12);
		border: 1px solid rgba(95, 170, 123, 0.25);
		border-radius: var(--radius-sm);
		color: var(--emerald-light);
		font-size: 0.85rem;
		font-weight: 500;
	}
	.signoff-badge.signed svg { color: var(--emerald); }
	.signoff-time {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 300;
		margin-left: auto;
	}

	/* ===== PHASE SIGN-OFF PANEL ===== */
	.phase-signoff {
		background: rgba(232, 151, 107, 0.06);
		border: 1px solid rgba(232, 151, 107, 0.15);
		border-radius: var(--radius);
		padding: 1.25rem;
	}
	.signoff-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		color: var(--primary-light);
		font-size: 0.88rem;
		font-weight: 600;
	}
	.signoff-header svg { flex-shrink: 0; }
	.signoff-status-row {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.signoff-party {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.6rem 0.75rem;
		background: rgba(255, 250, 245, 0.03);
		border: 1px solid rgba(255, 250, 245, 0.06);
		border-radius: var(--radius-xs);
	}
	.signoff-party.signed {
		background: rgba(95, 170, 123, 0.06);
		border-color: rgba(95, 170, 123, 0.15);
	}
	.party-label {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
	}
	.party-badge {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.78rem;
		font-weight: 500;
	}
	.party-badge.signed {
		color: var(--emerald-light);
	}
	.party-badge.signed svg { color: var(--emerald); flex-shrink: 0; }
	.party-badge.pending {
		color: var(--text-muted);
		font-style: italic;
	}
	.signoff-button.final {
		background: linear-gradient(135deg, var(--primary-dark), var(--primary));
		box-shadow: 0 4px 15px rgba(232, 151, 107, 0.25);
	}
	.signoff-button.final:hover {
		box-shadow: 0 6px 20px rgba(232, 151, 107, 0.35);
	}

	/* ===== ADMIN NAVIGATION ===== */
	.admin-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin: 1rem 0;
	}
	.admin-nav-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 1rem;
		border: 1px solid rgba(255, 250, 245, 0.1);
		border-radius: var(--radius-xs);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		background: rgba(255, 250, 245, 0.04);
		color: var(--text-secondary);
	}
	.admin-nav-btn:hover {
		background: rgba(255, 250, 245, 0.08);
		border-color: rgba(255, 250, 245, 0.18);
		color: var(--text-primary);
	}
	.admin-nav-btn.advance {
		background: rgba(232, 151, 107, 0.1);
		border-color: rgba(232, 151, 107, 0.25);
		color: var(--primary-light);
	}
	.admin-nav-btn.advance:hover {
		background: rgba(232, 151, 107, 0.18);
		border-color: rgba(232, 151, 107, 0.4);
	}
	.admin-nav-btn.reverse {
		background: rgba(220, 80, 80, 0.08);
		border-color: rgba(220, 80, 80, 0.2);
		color: #e07070;
	}
	.admin-nav-btn.reverse:hover {
		background: rgba(220, 80, 80, 0.15);
		border-color: rgba(220, 80, 80, 0.35);
	}

	/* ===== AUDIT TRAIL ===== */
	.audit-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 250, 245, 0.05);
		animation: fadeIn 0.5s ease 0.4s both;
	}
	.audit-section h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 500;
		margin-bottom: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	.audit-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
	}
	.audit-item {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 0.75rem;
		background: rgba(255, 250, 245, 0.03);
		border-radius: 6px;
		border-left: 3px solid var(--primary);
	}
	.audit-action {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--primary-light);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.audit-details {
		font-size: 0.82rem;
		color: var(--text-secondary);
	}
	.audit-meta {
		display: flex;
		justify-content: space-between;
		margin-top: 0.25rem;
	}
	.audit-user {
		font-size: 0.7rem;
		color: var(--text-muted);
		font-weight: 500;
	}
	.audit-time {
		font-size: 0.7rem;
		color: var(--text-muted);
		font-weight: 300;
	}

	@media (max-width: 700px) {
		.info-row { grid-template-columns: repeat(2, 1fr); }
		.step { width: 70px; }
		.step-icon { width: 48px; height: 48px; }
		.step-connector { margin-top: calc(0.5rem + 22px); }
		.step-label { font-size: 0.62rem; }
	}
</style>

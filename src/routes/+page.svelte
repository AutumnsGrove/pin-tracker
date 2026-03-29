<script lang="ts">
	import { onMount } from 'svelte';
	import PinTracker from '$lib/components/PinTracker.svelte';
	import { theme } from '$lib/stores/theme';
	import type { Theme } from '$lib/stores/theme';
	import { currentUser, mockUsers, hasPermission, type UserRole } from '$lib/stores/users';
	import NewOrderWizard from '$lib/components/NewOrderWizard.svelte';

	let currentTheme = $state<Theme>('mountain');

	// Wizard state
	let wizardOpen = $state(false);

	onMount(() => {
		theme.init();
		const unsubscribe = theme.subscribe(t => currentTheme = t);
		// Auto-login as admin for demo
		currentUser.login(mockUsers[0]);
		return unsubscribe;
	});

	// Reactive permission checks
	let userCanCheck = $derived(hasPermission($currentUser, 'check_items'));
	let userCanSignOff = $derived(hasPermission($currentUser, 'sign_off'));
	let userCanEditGoals = $derived(hasPermission($currentUser, 'edit_goals'));
	let userCanManageSteps = $derived(hasPermission($currentUser, 'manage_steps'));

	function switchRole(role: UserRole) {
		currentUser.switchRole(role);
	}

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

	interface Order {
		id: string;
		customerName: string;
		pinDesign: string;
		quantity: number;
		status: 'ordered' | 'design' | 'production' | 'quality' | 'shipped';
		estimatedCompletion: string;
		progress: number;
		// Track which checklist items are checked per stage, and who completed them
		checkedItems: Record<string, CheckedItem[]>;
		// Track step names per stage (mutable by admin)
		stepNames: Record<string, string[]>;
		// Per-phase sign-off tracking (both admin and client must sign to advance)
		phaseSignOffs: Record<string, PhaseSignOff>;
		// Final order sign-off (quality/shipped approval)
		signedOff: boolean;
		signedOffBy: string | null;
		signedOffAt: string | null;
		// Audit trail
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
	}

	const C = (checked: boolean, by: string | null = null): CheckedItem => ({ checked, completedBy: checked ? (by || 'Admin User') : null });
	const U = (): CheckedItem => ({ checked: false, completedBy: null });

	const emptySignOff = (): PhaseSignOff => ({
		adminSigned: false, clientSigned: false,
		adminSignedBy: null, clientSignedBy: null,
		adminSignedAt: null, clientSignedAt: null
	});

	function defaultPhaseSignOffs(): Record<string, PhaseSignOff> {
		return { ordered: emptySignOff(), design: emptySignOff(), production: emptySignOff(), quality: emptySignOff(), shipped: emptySignOff() };
	}

	const signedOff = (): PhaseSignOff => ({
		adminSigned: true, clientSigned: true,
		adminSignedBy: 'Admin User', clientSignedBy: 'Client User',
		adminSignedAt: '2024-03-15 10:00 AM', clientSignedAt: '2024-03-15 10:05 AM'
	});

	function emptyStage(): CheckedItem[] {
		return [
			{ checked: false, completedBy: null },
			{ checked: false, completedBy: null },
			{ checked: false, completedBy: null },
			{ checked: false, completedBy: null },
			{ checked: false, completedBy: null }
		];
	}

	const defaultStepNames: Record<string, string[]> = {
		ordered: ['Order details confirmed', 'Payment processed', 'Design reference uploaded', 'Assigned to production queue', 'Confirmation email sent'],
		design: ['Initial concept sketch created', 'Color palette finalized', 'Vector artwork prepared', 'Client approval received', 'Die line template generated'],
		production: ['Metal mold cast', 'Base plating applied', 'Enamel colors filled', 'Baking and curing complete', 'Attachment hardware fitted'],
		quality: ['Visual inspection passed', 'Color accuracy verified', 'Plating quality confirmed', 'Pin mechanism tested', 'Packaging prepared'],
		shipped: ['Order packed and sealed', 'Shipping label created', 'Handed to carrier', 'Tracking number generated', 'Delivery confirmation sent']
	};

	function defaultStepNamesForOrder(): Record<string, string[]> {
		return {
			ordered: [...defaultStepNames.ordered],
			design: [...defaultStepNames.design],
			production: [...defaultStepNames.production],
			quality: [...defaultStepNames.quality],
			shipped: [...defaultStepNames.shipped]
		};
	}

	let orders: Order[] = $state([
		{
			id: 'PIN-2024-001',
			customerName: 'Sarah Johnson',
			pinDesign: 'Golden Retriever',
			quantity: 5,
			status: 'production',
			estimatedCompletion: '2024-03-20',
			progress: 60,
			checkedItems: {
				ordered: [C(true), C(true), C(true), C(true), C(true)],
				design: [C(true), C(true), C(true), C(true), C(true)],
				production: [C(true), C(true), C(true), U(), U()],
				quality: [U(), U(), U(), U(), U()],
				shipped: [U(), U(), U(), U(), U()]
			},
			stepNames: defaultStepNamesForOrder(),
			phaseSignOffs: {
				ordered: signedOff(),
				design: signedOff(),
				production: emptySignOff(),
				quality: emptySignOff(),
				shipped: emptySignOff()
			},
			signedOff: false,
			signedOffBy: null,
			signedOffAt: null,
			auditTrail: [
				{ action: 'Created', details: 'Order created', user: 'Admin User', timestamp: '2024-03-15 10:30 AM' },
				{ action: 'Status Change', details: 'Moved to Design Phase', user: 'Admin User', timestamp: '2024-03-15 2:00 PM' },
				{ action: 'Item Checked', details: 'Checked: Metal mold cast', user: 'Admin User', timestamp: '2024-03-16 9:00 AM' },
				{ action: 'Item Checked', details: 'Checked: Base plating applied', user: 'Admin User', timestamp: '2024-03-16 9:05 AM' },
				{ action: 'Item Checked', details: 'Checked: Enamel colors filled', user: 'Admin User', timestamp: '2024-03-16 9:15 AM' }
			],
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received and is being processed.', timestamp: '2024-03-15 10:30 AM' },
				{ status: 'Design Phase', message: 'Design for Golden Retriever pin has been approved.', timestamp: '2024-03-15 2:00 PM' },
				{ status: 'In Production', message: 'Enamel filling process has begun. 3 of 5 completed.', timestamp: '2024-03-16 9:15 AM' }
			]
		},
		{
			id: 'PIN-2024-002',
			customerName: 'Mike Chen',
			pinDesign: 'Space Rocket',
			quantity: 10,
			status: 'design',
			estimatedCompletion: '2024-03-22',
			progress: 25,
			checkedItems: {
				ordered: [C(true), C(true), C(true), C(true), C(true)],
				design: [C(true), C(true), U(), U(), U()],
				production: [U(), U(), U(), U(), U()],
				quality: [U(), U(), U(), U(), U()],
				shipped: [U(), U(), U(), U(), U()]
			},
			stepNames: defaultStepNamesForOrder(),
			phaseSignOffs: {
				ordered: signedOff(),
				design: emptySignOff(),
				production: emptySignOff(),
				quality: emptySignOff(),
				shipped: emptySignOff()
			},
			signedOff: false,
			signedOffBy: null,
			signedOffAt: null,
			auditTrail: [
				{ action: 'Created', details: 'Order created', user: 'Admin User', timestamp: '2024-03-16 11:00 AM' }
			],
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received.', timestamp: '2024-03-16 11:00 AM' },
				{ status: 'Design Phase', message: 'Our artists are creating the Space Rocket design mockup.', timestamp: '2024-03-16 11:05 AM' }
			]
		},
		{
			id: 'PIN-2024-003',
			customerName: 'Emily Davis',
			pinDesign: 'Cat with Crown',
			quantity: 3,
			status: 'quality',
			estimatedCompletion: '2024-03-18',
			progress: 90,
			checkedItems: {
				ordered: [C(true), C(true), C(true), C(true), C(true)],
				design: [C(true), C(true), C(true), C(true), C(true)],
				production: [C(true), C(true), C(true), C(true), C(true)],
				quality: [C(true), C(true), U(), U(), U()],
				shipped: [U(), U(), U(), U(), U()]
			},
			stepNames: defaultStepNamesForOrder(),
			phaseSignOffs: {
				ordered: signedOff(),
				design: signedOff(),
				production: signedOff(),
				quality: emptySignOff(),
				shipped: emptySignOff()
			},
			signedOff: true,
			signedOffBy: 'Client - Emily Davis',
			signedOffAt: '2024-03-17 3:00 PM',
			auditTrail: [
				{ action: 'Created', details: 'Order created', user: 'Admin User', timestamp: '2024-03-14 3:00 PM' },
				{ action: 'Sign Off', details: 'Order signed off by client', user: 'Client - Emily Davis', timestamp: '2024-03-17 3:00 PM' }
			],
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received.', timestamp: '2024-03-14 3:00 PM' },
				{ status: 'Design Approved', message: 'Cat with Crown design has been approved.', timestamp: '2024-03-14 5:30 PM' },
				{ status: 'In Production', message: 'All pins have been enameled and plated.', timestamp: '2024-03-16 10:00 AM' },
				{ status: 'Quality Check', message: 'Final quality inspection in progress.', timestamp: '2024-03-17 8:00 AM' }
			]
		},
		{
			id: 'PIN-2024-004',
			customerName: 'Alex Rivera',
			pinDesign: 'Vintage Camera',
			quantity: 2,
			status: 'shipped',
			estimatedCompletion: '2024-03-17',
			progress: 100,
			checkedItems: {
				ordered: [C(true), C(true), C(true), C(true), C(true)],
				design: [C(true), C(true), C(true), C(true), C(true)],
				production: [C(true), C(true), C(true), C(true), C(true)],
				quality: [C(true), C(true), C(true), C(true), C(true)],
				shipped: [C(true), C(true), C(true), C(true), C(true)]
			},
			stepNames: defaultStepNamesForOrder(),
			phaseSignOffs: {
				ordered: signedOff(),
				design: signedOff(),
				production: signedOff(),
				quality: signedOff(),
				shipped: signedOff()
			},
			signedOff: true,
			signedOffBy: 'Client - Alex Rivera',
			signedOffAt: '2024-03-15 2:00 PM',
			auditTrail: [
				{ action: 'Created', details: 'Order created', user: 'Admin User', timestamp: '2024-03-10 9:00 AM' },
				{ action: 'Sign Off', details: 'Order signed off by client', user: 'Client - Alex Rivera', timestamp: '2024-03-15 2:00 PM' }
			],
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received.', timestamp: '2024-03-10 9:00 AM' },
				{ status: 'Design Approved', message: 'Vintage Camera design has been approved.', timestamp: '2024-03-10 2:00 PM' },
				{ status: 'In Production', message: 'Pins are being manufactured with care.', timestamp: '2024-03-12 11:00 AM' },
				{ status: 'Quality Check Passed', message: 'All pins passed quality inspection!', timestamp: '2024-03-14 3:00 PM' },
				{ status: 'Shipped!', message: 'Your order has been shipped via USPS Priority Mail.', timestamp: '2024-03-15 10:00 AM' }
			]
		},
		{
			id: 'PIN-2024-005',
			customerName: 'Jordan Kim',
			pinDesign: 'Mountain Landscape',
			quantity: 8,
			status: 'ordered',
			estimatedCompletion: '2024-03-25',
			progress: 5,
			checkedItems: {
				ordered: [C(true), C(true), U(), U(), U()],
				design: [U(), U(), U(), U(), U()],
				production: [U(), U(), U(), U(), U()],
				quality: [U(), U(), U(), U(), U()],
				shipped: [U(), U(), U(), U(), U()]
			},
			stepNames: defaultStepNamesForOrder(),
			phaseSignOffs: defaultPhaseSignOffs(),
			signedOff: false,
			signedOffBy: null,
			signedOffAt: null,
			auditTrail: [
				{ action: 'Created', details: 'Order created', user: 'Admin User', timestamp: '2024-03-17 8:30 AM' }
			],
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received and is in the queue.', timestamp: '2024-03-17 8:30 AM' }
			]
		}
	]);

	let selectedOrder: Order = $state(orders[0]);

	function selectOrder(order: Order) {
		selectedOrder = order;
	}

	const stageOrder: Array<'ordered' | 'design' | 'production' | 'quality' | 'shipped'> = ['ordered', 'design', 'production', 'quality', 'shipped'];
	const stageDisplayNames: Record<string, string> = {
		ordered: 'Order Received',
		design: 'Design Phase',
		production: 'In Production',
		quality: 'Quality Check',
		shipped: 'Shipped!'
	};

	function handleCheckItem(stageKey: string, itemIndex: number, checked: boolean) {
		// Update the checkedItems array
		if (!selectedOrder.checkedItems[stageKey]) {
			const stepCount = selectedOrder.stepNames[stageKey]?.length ?? 5;
			selectedOrder.checkedItems[stageKey] = Array.from({ length: stepCount }, () => ({ checked: false, completedBy: null }));
		}
		selectedOrder.checkedItems[stageKey][itemIndex] = {
			checked,
			completedBy: checked ? ($currentUser?.role || null) : null
		};

		// Add to audit trail
		const itemName = getChecklistItemName(stageKey, itemIndex);
		selectedOrder.auditTrail = [
			{
				action: 'Item ' + (checked ? 'Checked' : 'Unchecked'),
				details: (checked ? 'Checked' : 'Unchecked') + ': ' + itemName,
				user: $currentUser?.name || 'Unknown User',
				timestamp: new Date().toLocaleString()
			},
			...selectedOrder.auditTrail
		];

		// No auto-advance: phase requires both admin and client sign-off to proceed
		// The sign-off UI is shown when all checks are complete (handled in PinTracker)

		// Recalculate progress based on total checked items across all stages
		let totalChecked = 0;
		let totalItems = 0;
		for (const stage of stageOrder) {
			const items = selectedOrder.checkedItems[stage];
			if (items) {
				totalChecked += items.filter(item => item.checked).length;
				totalItems += items.length;
			}
		}
		selectedOrder.progress = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

		// Trigger reactivity
		orders = [...orders];
	}

	function getChecklistItemName(stageKey: string, itemIndex: number): string {
		return selectedOrder.stepNames[stageKey]?.[itemIndex] || 'Unknown item';
	}

	function handlePhaseSignOff(stageKey: string) {
		const role = $currentUser?.role;
		const name = $currentUser?.name || 'Unknown User';
		if (!selectedOrder.phaseSignOffs[stageKey]) {
			selectedOrder.phaseSignOffs[stageKey] = emptySignOff();
		}
		const signOff = selectedOrder.phaseSignOffs[stageKey];
		const now = new Date().toLocaleString();

		if (role === 'admin') {
			signOff.adminSigned = true;
			signOff.adminSignedBy = name;
			signOff.adminSignedAt = now;
		} else if (role === 'client') {
			signOff.clientSigned = true;
			signOff.clientSignedBy = name;
			signOff.clientSignedAt = now;
		}

		selectedOrder.auditTrail = [
			{
				action: 'Phase Sign Off',
				details: `${stageDisplayNames[stageKey]} signed off by ${role}`,
				user: name,
				timestamp: now
			},
			...selectedOrder.auditTrail
		];

		// If both admin and client have signed, advance to next stage
		if (signOff.adminSigned && signOff.clientSigned) {
			const currentStageIdx = stageOrder.indexOf(selectedOrder.status as typeof stageOrder[number]);
			if (currentStageIdx < stageOrder.length - 1) {
				const nextStage = stageOrder[currentStageIdx + 1];
				selectedOrder.status = nextStage;

				selectedOrder.auditTrail = [
					{
						action: 'Stage Advanced',
						details: `Both parties signed off — moved to ${stageDisplayNames[nextStage]}`,
						user: 'System',
						timestamp: now
					},
					...selectedOrder.auditTrail
				];

				selectedOrder.updates = [
					...selectedOrder.updates,
					{
						status: stageDisplayNames[nextStage],
						message: `All ${stageDisplayNames[stageKey]} tasks completed and approved. Moving to ${stageDisplayNames[nextStage]}.`,
						timestamp: now
					}
				];
			}
		}

		orders = [...orders];
	}

	function handleAdvancePhase() {
		const currentStageIdx = stageOrder.indexOf(selectedOrder.status as typeof stageOrder[number]);
		if (currentStageIdx >= stageOrder.length - 1) return;

		const nextStage = stageOrder[currentStageIdx + 1];
		const name = $currentUser?.name || 'Unknown User';
		const now = new Date().toLocaleString();

		selectedOrder.status = nextStage;

		selectedOrder.auditTrail = [
			{
				action: 'Stage Advanced (Forced)',
				details: `Admin forced advance to ${stageDisplayNames[nextStage]}`,
				user: name,
				timestamp: now
			},
			...selectedOrder.auditTrail
		];

		selectedOrder.updates = [
			...selectedOrder.updates,
			{
				status: stageDisplayNames[nextStage],
				message: `Admin moved order to ${stageDisplayNames[nextStage]}.`,
				timestamp: now
			}
		];

		orders = [...orders];
	}

	function handleReversePhase() {
		const currentStageIdx = stageOrder.indexOf(selectedOrder.status as typeof stageOrder[number]);
		if (currentStageIdx <= 0) return;

		const prevStage = stageOrder[currentStageIdx - 1];
		const name = $currentUser?.name || 'Unknown User';
		const now = new Date().toLocaleString();

		// Reset sign-offs for the previous stage so it requires re-approval
		selectedOrder.phaseSignOffs[prevStage] = emptySignOff();

		selectedOrder.status = prevStage;

		selectedOrder.auditTrail = [
			{
				action: 'Stage Reversed (Forced)',
				details: `Admin reversed back to ${stageDisplayNames[prevStage]}`,
				user: name,
				timestamp: now
			},
			...selectedOrder.auditTrail
		];

		selectedOrder.updates = [
			...selectedOrder.updates,
			{
				status: stageDisplayNames[prevStage],
				message: `Admin moved order back to ${stageDisplayNames[prevStage]}. Sign-offs reset.`,
				timestamp: now
			}
		];

		// Recalculate progress
		let totalChecked = 0;
		let totalItems = 0;
		for (const stage of stageOrder) {
			const items = selectedOrder.checkedItems[stage];
			if (items) {
				totalChecked += items.filter(item => item.checked).length;
				totalItems += items.length;
			}
		}
		selectedOrder.progress = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

		orders = [...orders];
	}

	function handleFinalSignOff() {
		selectedOrder.signedOff = true;
		selectedOrder.signedOffBy = $currentUser?.name || 'Unknown User';
		selectedOrder.signedOffAt = new Date().toLocaleString();
		
		// Add to audit trail
		selectedOrder.auditTrail = [
			{
				action: 'Final Sign Off',
				details: 'Order approved',
				user: $currentUser?.name || 'Unknown User',
				timestamp: new Date().toLocaleString()
			},
			...selectedOrder.auditTrail
		];
		
		orders = [...orders];
	}

	function handleEditGoal(field: string, value: string | number) {
		// Validate field name against allowlist
		const allowedFields = ['estimatedCompletion', 'customerName', 'pinDesign', 'quantity'];
		if (!allowedFields.includes(field)) {
			console.warn(`Invalid editable field: ${field}`);
			return;
		}
		
		// Update the field value with proper typing
		switch (field) {
			case 'estimatedCompletion':
				selectedOrder.estimatedCompletion = String(value);
				break;
			case 'customerName':
				selectedOrder.customerName = String(value);
				break;
			case 'pinDesign':
				selectedOrder.pinDesign = String(value);
				break;
			case 'quantity':
				selectedOrder.quantity = Number(value);
				break;
		}
		
		// Add to audit trail
		selectedOrder.auditTrail = [
			{
				action: 'Goal Edited',
				details: `Changed ${field} to ${value}`,
				user: $currentUser?.name || 'Unknown User',
				timestamp: new Date().toLocaleString()
			},
			...selectedOrder.auditTrail
		];
		
		orders = [...orders];
	}

	function handleAddStep(stageKey: string, stepName: string) {
		if (!selectedOrder.stepNames[stageKey]) {
			selectedOrder.stepNames[stageKey] = [];
		}
		selectedOrder.stepNames[stageKey] = [...selectedOrder.stepNames[stageKey], stepName];

		if (!selectedOrder.checkedItems[stageKey]) {
			selectedOrder.checkedItems[stageKey] = [];
		}
		selectedOrder.checkedItems[stageKey] = [
			...selectedOrder.checkedItems[stageKey],
			{ checked: false, completedBy: null }
		];

		selectedOrder.auditTrail = [
			{
				action: 'Step Added',
				details: `Added step: ${stepName}`,
				user: $currentUser?.name || 'Unknown User',
				timestamp: new Date().toLocaleString()
			},
			...selectedOrder.auditTrail
		];

		orders = [...orders];
	}

	function handleDeleteStep(stageKey: string, itemIndex: number) {
		const stepName = selectedOrder.stepNames[stageKey]?.[itemIndex] || 'Unknown';
		if (selectedOrder.stepNames[stageKey]) {
			selectedOrder.stepNames[stageKey] = selectedOrder.stepNames[stageKey].filter((_, i) => i !== itemIndex);
		}
		if (selectedOrder.checkedItems[stageKey]) {
			selectedOrder.checkedItems[stageKey] = selectedOrder.checkedItems[stageKey].filter((_, i) => i !== itemIndex);
		}

		// Recalculate progress
		let totalChecked = 0;
		let totalItems = 0;
		for (const stage of stageOrder) {
			const items = selectedOrder.checkedItems[stage];
			if (items) {
				totalChecked += items.filter(item => item.checked).length;
				totalItems += items.length;
			}
		}
		selectedOrder.progress = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

		selectedOrder.auditTrail = [
			{
				action: 'Step Deleted',
				details: `Deleted step: ${stepName}`,
				user: $currentUser?.name || 'Unknown User',
				timestamp: new Date().toLocaleString()
			},
			...selectedOrder.auditTrail
		];

		orders = [...orders];
	}

	function handleModifyStep(stageKey: string, itemIndex: number, newName: string) {
		const oldName = selectedOrder.stepNames[stageKey]?.[itemIndex] || 'Unknown';
		if (selectedOrder.stepNames[stageKey]) {
			selectedOrder.stepNames[stageKey][itemIndex] = newName;
		}

		selectedOrder.auditTrail = [
			{
				action: 'Step Modified',
				details: `Renamed step: ${oldName} → ${newName}`,
				user: $currentUser?.name || 'Unknown User',
				timestamp: new Date().toLocaleString()
			},
			...selectedOrder.auditTrail
		];

		orders = [...orders];
	}

	function openWizard() {
		wizardOpen = true;
	}

	function closeWizard() {
		wizardOpen = false;
	}

	function handleWizardSubmit(orderData: {
		customerName: string;
		pinDesign: string;
		quantity: number;
		estimatedCompletion: string;
		notes: string;
	}) {
		const newOrder: Order = {
			id: `PIN-2024-00${orders.length + 1}`,
			customerName: orderData.customerName,
			pinDesign: orderData.pinDesign,
			quantity: orderData.quantity,
			status: 'ordered',
			estimatedCompletion: orderData.estimatedCompletion,
			progress: 5,
			checkedItems: {
				ordered: emptyStage(),
				design: emptyStage(),
				production: emptyStage(),
				quality: emptyStage(),
				shipped: emptyStage()
			},
			stepNames: defaultStepNamesForOrder(),
			phaseSignOffs: defaultPhaseSignOffs(),
			signedOff: false,
			signedOffBy: null,
			signedOffAt: null,
			auditTrail: [
				{ action: 'Created', details: 'Order created', user: $currentUser?.name || 'Admin User', timestamp: new Date().toLocaleString() },
				...(orderData.notes ? [{ action: 'Notes', details: orderData.notes, user: $currentUser?.name || 'Admin User', timestamp: new Date().toLocaleString() }] : [])
			],
			updates: [
				{ status: 'Order Placed', message: `Order for ${orderData.customerName} has been received and is in the queue.`, timestamp: new Date().toLocaleString() }
			]
		};
		orders = [newOrder, ...orders];
		selectedOrder = newOrder;
		wizardOpen = false;
	}
</script>

<!-- Mountain landscape background scene - only shown for mountain theme -->
{#if currentTheme === 'mountain'}
	<div class="scene" aria-hidden="true">
		<div class="sky"></div>
		<div class="stars">
			{#each Array(60) as _, i}
				<div
					class="star"
					style="left: {Math.random() * 100}%; top: {Math.random() * 40}%; width: {1 + Math.random() * 2}px; height: {1 + Math.random() * 2}px; opacity: {0.2 + Math.random() * 0.6}; animation-delay: {Math.random() * 4}s;"
				></div>
			{/each}
		</div>
		<div class="sun-glow"></div>
		<div class="sun-glow-inner"></div>
		<svg class="mountains" viewBox="0 0 1440 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 380 L80 320 L160 350 L240 280 L320 310 L400 260 L480 290 L560 240 L640 270 L720 220 L800 250 L880 200 L960 230 L1040 190 L1120 220 L1200 250 L1280 210 L1360 240 L1440 280 L1440 600 L0 600Z" fill="#1e2240" opacity="0.5"/>
			<rect x="0" y="340" width="1440" height="40" fill="url(#fog1)" opacity="0.15"/>
			<path d="M0 420 L100 370 L180 390 L280 330 L380 360 L460 310 L540 340 L640 290 L720 320 L820 270 L900 300 L1000 260 L1080 290 L1160 250 L1260 280 L1340 300 L1440 340 L1440 600 L0 600Z" fill="#171a30" opacity="0.7"/>
			<rect x="0" y="380" width="1440" height="50" fill="url(#fog2)" opacity="0.12"/>
			<path d="M0 460 L60 430 L140 450 L220 390 L320 420 L400 370 L500 400 L580 360 L680 390 L760 350 L860 380 L940 340 L1040 370 L1120 330 L1220 360 L1300 380 L1440 400 L1440 600 L0 600Z" fill="#131630" opacity="0.85"/>
			<rect x="0" y="420" width="1440" height="60" fill="url(#fog3)" opacity="0.1"/>
			<path d="M0 500 L80 470 L180 490 L260 440 L360 460 L440 420 L540 450 L640 410 L740 440 L840 400 L940 430 L1020 390 L1120 420 L1200 440 L1300 410 L1380 430 L1440 450 L1440 600 L0 600Z" fill="#0e1020" opacity="0.92"/>
			<path d="M0 560 L120 530 L240 550 L360 520 L480 540 L600 510 L720 530 L840 500 L960 520 L1080 540 L1200 510 L1320 530 L1440 520 L1440 600 L0 600Z" fill="#090b14"/>
			<rect x="0" y="520" width="1440" height="80" fill="url(#valleyMist)" opacity="0.08"/>
			<defs>
				<linearGradient id="fog1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="transparent"/><stop offset="20%" stop-color="#c8beb4" stop-opacity="0.5"/><stop offset="50%" stop-color="#c8beb4" stop-opacity="0.8"/><stop offset="80%" stop-color="#c8beb4" stop-opacity="0.4"/><stop offset="100%" stop-color="transparent"/></linearGradient>
				<linearGradient id="fog2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="transparent"/><stop offset="30%" stop-color="#d4ccc0" stop-opacity="0.6"/><stop offset="60%" stop-color="#d4ccc0" stop-opacity="0.9"/><stop offset="85%" stop-color="#d4ccc0" stop-opacity="0.3"/><stop offset="100%" stop-color="transparent"/></linearGradient>
				<linearGradient id="fog3" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="transparent"/><stop offset="15%" stop-color="#e0d6c8" stop-opacity="0.4"/><stop offset="45%" stop-color="#e0d6c8" stop-opacity="1"/><stop offset="70%" stop-color="#e0d6c8" stop-opacity="0.6"/><stop offset="100%" stop-color="transparent"/></linearGradient>
				<linearGradient id="valleyMist" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c8beb4" stop-opacity="1"/><stop offset="100%" stop-color="#c8beb4" stop-opacity="0"/></linearGradient>
			</defs>
		</svg>
		<div class="fog-layer fog-1"></div>
		<div class="fog-layer fog-2"></div>
	</div>
{/if}

<!-- Light/Dark theme backgrounds -->
{#if currentTheme === 'light'}
	<div class="light-bg" aria-hidden="true"></div>
{/if}

{#if currentTheme === 'dark'}
	<div class="dark-bg" aria-hidden="true"></div>
{/if}

<div class="container">
	<header>
		<div class="header-top">
			<div class="header-badge">PIN PRODUCTION TRACKER</div>
			<!-- Role Selector -->
			<div class="role-selector">
				<span class="role-label">Viewing as:</span>
				<div class="role-buttons">
					<button 
						class="role-btn" 
						class:active={$currentUser?.role === 'admin'}
						onclick={() => switchRole('admin')}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
						</svg>
						Admin
					</button>
					<button 
						class="role-btn client"
						class:active={$currentUser?.role === 'client'}
						onclick={() => switchRole('client')}
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
						Client
					</button>
				</div>
			</div>
		</div>
		<h1>Pin Tracker</h1>
	</header>

	<!-- Order selector tabs -->
	<nav class="order-tabs">
		{#each orders as order (order.id)}
			<button
				class="order-tab"
				class:active={selectedOrder.id === order.id}
				onclick={() => selectOrder(order)}
			>
				<span class="tab-design">{order.pinDesign}</span>
				<span class="tab-id">{order.id}</span>
				<span class="tab-progress">
					<span class="tab-bar">
						<span class="tab-fill" style="width: {order.progress}%"></span>
					</span>
				</span>
			</button>
		{/each}
		<button class="order-tab new-tab" onclick={openWizard}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			<span class="tab-design">New</span>
		</button>
	</nav>

	<!-- Main tracker panel -->
	<div class="tracker-panel">
		{#key selectedOrder.id}
			<PinTracker 
				{selectedOrder} 
				onCheckItem={handleCheckItem}
				onPhaseSignOff={handlePhaseSignOff}
				onAdvancePhase={handleAdvancePhase}
				onReversePhase={handleReversePhase}
				onFinalSignOff={handleFinalSignOff}
				onEditGoal={handleEditGoal}
				onAddStep={handleAddStep}
				onDeleteStep={handleDeleteStep}
				onModifyStep={handleModifyStep}
				canCheck={userCanCheck}
				canSignOff={userCanSignOff}
				canEditGoals={userCanEditGoals}
				canManageSteps={userCanManageSteps}
				isAdmin={$currentUser?.role === 'admin'}
				currentUserRole={$currentUser?.role || ''}
				currentUserName={$currentUser?.name || ''}
			/>
		{/key}
	</div>

	<!-- New Order Wizard Modal -->
	<NewOrderWizard 
		isOpen={wizardOpen}
		onClose={closeWizard}
		onSubmit={handleWizardSubmit}
	/>
</div>

<style>
	/* ===== LIGHT THEME BACKGROUND ===== */
	.light-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
	}

	/* ===== DARK THEME BACKGROUND ===== */
	.dark-bg {
		position: fixed;
		inset: 0;
		z-index: 0;
		background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%);
	}

	/* ===== SCENE ===== */
	.scene { position: fixed; inset: 0; z-index: 0; overflow: hidden; }
	.sky {
		position: absolute; inset: 0;
		background: linear-gradient(180deg, #0b0d1a 0%, #121530 15%, #1b1e3d 25%, #2d1f4e 35%, #4a2a5a 42%, #7a3d5e 50%, #b85a5e 57%, #d47a5c 63%, #e8976b 70%, #f0b878 78%, #f5d08a 85%, #f8dfa0 92%, #faeab0 100%);
	}
	.stars { position: absolute; inset: 0; z-index: 1; }
	.star { position: absolute; background: #fff; border-radius: 50%; animation: twinkle 3s ease-in-out infinite alternate; }
	@keyframes twinkle { 0% { opacity: var(--star-o, 0.3); } 100% { opacity: calc(var(--star-o, 0.3) * 0.3); } }
	.sun-glow { position: absolute; bottom: 28%; left: 50%; transform: translate(-50%, 50%); width: 600px; height: 300px; background: radial-gradient(ellipse, rgba(250, 234, 176, 0.4) 0%, rgba(245, 208, 138, 0.15) 30%, transparent 70%); z-index: 2; animation: sunPulse 8s ease-in-out infinite; }
	.sun-glow-inner { position: absolute; bottom: 32%; left: 50%; transform: translate(-50%, 50%); width: 200px; height: 100px; background: radial-gradient(ellipse, rgba(255, 245, 220, 0.6) 0%, rgba(255, 230, 180, 0.2) 40%, transparent 70%); z-index: 2; }
	.mountains { position: absolute; bottom: 0; left: 0; width: 100%; height: 70vh; z-index: 3; }
	.fog-layer { position: absolute; z-index: 4; width: 200%; left: -50%; pointer-events: none; }
	.fog-1 { bottom: 22%; height: 80px; background: linear-gradient(90deg, transparent 0%, rgba(200,190,180,0.04) 15%, rgba(200,190,180,0.07) 35%, rgba(200,190,180,0.04) 55%, transparent 70%); animation: drift 25s ease-in-out infinite; }
	.fog-2 { bottom: 15%; height: 100px; background: linear-gradient(90deg, transparent 20%, rgba(200,190,180,0.05) 40%, rgba(200,190,180,0.08) 60%, rgba(200,190,180,0.03) 80%, transparent 95%); animation: driftSlow 35s ease-in-out infinite; }

	/* ===== HEADER ===== */
	header { text-align: center; margin-bottom: 1.5rem; animation: fadeIn 0.8s ease both; }
	.header-top {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}
	.header-badge {
		display: inline-block; padding: 0.3rem 1rem;
		background: rgba(232, 151, 107, 0.12); border: 1px solid rgba(232, 151, 107, 0.2);
		color: var(--primary-light); border-radius: 100px;
		font-size: 0.6rem; font-weight: 600; letter-spacing: 0.18em;
		margin-bottom: 0.6rem; backdrop-filter: blur(8px);
	}
	/* Role Selector */
	.role-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 250, 245, 0.04);
		padding: 0.35rem 0.75rem;
		border-radius: 100px;
		border: 1px solid rgba(255, 250, 245, 0.08);
	}
	.role-label {
		font-size: 0.7rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.role-buttons {
		display: flex;
		gap: 0.25rem;
	}
	.role-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.6rem;
		border: none;
		background: transparent;
		color: var(--text-muted);
		font-size: 0.7rem;
		font-weight: 500;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.role-btn:hover {
		background: rgba(255, 250, 245, 0.06);
		color: var(--text-secondary);
	}
	.role-btn.active {
		background: rgba(232, 151, 107, 0.15);
		color: var(--primary-light);
	}
	.role-btn.client.active {
		background: rgba(95, 170, 123, 0.15);
		color: var(--emerald-light);
	}
	header h1 {
		font-size: 2.8rem;
		background: linear-gradient(135deg, var(--sun-glow) 0%, var(--golden) 30%, var(--primary) 60%, var(--sunset-rose) 100%);
		background-size: 200% auto;
		-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
		animation: shimmer 8s linear infinite;
	}

	/* ===== ORDER TABS ===== */
	.order-tabs {
		display: flex; gap: 0.4rem; overflow-x: auto; padding: 0.25rem;
		margin-bottom: 1.25rem; animation: fadeIn 0.6s ease 0.1s both; scrollbar-width: none;
	}
	.order-tabs::-webkit-scrollbar { display: none; }
	.order-tab {
		flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start;
		gap: 0.2rem; padding: 0.65rem 1rem;
		background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
		border: 1px solid var(--glass-border); border-radius: var(--radius-sm);
		cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: inherit; color: var(--text-muted); min-width: 140px;
	}
	.order-tab:hover { background: var(--glass-bg-solid); border-color: var(--glass-border-light); }
	.order-tab.active {
		border-color: rgba(232, 151, 107, 0.35); background: rgba(232, 151, 107, 0.1);
		box-shadow: 0 0 20px rgba(232, 151, 107, 0.08);
	}
	.order-tab.active .tab-design { color: var(--text-primary); }
	.tab-design { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); transition: color 0.2s; }
	.tab-id { font-size: 0.65rem; font-family: 'SF Mono', 'Fira Code', monospace; color: var(--text-muted); }
	.tab-progress { width: 100%; margin-top: 0.15rem; }
	.tab-bar { display: block; width: 100%; height: 3px; background: rgba(255, 250, 245, 0.08); border-radius: 100px; overflow: hidden; }
	.tab-fill { display: block; height: 100%; background: linear-gradient(90deg, var(--primary-dark), var(--primary)); border-radius: 100px; transition: width 0.4s ease; }
	.order-tab.active .tab-fill { background: linear-gradient(90deg, var(--primary), var(--golden)); }
	.new-tab {
		align-items: center; justify-content: center; flex-direction: row; gap: 0.4rem;
		min-width: 90px; color: var(--primary-light); border-style: dashed;
	}
	.new-tab:hover { background: rgba(232, 151, 107, 0.08); border-color: rgba(232, 151, 107, 0.25); }

	/* ===== TRACKER PANEL ===== */
	.tracker-panel {
		background: var(--glass-bg-solid); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
		border: 1px solid var(--glass-border); border-radius: calc(var(--radius) + 4px);
		padding: 1rem 2.5rem 2.5rem; box-shadow: var(--glass-shadow), var(--glass-glow);
		animation: fadeIn 0.6s ease 0.2s both;
	}

	@media (max-width: 900px) {
		.order-tabs { flex-wrap: nowrap; }
		.tracker-panel { padding: 1rem 1.25rem 2rem; }
	}
</style>

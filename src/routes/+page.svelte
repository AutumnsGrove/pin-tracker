<script lang="ts">
	import { onMount } from 'svelte';
	import PinTracker from '$lib/components/PinTracker.svelte';
	import { theme } from '$lib/stores/theme';
	import type { Theme } from '$lib/stores/theme';

	let currentTheme = $state<Theme>('mountain');

	onMount(() => {
		theme.init();
		const unsubscribe = theme.subscribe(t => currentTheme = t);
		return unsubscribe;
	});

	interface Order {
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
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received and is in the queue.', timestamp: '2024-03-17 8:30 AM' }
			]
		}
	]);

	let selectedOrder: Order = $state(orders[0]);

	function selectOrder(order: Order) {
		selectedOrder = order;
	}

	function createNewOrder() {
		const newOrder: Order = {
			id: `PIN-2024-00${orders.length + 1}`,
			customerName: 'New Customer',
			pinDesign: 'Custom Design',
			quantity: 1,
			status: 'ordered',
			estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			progress: 5,
			updates: [
				{ status: 'Order Placed', message: 'Your order has been received and is in the queue.', timestamp: new Date().toLocaleString() }
			]
		};
		orders = [newOrder, ...orders];
		selectedOrder = newOrder;
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
		<div class="header-badge">PIN PRODUCTION TRACKER</div>
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
		<button class="order-tab new-tab" onclick={createNewOrder}>
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
			<PinTracker {selectedOrder} />
		{/key}
	</div>
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
	.header-badge {
		display: inline-block; padding: 0.3rem 1rem;
		background: rgba(232, 151, 107, 0.12); border: 1px solid rgba(232, 151, 107, 0.2);
		color: var(--primary-light); border-radius: 100px;
		font-size: 0.6rem; font-weight: 600; letter-spacing: 0.18em;
		margin-bottom: 0.6rem; backdrop-filter: blur(8px);
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

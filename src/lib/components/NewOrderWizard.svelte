<script lang="ts">
	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
		onSubmit?: (orderData: {
			customerName: string;
			pinDesign: string;
			quantity: number;
			estimatedCompletion: string;
			notes: string;
		}) => void;
	}

	let { isOpen = false, onClose, onSubmit }: Props = $props();

	// Form state
	let step = $state(1);
	let customerName = $state('');
	let pinDesign = $state('');
	let quantity = $state(100);
	let estimatedCompletion = $state('');
	let notes = $state('');

	// Validation
	let errors = $state<Record<string, string>>({});

	function validateStep(stepNum: number): boolean {
		errors = {};
		
		if (stepNum === 1) {
			if (!customerName.trim()) {
				errors.customerName = 'Customer name is required';
			}
			if (quantity < 1) {
				errors.quantity = 'Quantity must be at least 1';
			}
		}
		
		if (stepNum === 2) {
			if (!pinDesign.trim()) {
				errors.pinDesign = 'Design description is required';
			}
		}
		
		return Object.keys(errors).length === 0;
	}

	function nextStep() {
		if (validateStep(step)) {
			step = Math.min(step + 1, 3);
		}
	}

	function prevStep() {
		step = Math.max(step - 1, 1);
	}

	function handleSubmit() {
		if (validateStep(2)) {
			onSubmit?.({
				customerName: customerName.trim(),
				pinDesign: pinDesign.trim(),
				quantity,
				estimatedCompletion: estimatedCompletion || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				notes: notes.trim()
			});
			resetForm();
		}
	}

	function resetForm() {
		step = 1;
		customerName = '';
		pinDesign = '';
		quantity = 100;
		estimatedCompletion = '';
		notes = '';
		errors = {};
	}

	function handleClose() {
		resetForm();
		onClose?.();
	}

	// Set default date on mount
	$effect(() => {
		if (isOpen && !estimatedCompletion) {
			estimatedCompletion = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
		}
	});
</script>

{#if isOpen}
	<div class="wizard-overlay" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
		<div class="wizard-container">
			<button class="wizard-close" onclick={handleClose} aria-label="Close wizard">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>

			<div class="wizard-header">
				<h2 id="wizard-title">Create New Order</h2>
				<div class="wizard-progress">
					<div class="progress-step" class:active={step >= 1} class:completed={step > 1}>
						<span class="step-number">1</span>
						<span class="step-label">Basics</span>
					</div>
					<div class="progress-line" class:active={step > 1}></div>
					<div class="progress-step" class:active={step >= 2} class:completed={step > 2}>
						<span class="step-number">2</span>
						<span class="step-label">Design</span>
					</div>
					<div class="progress-line" class:active={step > 2}></div>
					<div class="progress-step" class:active={step >= 3}>
						<span class="step-number">3</span>
						<span class="step-label">Review</span>
					</div>
				</div>
			</div>

			<div class="wizard-body">
				{#if step === 1}
					<div class="wizard-step" style="animation: fadeIn 0.3s ease">
						<h3>Let's start with the basics</h3>
						<p class="step-description">Who is this order for?</p>
						
						<div class="form-group">
							<label for="customerName">Customer Name *</label>
							<input 
								type="text" 
								id="customerName"
								bind:value={customerName} 
								placeholder="Enter customer or company name"
								class:error={errors.customerName}
							/>
							{#if errors.customerName}
								<span class="error-message">{errors.customerName}</span>
							{/if}
						</div>

						<div class="form-group">
							<label for="quantity">Quantity *</label>
							<input 
								type="number" 
								id="quantity"
								bind:value={quantity}
								min="1"
								class:error={errors.quantity}
							/>
							{#if errors.quantity}
								<span class="error-message">{errors.quantity}</span>
							{/if}
						</div>

						<div class="form-group">
							<label for="estCompletion">Target Completion Date</label>
							<input 
								type="date" 
								id="estCompletion"
								bind:value={estimatedCompletion}
							/>
						</div>
					</div>
				{:else if step === 2}
					<div class="wizard-step" style="animation: fadeIn 0.3s ease">
						<h3>Tell us about the design</h3>
						<p class="step-description">Describe the pin or enamel product you want</p>
						
						<div class="form-group">
							<label for="pinDesign">Design Description / Idea *</label>
							<textarea 
								id="pinDesign"
								bind:value={pinDesign}
								placeholder="Describe your pin design idea - colors, style, any reference to artwork, size, etc."
								rows="5"
								class:error={errors.pinDesign}
							></textarea>
							{#if errors.pinDesign}
								<span class="error-message">{errors.pinDesign}</span>
							{/if}
						</div>

						<div class="form-group">
							<label for="notes">Additional Notes</label>
							<textarea 
								id="notes"
								bind:value={notes}
								placeholder="Any special instructions, attachments needed, budget constraints, etc."
								rows="3"
							></textarea>
						</div>
					</div>
				{:else if step === 3}
					<div class="wizard-step" style="animation: fadeIn 0.3s ease">
						<h3>Review your order</h3>
						<p class="step-description">Make sure everything looks good before creating</p>
						
						<div class="review-card">
							<div class="review-item">
								<span class="review-label">Customer</span>
								<span class="review-value">{customerName}</span>
							</div>
							<div class="review-item">
								<span class="review-label">Quantity</span>
								<span class="review-value">{quantity} pins</span>
							</div>
							<div class="review-item">
								<span class="review-label">Target Date</span>
								<span class="review-value">{estimatedCompletion || 'Not set'}</span>
							</div>
							<div class="review-item full">
								<span class="review-label">Design</span>
								<span class="review-value">{pinDesign}</span>
							</div>
							{#if notes}
								<div class="review-item full">
									<span class="review-label">Notes</span>
									<span class="review-value">{notes}</span>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<div class="wizard-footer">
				{#if step > 1}
					<button class="btn-secondary" onclick={prevStep}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
							<polyline points="15 18 9 12 15 6"></polyline>
						</svg>
						Back
					</button>
				{:else}
					<div></div>
				{/if}
				
				{#if step < 3}
					<button class="btn-primary" onclick={nextStep}>
						Next
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
							<polyline points="9 18 15 12 9 6"></polyline>
						</svg>
					</button>
				{:else}
					<button class="btn-submit" onclick={handleSubmit}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						Create Order
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.wizard-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease;
	}

	.wizard-container {
		background: var(--bg-primary, #1a1a1a);
		border: 1px solid rgba(255, 250, 245, 0.1);
		border-radius: 16px;
		width: 90%;
		max-width: 520px;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.wizard-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 250, 245, 0.05);
		border: none;
		color: var(--text-muted, #888);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wizard-close:hover {
		background: rgba(255, 250, 245, 0.1);
		color: var(--text-primary, #fff);
	}

	.wizard-header {
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 250, 245, 0.08);
	}

	.wizard-header h2 {
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--text-primary, #fff);
		margin: 0 0 1.25rem;
		text-align: center;
	}

	.wizard-progress {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.progress-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.step-number {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(255, 250, 245, 0.08);
		border: 2px solid rgba(255, 250, 245, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted, #888);
		transition: all 0.3s ease;
	}

	.progress-step.active .step-number {
		background: var(--primary, #e8976b);
		border-color: var(--primary, #e8976b);
		color: white;
	}

	.progress-step.completed .step-number {
		background: var(--emerald, #5faa7b);
		border-color: var(--emerald, #5faa7b);
		color: white;
	}

	.step-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted, #888);
		font-weight: 500;
	}

	.progress-step.active .step-label {
		color: var(--primary-light, #f0b090);
	}

	.progress-line {
		width: 40px;
		height: 2px;
		background: rgba(255, 250, 245, 0.1);
		margin-bottom: 1.25rem;
		transition: background 0.3s ease;
	}

	.progress-line.active {
		background: var(--emerald, #5faa7b);
	}

	.wizard-body {
		padding: 1.5rem;
	}

	.wizard-step h3 {
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--text-primary, #fff);
		margin: 0 0 0.35rem;
	}

	.step-description {
		font-size: 0.9rem;
		color: var(--text-muted, #888);
		margin: 0 0 1.5rem;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-group label {
		display: block;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--text-secondary, #ccc);
		margin-bottom: 0.5rem;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(255, 250, 245, 0.04);
		border: 1px solid rgba(255, 250, 245, 0.1);
		border-radius: 8px;
		color: var(--text-primary, #fff);
		font-size: 0.95rem;
		font-family: inherit;
		transition: all 0.2s;
		box-sizing: border-box;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--primary, #e8976b);
		background: rgba(255, 250, 245, 0.06);
	}

	.form-group input.error,
	.form-group textarea.error {
		border-color: #e85a5a;
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: rgba(255, 250, 245, 0.3);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.error-message {
		display: block;
		font-size: 0.75rem;
		color: #e85a5a;
		margin-top: 0.35rem;
	}

	.review-card {
		background: rgba(255, 250, 245, 0.04);
		border: 1px solid rgba(255, 250, 245, 0.08);
		border-radius: 12px;
		padding: 1rem;
	}

	.review-item {
		display: flex;
		justify-content: space-between;
		padding: 0.6rem 0;
		border-bottom: 1px solid rgba(255, 250, 245, 0.05);
	}

	.review-item:last-child {
		border-bottom: none;
	}

	.review-item.full {
		flex-direction: column;
		gap: 0.35rem;
	}

	.review-label {
		font-size: 0.8rem;
		color: var(--text-muted, #888);
		font-weight: 500;
	}

	.review-value {
		font-size: 0.9rem;
		color: var(--text-primary, #fff);
		font-weight: 500;
		text-align: right;
	}

	.review-item.full .review-value {
		text-align: left;
		line-height: 1.5;
	}

	.wizard-footer {
		padding: 1.25rem 1.5rem;
		border-top: 1px solid rgba(255, 250, 245, 0.08);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.btn-secondary,
	.btn-primary,
	.btn-submit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-secondary {
		background: rgba(255, 250, 245, 0.06);
		border: 1px solid rgba(255, 250, 245, 0.12);
		color: var(--text-secondary, #ccc);
	}

	.btn-secondary:hover {
		background: rgba(255, 250, 245, 0.1);
		color: var(--text-primary, #fff);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--primary-dark), var(--primary));
		border: none;
		color: white;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(232, 151, 107, 0.3);
	}

	.btn-submit {
		background: linear-gradient(135deg, var(--emerald), var(--emerald-light));
		border: none;
		color: white;
	}

	.btn-submit:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(95, 170, 123, 0.3);
	}
</style>

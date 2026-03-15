export const orderStages = [
	{
		key: 'ordered',
		title: 'Order Received',
		description: 'Your order has been placed and is in the queue',
		iconKey: 'clipboard',
		checklist: [
			'Order details confirmed',
			'Payment processed',
			'Design reference uploaded',
			'Assigned to production queue',
			'Confirmation email sent'
		]
	},
	{
		key: 'design',
		title: 'Design Phase',
		description: 'Our artists are creating your custom pin design',
		iconKey: 'palette',
		checklist: [
			'Initial concept sketch created',
			'Color palette finalized',
			'Vector artwork prepared',
			'Client approval received',
			'Die line template generated'
		]
	},
	{
		key: 'production',
		title: 'In Production',
		description: 'Your pins are being manufactured with enamel and plating',
		iconKey: 'factory',
		checklist: [
			'Metal mold cast',
			'Base plating applied',
			'Enamel colors filled',
			'Baking and curing complete',
			'Attachment hardware fitted'
		]
	},
	{
		key: 'quality',
		title: 'Quality Check',
		description: 'Final inspection before shipping',
		iconKey: 'checkCircle',
		checklist: [
			'Visual inspection passed',
			'Color accuracy verified',
			'Plating quality confirmed',
			'Pin mechanism tested',
			'Packaging prepared'
		]
	},
	{
		key: 'shipped',
		title: 'Shipped!',
		description: 'Your order is on its way to you',
		iconKey: 'truck',
		checklist: [
			'Order packed and sealed',
			'Shipping label created',
			'Handed to carrier',
			'Tracking number generated',
			'Delivery confirmation sent'
		]
	}
];

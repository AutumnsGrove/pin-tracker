export type ProductType = 'pins' | 'acrylic' | 'charms';

export interface Stage {
	key: string;
	title: string;
	description: string;
	iconKey: string;
	checklist: string[];
}

export const productTypeLabels: Record<ProductType, string> = {
	pins: 'Enamel Pins',
	acrylic: 'Acrylic Standees',
	charms: 'Charms'
};

const pinStages: Stage[] = [
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

const acrylicStages: Stage[] = [
	{
		key: 'ordered',
		title: 'Project Kickoff',
		description: 'Details confirmed and project is set up',
		iconKey: 'clipboard',
		checklist: [
			'Artwork permissions confirmed',
			'Product details agreed on (size, single/double sided, effects)',
			'Design reference files received',
			'Project added to tracker',
			'Kickoff confirmation sent'
		]
	},
	{
		key: 'design',
		title: 'Design & File Prep',
		description: 'Artwork prepared and formatted for the supplier',
		iconKey: 'palette',
		checklist: [
			'Artwork reviewed and approved',
			'Cut line / die line created',
			'Double-sided layout prepared (if applicable)',
			'Files formatted to supplier specs',
			'Art watermarked before sending'
		]
	},
	{
		key: 'quoting',
		title: 'Quoting & Order Placed',
		description: 'Getting quotes from suppliers and placing the order',
		iconKey: 'clipboard',
		checklist: [
			'Quantity ranges decided (e.g. 100 / 300 / 500)',
			'Supplier(s) contacted with watermarked files',
			'Quote received and approved',
			'Final quantity confirmed',
			'Order placed + deposit sent'
		]
	},
	{
		key: 'production',
		title: 'In Production',
		description: 'Printing, cutting, and assembling your acrylic product',
		iconKey: 'factory',
		checklist: [
			'Acrylic printing started',
			'Lamination / effects applied (glitter, holographic, etc.)',
			'CNC cutting complete',
			'Hardware attached (keyring / clasp / standee base)',
			'Production proof photo received'
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
			'Cut accuracy checked',
			'Hardware tested',
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

const charmStages: Stage[] = [
	{
		key: 'ordered',
		title: 'Project Kickoff',
		description: 'Details confirmed and project is set up',
		iconKey: 'clipboard',
		checklist: [
			'Artwork permissions confirmed',
			'Charm details agreed on (size, single/double sided, effects)',
			'Design reference files received',
			'Project added to tracker',
			'Kickoff confirmation sent'
		]
	},
	{
		key: 'design',
		title: 'Design & File Prep',
		description: 'Artwork prepared and formatted for the supplier',
		iconKey: 'palette',
		checklist: [
			'Artwork reviewed and approved',
			'Cut line / die line created',
			'Double-sided layout prepared (if applicable)',
			'Files formatted to supplier specs',
			'Art watermarked before sending'
		]
	},
	{
		key: 'quoting',
		title: 'Quoting & Order Placed',
		description: 'Getting quotes from suppliers and placing the order',
		iconKey: 'clipboard',
		checklist: [
			'Quantity ranges decided (e.g. 100 / 300 / 500)',
			'Supplier(s) contacted with watermarked files',
			'Quote received and approved',
			'Final quantity confirmed',
			'Order placed + deposit sent'
		]
	},
	{
		key: 'production',
		title: 'In Production',
		description: 'Printing, cutting, and assembling your acrylic charms',
		iconKey: 'factory',
		checklist: [
			'Acrylic printing started',
			'Lamination / effects applied (glitter, holographic, etc.)',
			'CNC cutting complete',
			'Hardware attached (keyring / clasp)',
			'Production proof photo received'
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
			'Cut accuracy checked',
			'Hardware tested',
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

export const productStages: Record<ProductType, Stage[]> = {
	pins: pinStages,
	acrylic: acrylicStages,
	charms: charmStages
};

// Backward-compatible export for existing imports
export const orderStages = pinStages;

export const stageKeysByProduct: Record<ProductType, string[]> = {
	pins: pinStages.map(s => s.key),
	acrylic: acrylicStages.map(s => s.key),
	charms: charmStages.map(s => s.key)
};

export const stageDisplayNames: Record<ProductType, Record<string, string>> = {
	pins: Object.fromEntries(pinStages.map(s => [s.key, s.title])),
	acrylic: Object.fromEntries(acrylicStages.map(s => [s.key, s.title])),
	charms: Object.fromEntries(charmStages.map(s => [s.key, s.title]))
};

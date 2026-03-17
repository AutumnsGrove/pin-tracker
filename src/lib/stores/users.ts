import { writable, type Writable, type Readable } from 'svelte/store';

// User roles enum
export type UserRole = 'admin' | 'merch_manager' | 'client';

export interface User {
	id: string;
	name: string;
	role: UserRole;
	email: string;
}

// Role permissions
export const rolePermissions: Record<UserRole, string[]> = {
	admin: ['edit_orders', 'check_items', 'view_all', 'sign_off', 'edit_goals'],
	merch_manager: ['edit_orders', 'check_items', 'view_all', 'edit_goals'],
	client: ['view_all', 'sign_off']
};

// Mock users for demonstration
export const mockUsers: User[] = [
	{ id: 'user-1', name: 'Admin User', role: 'admin', email: 'admin@company.com' },
	{ id: 'user-2', name: 'Merch Manager', role: 'merch_manager', email: 'merch@company.com' },
	{ id: 'user-3', name: 'Client - Sarah Johnson', role: 'client', email: 'sarah@client.com' },
	{ id: 'user-4', name: 'Client - Emily Davis', role: 'client', email: 'emily@client.com' },
	{ id: 'user-5', name: 'Client - Alex Rivera', role: 'client', email: 'alex@client.com' }
];

// Current user store
function createUserStore() {
	const { subscribe, set, update }: Writable<User | null> = writable(null);

	return {
		subscribe,
		login: (user: User) => set(user),
		logout: () => set(null),
		switchRole: (role: UserRole) => {
			const user = mockUsers.find(u => u.role === role);
			if (user) {
				set(user);
			} else {
				console.warn(`No user found with role: ${role}`);
			}
		}
	};
}

export const currentUser = createUserStore();

// Check if user has a specific permission
export function hasPermission(user: User | null, permission: string): boolean {
	if (!user) return false;
	return rolePermissions[user.role]?.includes(permission) ?? false;
}

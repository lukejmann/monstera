import { proxy } from 'valtio';

export interface Address {
	pubkey: string;
}

export const portfolioStore = proxy({
	addresses: [] as Address[],
	addAddress: (address: Address) => {
		portfolioStore.addresses.push(address);
	}
});

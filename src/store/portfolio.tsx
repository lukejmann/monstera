import { useEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { PortfolioScope } from '~/main-page/Portfolio';
import { getSpotsForAddressWithSpot } from './api';

export interface Address {
	pubkey: string;
}

export interface Request {
	address: string;
	scope: PortfolioScope;
	status: 'pending' | 'success' | 'error';
}

export interface AssetSpot {
	owner_address: string;
	timestamp: string;
	token_address: string;
	symbol: string;
	name: string;
	description: string;
	external_url: string;
	image_url: string;
	decimals: number;
	balance: number;
	price: number;
	value: number;
}

export const portfolioStore = proxy({
	addresses: [
		{
			pubkey: '0xE5501BC2B0Df6D0D7daAFC18D2ef127D9e612963'
		}
	] as Address[],
	refresh: false,
	addAddress: (address: Address) => {
		portfolioStore.addresses.push(address);
	},
	removeAddress: (address: Address) => {
		portfolioStore.addresses = portfolioStore.addresses.filter(
			(_address) => _address.pubkey != address.pubkey
		);
		portfolioStore.requests = portfolioStore.requests.filter(
			(request) => request.address != address.pubkey
		);
		portfolioStore.assetSpots = portfolioStore.assetSpots.filter(
			(assetSpot) => assetSpot.owner_address != address.pubkey
		);
		portfolioStore.refresh = true;
	},
	scope: PortfolioScope.ONEYEAR,
	requests: [] as Request[],
	assetSpots: [] as AssetSpot[],
	// used to determine if we need to recalculate the portfolio. should be refactored to be more clear
	get dataLoaded() {
		// const refresh =
		// 	portfolioStore.requests.every((request) => request.status == 'success') ||
		// 	portfolioStore.refresh;
		// portfolioStore.refresh = false;
		return portfolioStore.assetSpots.length > 0;
	},
	// get
	setRequestStatus: (
		address: string,
		scope: PortfolioScope,
		status: 'pending' | 'success' | 'error'
	) => {
		const request = portfolioStore.requests.find(
			(request) => request.address == address && request.scope == scope
		);
		if (!request) return;
		request.status = status;
	},
	addRequests: (requests: Request[]) => {
		portfolioStore.requests.push(...requests);
	}
});

// Updater
// 1. listens for updates to scope or addresses and adds replaces the requests array with new requests
export function RequestUpdater() {
	const { addresses, scope } = useSnapshot(portfolioStore);

	useEffect(() => {
		const newRequests = addresses.map((address) => ({
			address: address.pubkey,
			scope,
			status: 'pending'
		})) as Request[];
		// filter out any requests that are already in the requests array
		const filteredRequests = newRequests.filter(
			(newRequest) =>
				!portfolioStore.requests.find(
					(request) => request.address == newRequest.address && request.scope == newRequest.scope
				)
		);
		portfolioStore.addRequests(filteredRequests);
	}, [addresses, scope]);

	return <div></div>;
}

// RequestFetcher
// listens for updates to requests and fetches data for any requests that are pending
export default function RequestFetcher() {
	const { requests, scope } = useSnapshot(portfolioStore);

	useEffect(() => {
		const run = async () => {
			const promises = requests.map((request) => {
				if (request.status == 'pending') {
					// fetch data
					return getSpotsForAddressWithSpot(request.address, scope)
						.then((spots) => {
							// portfolioStore.assetSpots = [...spots, ...portfolioStore.assetSpots];
							// update status
							portfolioStore.setRequestStatus(request.address, request.scope, 'success');
							return spots;
						})
						.catch((e) => {
							// update status
							portfolioStore.setRequestStatus(request.address, request.scope, 'error');
						});
				}
			});
			const newSpots = await Promise.all(promises);
			if (!newSpots) return;
			// if any of the requests errored, we filter them out
			const n = newSpots.filter((spots) => !!spots);
			// portfolioStore.assetSpots = [];
			const combined = [...(n as AssetSpot[][]).flat()];
			portfolioStore.assetSpots = [];
			portfolioStore.assetSpots = combined;
			// portfolioStore.assetSpots = [...combined, ...portfolioStore.assetSpots];
		};
		run();
	}, [requests]);

	return <></>;
}

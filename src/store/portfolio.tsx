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
	for_scope: string;
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
	const { requests, scope, assetSpots } = useSnapshot(portfolioStore);

	useEffect(() => {
		requests.forEach((request) => {
			if (request.status == 'pending') {
				// fetch data
				// this is quite inefficient, but works for now
				return getSpotsForAddressWithSpot(request.address, scope)
					.then((spots) => {
						portfolioStore.assetSpots = [...spots, ...assetSpots]
							.filter((assetSpot) => assetSpot.for_scope == scope)
							.filter((assetSpot) => assetSpot.balance > 0)
							// filter out any duplicates
							.filter(
								(assetSpot, index, self) =>
									self.findIndex(
										(_assetSpot) =>
											_assetSpot.token_address == assetSpot.token_address &&
											_assetSpot.owner_address == assetSpot.owner_address &&
											_assetSpot.timestamp == assetSpot.timestamp
									) === index
							);

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
	}, [requests]);

	return <></>;
}

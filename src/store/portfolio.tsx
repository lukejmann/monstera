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
			pubkey: '0xC2BAF6CdBEebE932d545DfB1802c81f721432566'
		},
		{
			pubkey: '0xE5501BC2B0Df6D0D7daAFC18D2ef127D9e612963'
		}
	] as Address[],
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
	},
	scope: PortfolioScope.ONEYEAR,
	requests: [] as Request[],
	assetSpots: [] as AssetSpot[],
	get doneLoading() {
		return portfolioStore.requests.every((request) => request.status == 'success');
	},
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
		const promises = requests.map((request) => {
			if (request.status == 'pending') {
				// fetch data
				return getSpotsForAddressWithSpot(request.address, scope)
					.then((spots) => {
						portfolioStore.assetSpots.push(...spots);

						// update status
						portfolioStore.setRequestStatus(request.address, request.scope, 'success');
					})
					.catch((e) => {
						// update status
						portfolioStore.setRequestStatus(request.address, request.scope, 'error');
					});
			}
		});
		Promise.all(promises);
	}, [requests]);

	return <></>;
}

import { useEffect } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { proxyMap } from 'valtio/utils';
import { PortfolioScope, PortfolioScopeValues } from '~/main-page/Portfolio';
import { getSpotsForAddressWithScope } from './api';

export interface Address {
	pubkey: string;
}

export interface Request {
	address: string;
	scope: PortfolioScope;
	status: 'idle' | 'pending' | 'success' | 'error';
}

interface AssetSpotDatas {
	assetSpots: AssetSpot[];
	status: 'idle' | 'pending' | 'loading' | 'success' | 'error';
}
interface SpotDatasKey {
	address: string;
	scope: PortfolioScope;
}

const stringifiedSpotDatasKey = (key: SpotDatasKey) => `${key.address}-${key.scope}`;

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
	addresses: [] as Address[],
	addAddress: (address: Address) => {
		portfolioStore.addresses.push(address);
		PortfolioScopeValues.forEach((scope) => {
			portfolioStore.assetSpotsDatas.set(
				stringifiedSpotDatasKey({ address: address.pubkey, scope }),
				{
					assetSpots: [],
					status: 'idle'
				}
			);
		});
	},
	removeAddress: (address: Address) => {
		portfolioStore.addresses = portfolioStore.addresses.filter(
			(_address) => _address.pubkey != address.pubkey
		);
		// delete all asset spots for this address
		portfolioStore.assetSpotsDatas.forEach((assetSpotsData, key) => {
			if (key.includes(address.pubkey)) {
				portfolioStore.assetSpotsDatas.delete(key);
			}
		});
		// delete from assetSpotsToDisplay
		portfolioStore.assetSpotsToDisplay = portfolioStore.assetSpotsToDisplay.filter(
			(assetSpot) => assetSpot.owner_address != address.pubkey
		);
	},
	scope: PortfolioScope.ONEYEAR,
	dataSetForScope: false,
	setScope: (scope: PortfolioScope) => {
		portfolioStore.scope = scope;
		portfolioStore.dataSetForScope = false;
	},

	// we need to store the status of each fetch request and data so don't have jumping datapoints
	assetSpotsDatas: proxyMap<string, AssetSpotDatas>(),
	setAssetSpotsDataStatus(
		key: SpotDatasKey,
		status: 'idle' | 'pending' | 'loading' | 'success' | 'error'
	) {
		const assetSpotsData = portfolioStore.assetSpotsDatas.get(stringifiedSpotDatasKey(key));
		if (!assetSpotsData) {
			throw new Error(`assetSpotsData is undefined for key ${key}`);
		}
		assetSpotsData.status = status;
	},
	assetSpotsToDisplay: [] as AssetSpot[]
});

// Inital State Updater. Mostly for demo + testing
export function InitialStateUpdater() {
	useEffect(() => {
		if (portfolioStore.addresses.length > 0) return;
		portfolioStore.addAddress({ pubkey: '0xE5501BC2B0Df6D0D7daAFC18D2ef127D9e612963' });
	}, []);

	return <div></div>;
}

// RequestFetcher
//  listens for updates to scope or addresses and fetches data for each needed assetSpotsData not already fetched or being fetched
export function RequestFetcher() {
	const { scope, addresses, assetSpotsDatas } = useSnapshot(portfolioStore);

	useEffect(() => {
		const keysNeeded = addresses.map((address) => {
			return {
				address: address.pubkey,
				scope
			} as SpotDatasKey;
		});
		console.log('keysNeeded', keysNeeded);

		keysNeeded.forEach(async (key) => {
			const stringifiedKey = stringifiedSpotDatasKey(key);

			const assetSpotsData = portfolioStore.assetSpotsDatas.get(stringifiedKey);
			if (!assetSpotsData) {
				throw new Error(`assetSpotsData is undefined for key ${stringifiedKey}`);
			}
			const promises = [];
			if (assetSpotsData.status == 'idle') {
				portfolioStore.setAssetSpotsDataStatus(key, 'pending');
				promises.push(
					getSpotsForAddressWithScope(key.address, key.scope)
						.then((spots) => {
							portfolioStore.assetSpotsDatas.set(stringifiedKey, {
								assetSpots: spots,
								status: 'success'
							});
							return spots;
						})
						.catch((e) => {
							portfolioStore.assetSpotsDatas.set(stringifiedKey, {
								assetSpots: [],
								status: 'error'
							});
							return [];
						})
				);
			}
			await Promise.all(promises);
		});
	}, [scope, addresses]);

	return <></>;
}

// RequestFetcher
//  listens for updates to scope or addresses and fetches data for each needed assetSpotsData not already fetched or being fetched
export function DisplayDataUpdater() {
	const { scope, addresses, dataSetForScope, assetSpotsDatas } = useSnapshot(portfolioStore);

	useEffect(() => {
		if (dataSetForScope) return;
		const keysNeeded = addresses.map((address) => {
			return {
				address: address.pubkey,
				scope
			} as SpotDatasKey;
		});
		const ready =
			keysNeeded.every((key) => {
				const assetSpotsData = assetSpotsDatas.get(stringifiedSpotDatasKey(key));
				if (!assetSpotsData) {
					throw new Error(`assetSpotsData is undefined for key ${stringifiedSpotDatasKey(key)}`);
				}
				return assetSpotsData.status == 'success';
			}) && keysNeeded.length > 0;
		console.log('ready', ready);
		if (!ready) {
			console.log('not ready');
			return;
		}
		const assetSpotsToDisplay: AssetSpot[] = [];
		keysNeeded.forEach((key) => {
			const assetSpotsData = assetSpotsDatas.get(stringifiedSpotDatasKey(key));
			if (!assetSpotsData) {
				throw new Error(`assetSpotsData is undefined for key ${stringifiedSpotDatasKey(key)}`);
			}
			assetSpotsToDisplay.push(...assetSpotsData.assetSpots);
		});
		portfolioStore.assetSpotsToDisplay = assetSpotsToDisplay;
		portfolioStore.dataSetForScope = true;
	}, [scope, addresses, dataSetForScope, assetSpotsDatas]);

	return <></>;
}

import { useMemo } from 'react';
import useMeasure from 'react-use-measure';
import styled from 'styled-components/macro';
import { proxy, useSnapshot } from 'valtio';
import { portfolioStore } from '~/store';
import RequestFetcher, { AssetSpot, RequestUpdater } from '~/store/portfolio';
import { ValueChart } from './ValueChart';

export const PortfolioWrapper = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
`;

export const PortfolioContainer = styled.div`
	position: relative;
	display: inline-flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 12px;
	max-width: 700px;
	width: 100%;
	top: 100px;
`;

export enum PortfolioScope {
	ONEHOUR = '1H',
	ONEDAY = '1D',
	ONEWEEK = '1W',
	ONEMONTH = '1M',
	THREEMONTH = '3M',
	SIXMONTH = '6M',
	ONEYEAR = '1Y',
	THREEYEAR = '3Y',
	FIVEYEAR = '5Y'
}

export const scopeToInterval = (scope: PortfolioScope) => {
	switch (scope) {
		case PortfolioScope.ONEHOUR:
			return '1h';
		case PortfolioScope.ONEDAY:
			return '1 day';
		case PortfolioScope.ONEWEEK:
			return '1 week';
		case PortfolioScope.ONEMONTH:
			return '1 month';
		case PortfolioScope.THREEMONTH:
			return '3 month';
		case PortfolioScope.SIXMONTH:
			return '6 month';
		case PortfolioScope.ONEYEAR:
			return '1 year';
		case PortfolioScope.THREEYEAR:
			return '3 year';
		case PortfolioScope.FIVEYEAR:
			return '5 year';
		default:
			return '1 hour';
	}
};

export const minutesPerScope = (scope: PortfolioScope) => {
	switch (scope) {
		case PortfolioScope.ONEHOUR:
			return 60;
		case PortfolioScope.ONEDAY:
			return 60 * 24;
		case PortfolioScope.ONEWEEK:
			return 60 * 24 * 7;
		case PortfolioScope.ONEMONTH:
			return 60 * 24 * 30;
		case PortfolioScope.THREEMONTH:
			return 60 * 24 * 30 * 3;
		case PortfolioScope.SIXMONTH:
			return 60 * 24 * 30 * 6;
		case PortfolioScope.ONEYEAR:
			return 60 * 24 * 365;
		case PortfolioScope.THREEYEAR:
			return 60 * 24 * 365 * 3;
		case PortfolioScope.FIVEYEAR:
			return 60 * 24 * 365 * 5;
		default:
			return 60;
	}
};

export const spotPerScope = (scope: PortfolioScope) => {
	return 100;
};

const portfolioView = proxy({
	scope: PortfolioScope.ONEMONTH
});

export default function Portfolio() {
	const [ref, bounds] = useMeasure();

	const { addresses, assetSpots, scope } = useSnapshot(portfolioStore);

	const valuePoints = useMemo(() => {
		// to get the asset spots for the current scope, we first group the asset spots by timestamp (raw data has chuncked timestamps already)
		const groupedAssetSpots = assetSpots.reduce((acc, assetSpot) => {
			// round timestamp to the nearest minute
			const date = new Date(assetSpot.timestamp);
			console.log('assetSpot.timestamp', date);
			const timestampDate = new Date(
				Date.UTC(
					date.getUTCFullYear(),
					date.getUTCMonth(),
					date.getUTCDate(),
					date.getUTCHours(),
					date.getUTCMinutes()
				)
			);
			console.log('timestampDate', timestampDate);
			const timestamp = timestampDate.getTime();

			if (!acc[timestamp]) acc[timestamp] = [];
			// @ts-ignore
			acc[timestamp].push(assetSpot);
			return acc;
		}, {} as { [timestamp: number]: AssetSpot[] });

		console.log('groupedAssetSpots', groupedAssetSpots);

		// then we get the sum of the value of all the asset spots for each timestamp
		const valuePoints = Object.entries(groupedAssetSpots).map(([timestamp, assetSpots]) => {
			const value = assetSpots.reduce((acc, assetSpot) => acc + assetSpot.value, 0);
			return { timestamp: parseInt(timestamp) / 1000, value };
		});

		console.log('valuePoints', valuePoints);

		// console

		return valuePoints.sort((a, b) => a.timestamp - b.timestamp);
	}, [assetSpots]);

	return (
		<PortfolioWrapper>
			<PortfolioContainer ref={ref}>
				<ValueChart width={bounds.width} height={400} values={valuePoints} portfolioScope={scope} />
			</PortfolioContainer>
			<RequestFetcher />
			<RequestUpdater />
		</PortfolioWrapper>
	);
}

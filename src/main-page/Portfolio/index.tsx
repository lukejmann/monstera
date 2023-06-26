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
	ONEMONTH = '1M',
	THREEMONTH = '3M',
	SIXMONTH = '6M',
	ONEYEAR = '1Y',
	THREEYEAR = '3Y'
}

const portfolioView = proxy({
	scope: PortfolioScope.ONEMONTH
});

export default function Portfolio() {
	const [ref, bounds] = useMeasure();

	const { addresses, assetSpots, scope } = useSnapshot(portfolioStore);

	const valuePoints = useMemo(() => {
		// to get the asset spots for the current scope, we first group the asset spots by timestamp (raw data has chuncked timestamps already)
		const groupedAssetSpots = assetSpots.reduce((acc, assetSpot) => {
			const timestamp = assetSpot.timestamp;
			if (!acc[timestamp]) acc[timestamp] = [];
			// @ts-ignore
			acc[timestamp].push(assetSpot);
			return acc;
		}, {} as { [timestamp: number]: AssetSpot[] });

		// then we get the sum of the value of all the asset spots for each timestamp
		const valuePoints = Object.entries(groupedAssetSpots).map(([timestamp, assetSpots]) => {
			const value = assetSpots.reduce((acc, assetSpot) => acc + assetSpot.value, 0);
			// we need to conver 2023-06-26T14:08:58Z to a timestamp
			const timestampAsNumber = new Date(timestamp).getTime() / 10000;
			return { timestamp: timestampAsNumber, value };
		});

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

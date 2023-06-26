import { useMemo } from 'react';
import useMeasure from 'react-use-measure';
import styled from 'styled-components/macro';
import { proxy, useSnapshot } from 'valtio';
import { portfolioStore } from '~/store';
import RequestFetcher, { AssetSpot, RequestUpdater } from '~/store/portfolio';
import { PortfolioTitle, opacify } from '~/ui';
import { TokenList } from './TokenList';
import { ValueChart } from './ValueChart';
import { formatUSD } from './util';

export const PortfolioWrapper = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	overflow: auto;
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
	height: 100%;
`;

const PortfolioHeader = styled.div`
	display: flex;
	width: 100%;
	justify-content: space-between;
	align-items: center;
`;

const PortfolioHeaderLeft = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: -2px;
`;

const ScopePickerRow = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 10px;
`;

const ScopePicker = styled.div<{ selected: boolean }>`
	display: flex;
	padding: 7.521px 11px;
	flex-direction: column;
	align-items: flex-start;
	gap: 7.521px;
	border-radius: 6px;
	border-radius: 10px;
	background: ${({ selected, theme }) => (selected ? theme.backgroundInverse1 : 'none')};
	color: ${({ selected, theme }) => (selected ? theme.textInverse1 : '#8A8A8A')};
	font-size: 13.538px;
	// border: 1px solid ${({ theme }) => theme.border2Base};
	width: 20px;
	justify-content: center;
	align-items: center;

	&:hover {
		opacity: 0.8;
		// border: 1px solid ${({ theme }) => theme.text3};
		cursor: pointer;
	}
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

const PortfolioScopeValues = Object.values(PortfolioScope);

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
			return '1 year';
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
			return 60 * 24 * 365 * 5;
	}
};

export const spotPerScope = (scope: PortfolioScope) => {
	return 40;
};

export const portfolioFocusedDate = proxy<{ date: Date | null }>({ date: null });

export default function Portfolio() {
	const [ref, bounds] = useMeasure();

	const { addresses, assetSpots, scope } = useSnapshot(portfolioStore);
	const { date: focusedDate } = useSnapshot(portfolioFocusedDate);

	// to get the asset spots for the current scope, we first group the asset spots by timestamp (raw data has chuncked timestamps already)
	const groupedAssetSpots = useMemo(() => {
		return assetSpots.reduce((acc, assetSpot) => {
			// round timestamp to the nearest minute
			const date = new Date(assetSpot.timestamp);
			const timestampDate =
				minutesPerScope(scope) <= minutesPerScope(PortfolioScope.ONEDAY)
					? new Date(
							Date.UTC(
								date.getUTCFullYear(),
								date.getUTCMonth(),
								date.getUTCDate(),
								date.getUTCHours(),
								date.getUTCMinutes(),
								date.getUTCSeconds()
							)
					  )
					: minutesPerScope(scope) <= minutesPerScope(PortfolioScope.ONEWEEK)
					? new Date(
							Date.UTC(
								date.getUTCFullYear(),
								date.getUTCMonth(),
								date.getUTCDate(),
								date.getUTCHours(),
								date.getUTCMinutes()
							)
					  )
					: minutesPerScope(scope) <= minutesPerScope(PortfolioScope.ONEYEAR)
					? new Date(
							Date.UTC(
								date.getUTCFullYear(),
								date.getUTCMonth(),
								date.getUTCDate(),
								date.getUTCHours()
							)
					  )
					: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth()));

			const timestamp = timestampDate.getTime();

			if (!acc[timestamp]) acc[timestamp] = [];
			// @ts-ignore
			acc[timestamp].push(assetSpot);
			return acc;
		}, {} as { [timestamp: number]: AssetSpot[] });
	}, [assetSpots, scope]);

	const chartValues = useMemo(() => {
		// then we get the sum of the value of all the asset spots for each timestamp
		const chartValues = Object.entries(groupedAssetSpots).map(([timestamp, assetSpots]) => {
			const value = assetSpots.reduce((acc, assetSpot) => acc + assetSpot.value, 0);
			// @ts-ignore
			return { date: new Date(timestamp / 1000), value };
		});

		return chartValues.sort((a, b) => a.date.valueOf() - b.date.valueOf());
	}, [groupedAssetSpots]);

	// focused spots are point-in-time values of the portfolio
	const focusedSpots = useMemo(() => {
		if (!focusedDate) return null;
		const timestamp = focusedDate.getTime() * 1000;
		const focusedSpots = groupedAssetSpots[timestamp];
		return focusedSpots;
	}, [groupedAssetSpots, focusedDate]);

	const focusedValue = useMemo(() => {
		if (!focusedSpots) {
			if (!chartValues.length) return null;
			// @ts-ignore
			return chartValues[chartValues.length - 1].value;
		}

		return focusedSpots.reduce((acc, assetSpot) => acc + assetSpot.value, 0);
	}, [focusedSpots]);

	return (
		<PortfolioWrapper>
			<PortfolioContainer ref={ref}>
				<PortfolioHeader>
					<PortfolioHeaderLeft>
						{focusedValue && <PortfolioTitle>{formatUSD(focusedValue)} </PortfolioTitle>}
					</PortfolioHeaderLeft>
					<ScopePickerRow>
						{PortfolioScopeValues.map((scopeValue) => {
							return minutesPerScope(scopeValue) <
								minutesPerScope(PortfolioScope.ONEMONTH) ? null : (
								<ScopePicker
									key={scopeValue}
									selected={scopeValue === scope}
									onClick={() => (portfolioStore.scope = scopeValue)}
								>
									{scopeValue}
								</ScopePicker>
							);
						})}
					</ScopePickerRow>
				</PortfolioHeader>

				<ValueChart width={bounds.width} height={400} values={chartValues} portfolioScope={scope} />
				{focusedSpots && <TokenList assetSpots={focusedSpots} />}
			</PortfolioContainer>
			<RequestFetcher />
			<RequestUpdater />
		</PortfolioWrapper>
	);
}

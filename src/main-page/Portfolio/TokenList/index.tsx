import { animated, config, useTrail, useTransition } from '@react-spring/web';
import shuffle from 'lodash.shuffle';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components/macro';
import { AssetSpot } from '~/store';
import {
	PortfolioInfoLabel,
	PortfolioLabel,
	SectionTitle,
	TokenDescription,
	TokenName
} from '~/ui';

const List = styled(animated.div)`
	position: relative;
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

const Card = styled(animated.div)`
	// position: absolute;

	will-change: transform, height, opacity;
	width: 100%;
`;

const Cell = styled.div`
	position: relative;
	background-size: cover;
	width: 100%;
	height: 100%;
	overflow: hidden;
	text-transform: uppercase;
	font-size: 10px;
	line-height: 10px;
	padding: 15px;
`;

const Details = styled.div`
	position: relative;
	bottom: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	border-radius: 5px;
	box-shadow: 0px 10px 25px -10px rgba(0, 0, 0, 0.2);
`;

// Note: didn't use this
const CARD_HEIGHT = 100;

export function TokenList({ assetSpots }: { assetSpots: AssetSpot[] }) {
	let height = 0;
	const transitions = useTrail(
		assetSpots.sort((spotA, spotB) => spotB.value - spotA.value).length,
		{
			from: { opacity: 0, height: CARD_HEIGHT / 2 },
			to: { opacity: 1, height: CARD_HEIGHT },
			entry: { opacity: 1, height: CARD_HEIGHT },
			leave: { opacity: 0, height: CARD_HEIGHT / 2 },
			config: config.stiff
		}
	);

	return (
		<List style={{}}>
			{transitions.map(({ opacity, height }, index) => {
				const spot = assetSpots[index];
				return spot ? <TokenRow spot={spot} /> : <></>;
			})}
		</List>
	);
}

const TokenRowContainer = styled(animated.div)`
	// position: absolute;

	will-change: transform, height, opacity;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	align-self: stretch;
`;

const TokenRowLeft = styled.div`
	display: flex;
	align-items: center;
`;

const TokenImageWrapper = styled.div`
	display: flex;
	padding: 10px;
	align-items: flex-start;
	gap: 10px;
`;

const TokenImage = styled.img`
	width: 32px;
	height: 32px;
	border-radius: 50%;
`;

const TokenInfoCol = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

const RowRight = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 30px;
`;

const RowInfoCol = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 2px;
	width: 100px;
`;

const TokenRow = ({ spot }: { spot: AssetSpot }) => {
	return (
		<TokenRowContainer key={spot.token_address + spot.timestamp + spot.for_scope}>
			<TokenRowLeft>
				<TokenImageWrapper>
					<TokenImage src={spot.image_url} />
				</TokenImageWrapper>
				<TokenInfoCol>
					<TokenName>{spot.name}</TokenName>
					<TokenDescription>{spot.symbol}</TokenDescription>
				</TokenInfoCol>
			</TokenRowLeft>
			<RowRight>
				{spot.value && spot.balance ? (
					<RowInfoCol>
						<PortfolioLabel>Balance</PortfolioLabel>
						<div>{`${spot.balance.toFixed(2)}`}</div>
					</RowInfoCol>
				) : (
					<RowInfoCol />
				)}

				{spot.value && spot.balance ? (
					<RowInfoCol>
						<PortfolioLabel>Quote</PortfolioLabel>
						<PortfolioInfoLabel>{`${(spot.value / spot.balance).toFixed(2)}`}</PortfolioInfoLabel>
					</RowInfoCol>
				) : (
					<RowInfoCol />
				)}
				{spot.value ? (
					<RowInfoCol>
						<PortfolioLabel>Value</PortfolioLabel>
						<PortfolioInfoLabel>{`${spot.value.toFixed(2)}`}</PortfolioInfoLabel>
					</RowInfoCol>
				) : (
					<RowInfoCol />
				)}
			</RowRight>
		</TokenRowContainer>
	);
};

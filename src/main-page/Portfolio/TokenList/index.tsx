import { animated, config, useTrail } from '@react-spring/web';
// @ts-ignore
import { styled } from 'styled-components/macro';
import { AssetSpot } from '~/store';
import { PortfolioInfoLabel, PortfolioLabel, TokenDescription, TokenName } from '~/ui';

const List = styled(animated.div)`
	position: relative;
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 14px;
	padding-top: 62px;
	padding-bottom: 200px;
`;

const Card = styled(animated.div)`
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

export function TokenList({ assetSpots }: { assetSpots: AssetSpot[] }) {
	// Maybe later

	// const transitions = useTrail(
	// 	assetSpots.sort((spotA, spotB) => spotB.value - spotA.value).length,
	// 	{
	// 		config: config.wobbly,
	// 		from: { opacity: 0.6, height: 15, scale: 0.9 },
	// 		to: { opacity: 1, height: 'fit-content', scale: 1 }
	// 	}
	// );

	return (
		<List style={{}}>
			{assetSpots
				.sort((spotA, spotB) => spotB.value - spotA.value)
				.map((spot, index) => {
					return spot ? <TokenRow spot={spot} styles={{}} /> : <></>;
				})}
		</List>
	);
}

const TokenRowContainer = styled(animated.div)`
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
	gap: 10px;
`;

const TokenImageWrapper = styled.div<{ src: string }>`
	display: flex;

	align-items: flex-start;
	gap: 10px;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: url(${({ src }) => src}) no-repeat center center;
	background-color: ${({ theme }) => theme.translucent1};
	background-size: 100%;
	box-shadow: ${({ theme }) => theme.shadow2Base};
`;

const TokenImage = styled.img`
	width: 32px;
	height: 32px;
	border-radius: 50%;
	box-shadow: ${({ theme }) => theme.shadow2Base};
	background-color: ${({ theme }) => theme.translucent1};
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
//
const TokenRow = ({ spot, styles }: { spot: AssetSpot; styles: any }) => {
	return (
		<TokenRowContainer key={spot.token_address + spot.timestamp + spot.for_scope} style={styles}>
			<TokenRowLeft>
				<TokenImageWrapper src={spot.image_url}>
					{/* <TokenImage src={spot.image_url} /> */}
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

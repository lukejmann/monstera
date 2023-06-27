import { useMemo } from 'react';
import styled from 'styled-components/macro';
import { useSnapshot } from 'valtio';
import { addressesModalState, portfolioStore } from '~/store';
import { ActionText, InfoText, opacify } from '~/ui';

export const AddressesToolContainer = styled.div`
	display: flex;
	width: 290px;

	padding: 10px;
	justify-content: space-between;
	align-items: center;
	flex-shrink: 0;
	border-radius: 8px;
	border: 1px solid ${({ theme }) => theme.border1};

	background: linear-gradient(
		0deg,
		${({ theme }) => opacify(1, theme.accent1)} 0%,
		${({ theme }) => opacify(4, theme.accent2)} 100%
	);
	box-shadow: ${({ theme }) => theme.shadow1None};

	transition: all 0.2s ease-in-out;

	position: fixed;
	bottom: 20px;
	left: 20px;
	&:hover {
		border: 1.1px solid ${({ theme }) => theme.border1Active};
		box-shadow: ${({ theme }) => theme.shadow1Base};
		cursor: pointer;
		background: linear-gradient(
			0deg,
			${({ theme }) => opacify(2, theme.accent1)} 0%,
			${({ theme }) => opacify(6, theme.accent2)} 100%
		);
	}
	z-index: ${({ theme }) => theme.zIndex.docked};
`;

export default function AddressesTool() {
	const { addresses } = useSnapshot(portfolioStore);

	const addressesText = useMemo(() => {
		if (addresses.length === 0) {
			return 'No Addresses';
		}
		if (addresses.length === 1) {
			return '1 Address';
		}
		return `${addresses.length} Addresses`;
	}, [addresses.length]);

	return (
		<AddressesToolContainer
			onClick={() => {
				addressesModalState.isOpen = true;
			}}
		>
			<InfoText>{addressesText}</InfoText>
			<ActionText>Manage</ActionText>
		</AddressesToolContainer>
	);
}

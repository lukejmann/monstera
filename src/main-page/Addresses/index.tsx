import styled from 'styled-components/macro';
import { proxy, useSnapshot } from 'valtio';
import { portfolioStore } from '~/store';
import { ActionText, AddressLabel, RowFixed } from '~/ui';

export const AddressesContainer = styled.div`
	position: absolute;
	top: 0;
	left: -320px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 220px;
`;

const AddresssRow = styled.div`
	display: flex;
	width: 219px;
	padding: 9.859px;
	justify-content: space-between;
	align-items: center;
`;

const AddressRightOptions = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 8px;
`;

export default function AddressesList() {
	const { addresses } = useSnapshot(portfolioStore);

	return (
		<>
			{addresses.map((address) => {
				const truncated = `${address.pubkey.slice(0, 6)}...${address.pubkey.slice(-4)}`;
				return (
					<AddresssRow key={address.pubkey}>
						<RowFixed>
							<AddressLabel>{truncated}</AddressLabel>
						</RowFixed>
						<AddressRightOptions>
							<ActionText>Delete</ActionText>
							{/* <ActionText>Export</ActionText> */}
						</AddressRightOptions>
					</AddresssRow>
				);
			})}
		</>
	);
}

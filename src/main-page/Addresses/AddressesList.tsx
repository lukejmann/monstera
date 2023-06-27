import styled from 'styled-components/macro';
import { proxy, useSnapshot } from 'valtio';
import { portfolioStore } from '~/store';
import {
	ActionText,
	AddressLabel,
	CloseIcon,
	InfoText,
	ItemStatus,
	PortfolioInfoLabel,
	PortfolioLabel,
	RowFixed
} from '~/ui';

const AddresssListWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 4px 8px;
`;

const AddresssRow = styled.div`
	display: flex;
	width: calc(100% - 8px);
	margin-left: -8px;

	justify-content: space-between;
	align-items: center;
`;

export default function AddressesList() {
	const { addresses } = useSnapshot(portfolioStore);

	return (
		<AddresssListWrapper>
			{addresses.map((address) => {
				const truncated = `${address.pubkey.slice(0, 6)}...${address.pubkey.slice(-4)}`;
				return (
					<AddresssRow key={address.pubkey}>
						<RowFixed>
							<AddressLabel>{truncated}</AddressLabel>
						</RowFixed>

						<CloseIcon
							size={12}
							onClick={() => {
								portfolioStore.removeAddress(address);
							}}
						/>
					</AddresssRow>
				);
			})}
			{addresses.length === 0 && <InfoText style={{ fontSize: 12 }}>No addresses tracked</InfoText>}
		</AddresssListWrapper>
	);
}

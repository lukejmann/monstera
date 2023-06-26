import { useClickAway } from '@uidotdev/usehooks';
import styled from 'styled-components/macro';
import { useSnapshot } from 'valtio';
// @ts-ignore
import { ReactComponent as PlusIcon } from '~/assets/plus-circle';
import { addressesModalState, portfolioStore } from '~/store';
import { ActionText, ErrorText, Input, SectionTitle } from '~/ui';
import ActionButton from '~/ui/buttons';
import AddressesList from '.';

const AddAddressModalOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0
    z-index: 100;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(1.5px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    
`;
const AddressModalSpacer = styled.div`
	height: 40vh;
	@media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
		height: 0vh;
	}
	width: 100%;
`;

const AddressModal = styled.div`
	display: flex;
	width: 329px;
	padding: 12px;
	flex-direction: column;
	align-items: flex-start;
	gap: 10px;
	border-radius: 14px;
	border: 1px solid #d0d0d0;
	background: #fff;
	box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.25);
`;

const Separator = styled.div`
	width: 305px;
	height: 1px;
	opacity: 0.5;
	background: #f0f0ee;
`;

const InputWrapper = styled.div`
	display: flex;
	padding: 12px 6px;
	align-items: flex-start;
	gap: 10px;
	align-self: stretch;
	border-radius: 6px;
	border: 1px solid #ececec;
`;

const ButtonWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10px;
	align-self: stretch;
`;

const AddRow = styled.div`
	display: flex;
	width: 100%;
	justify-content: flex-start;
	align-items: center;
	gap: 8px;
`;

export default function AddressesModal() {
	const { isOpen, textInput, error } = useSnapshot(addressesModalState);
	const onClose = () => {
		addressesModalState.reset();
	};
	const ref = useClickAway(() => {
		addressesModalState.isOpen = false;
		onClose();
	});

	const submit = async () => {
		// const isValid = web3.utils.isAddress(textInput);
		const isValid = true;
		if (!isValid || !textInput) {
			addressesModalState.error = 'Invalid address';
			return;
		}
		portfolioStore.addAddress({
			pubkey: textInput
		});
	};

	return (
		<>
			{isOpen && (
				<AddAddressModalOverlay>
					<AddressModal ref={ref}>
						<SectionTitle>Tracked Addresses</SectionTitle>
						<Separator />
						<AddressesList />
						<Separator />
						<AddRow onClick={() => (addressesModalState.isOpen = true)}>
							<PlusIcon />
							<ActionText>Add Address</ActionText>
						</AddRow>

						<InputWrapper>
							<Input
								placeholder="Address"
								value={textInput}
								onChange={(e) => (addressesModalState.textInput = e.target.value)}
							/>
						</InputWrapper>
						{error && <ErrorText>{error.toString()}</ErrorText>}
						<ButtonWrapper>
							<ActionButton text="Track Address" onClick={submit} />
						</ButtonWrapper>
					</AddressModal>
					<AddressModalSpacer />
				</AddAddressModalOverlay>
			)}
		</>
	);
}

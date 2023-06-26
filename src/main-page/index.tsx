import { addressesModalState } from '~/store';
import { ActionText } from '~/ui';
import AddressesModal from './AddressesList/modal';
import Portfolio from './Portfolio';

export const MainPage = () => {
	return (
		<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
			<ActionText
				style={{ position: 'absolute', left: '20px', bottom: '20px' }}
				onClick={() => (addressesModalState.isOpen = true)}
			>
				Addresses
			</ActionText>
			<Portfolio />
			<AddressesModal />
		</div>
	);
};

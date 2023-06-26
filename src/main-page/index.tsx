import { addressesModalState } from '~/store';
import AddressesModal from './Addresses/modal';

export const MainPage = () => {
	return (
		<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
			<button
				style={{ position: 'absolute', left: '20px', bottom: '20px' }}
				onClick={() => (addressesModalState.isOpen = true)}
			>
				Addresses
			</button>
			<AddressesModal />
		</div>
	);
};

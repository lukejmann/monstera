import { addressesModalState } from '~/store';
import { ActionText } from '~/ui';
import AddressesTool from './Addresses';
import AddressesModal from './Addresses/AddressesModal';
import Portfolio from './Portfolio';

export const MainPage = () => {
	return (
		<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
			<Portfolio />
			<AddressesTool />
			<AddressesModal />
		</div>
	);
};

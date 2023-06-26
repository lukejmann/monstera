import { proxy } from 'valtio';

export const addressesModalState = proxy({
	isOpen: false,
	textInput: undefined as undefined | string,
	error: undefined as undefined | string,
	reset: () => {
		addressesModalState.isOpen = false;
		addressesModalState.textInput = undefined;
		addressesModalState.error = undefined;
	}
});

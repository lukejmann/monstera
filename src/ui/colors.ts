// Based mostly on https://github.com/Uniswap/interface/blob/main/src/theme/index.tsx
import { opacify } from './utils';

type Theme = typeof lightTheme;

export const lightTheme = {
	text1: '#000',
	text2: '#4D4D4D',
	text3: '#B3B6CA',
	textInverse1: '#FFFFFF',
	backgroundInverse1: '#000',
	buttonTextBase: '#B3B6CA',
	buttonBackgroundBase: '##FFFFFF',
	border1: '##E6E6E6',
	backgroundFloatingNone: '#rgba(100, 100, 100, 1.00)',
	backgroundFloatingBase: '#rgba(255, 255, 255, 1.02)',
	userMessageBackground: '#027DFF',
	userMessageText: '#FFFFFF',
	otherMessageBackground: '#FFFFFA',
	otherMessageText: '#4D4D4D',
	accent1: '#ffeda4',
	accent2: '#dbffc3',
	accent3: '#ffc8c8'
};

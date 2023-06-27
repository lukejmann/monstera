// Based mostly on https://github.com/Uniswap/interface/blob/main/src/theme/index.tsx
import { opacify } from './utils';

type Theme = typeof lightTheme;

export const lightTheme = {
	text1: '#000',
	text2: '#4D4D4D',
	text3: '#B3B6CA',
	textInverse1: '#FFFFFF',
	backgroundInverse1: '#000000',
	buttonTextBase: '#B3B6CA',
	buttonBackgroundBase: '#FFFFFF',
	modalBackground: '#ffffff',
	border1: '#afafaf',
	border1Active: '#909090',
	backgroundFloatingNone: 'rgba(100, 100, 100, 1.00)',
	backgroundFloatingBase: 'rgba(255, 255, 255, 0.4)',
	accent1: '#ffdcb3',
	accent2: '#bad5ea',
	accent3: '#ff615d',
	translucent1: '#00000000'
};

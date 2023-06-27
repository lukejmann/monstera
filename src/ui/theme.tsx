import React, { useMemo } from 'react';
import {
	DefaultTheme,
	ThemeProvider as StyledComponentsThemeProvider,
	createGlobalStyle,
	css
} from 'styled-components/macro';
import { lightTheme } from './colors';

const BREAKPOINTS = {
	xs: 396,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	xxl: 1536,
	xxxl: 1920
};

const transitions = {
	duration: {
		slow: '250ms',
		medium: '125ms',
		fast: '20ms'
	},
	timing: {
		ease: 'ease',
		in: 'ease-in',
		out: 'ease-out',
		inOut: 'ease-in-out'
	}
};

const opacities = {
	hover: 0.6,
	click: 0.4,
	disabled: 0.5,
	enabled: 1
};

export function getTheme() {
	return {
		...lightTheme,
		...{
			ignoreThisKey: true,
			grids: {
				sm: 8,
				md: 12,
				lg: 24
			},
			breakpoint: BREAKPOINTS,

			shadow1Base: '-39px 30px 90px rgba(0, 0, 0, 0.1)',
			shadow1None: '-13px 10px 30px rgba(0, 0, 0, 0.0)',
			shadow2Base:
				'0px 3.200000047683716px 6.400000095367432px 0px rgba(0, 0, 0, 0.08), 0px 0.800000011920929px 0.800000011920929px 0px rgba(0, 0, 0, 0.02), 0px 2.4000000953674316px 4.800000190734863px 0px rgba(0, 0, 0, 0.06);',
			shadow2None: '0px 0px 0px 0px rgba(0, 0, 0, 0.0)',
			textShadow1: '0px 2px 6px rgba(0, 0, 0, 0.06)',
			textShadowNone: '0px 0px 0px rgba(0, 0, 0, 0.0)',

			backdrop1Base: 'blur(7px)',
			backdrop1None: 'blur(0px)',
			border1Base: '1px solid #E6E6E6',
			border1Light: '1px solid #e6e6e65d',
			border1None: '0px solid #E6E6E6',
			border2Base: '2px solid #E6E6E6',
			border2None: '2px solid #E6E6E6',

			transition: transitions,
			opacity: opacities,
			zIndex: {
				hide: -2,
				bg: -1,
				auto: 'auto',
				base: 0,
				docked: 10,
				modalOverlay: 90,
				modal: 100
			}
		}
	};
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const themeObject: DefaultTheme = useMemo(() => getTheme(), []);
	return (
		<StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
	);
}

// export const GLOBAL_FONT

export const ThemedGlobalStyle = createGlobalStyle`
html {
font-family: 'Satoshi', Helvetica, Arial, sans-serif;
backface-visibility: hidden;
text-rendering: optimizeLegibility;
text-shadow: rgba(0, 0, 0, 0.01) 0 0 1px;
}
a {
 color: ${({ theme }) => theme.blue}; 
}
`;

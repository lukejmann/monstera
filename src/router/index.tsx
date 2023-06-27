import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, RouteObject, RouterProvider, RouterProviderProps } from 'react-router-dom';
import styled from 'styled-components/macro';
// @ts-ignore
import Bg from '~/assets/bg';
import { MainPage } from '~/main-page';
import { ThemeProvider, ThemedGlobalStyle } from '~/ui';
import ErrorFallback, { RouterErrorBoundary } from '../util/ErrorFallback';

const BG = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	background: linear-gradient(0deg, rgba(254, 254, 249, 0.9), rgba(254, 254, 249, 0.96)),
		url(${Bg}) center center repeat;
	mix-blend-mode: normal;
	z-index: ${({ theme }) => theme.zIndex.bg};
`;

const AppContainer = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	top: 0px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 12px;
`;

const Wrapper = () => {
	return (
		<>
			<ThemeProvider>
				<ThemedGlobalStyle />
				<AppContainer>
					<Outlet />
					<BG />
				</AppContainer>
			</ThemeProvider>
		</>
	);
};

export const appRoutes = [
	{
		element: <Wrapper />,
		errorElement: <RouterErrorBoundary />,
		children: [
			{
				path: '/',
				index: true,
				element: <MainPage />
			}
		]
	}
] satisfies RouteObject[];

export const Interface = (props: { router: RouterProviderProps['router'] }) => {
	return (
		<ErrorBoundary FallbackComponent={ErrorFallback}>
			<RouterProvider router={props.router} />
		</ErrorBoundary>
	);
};

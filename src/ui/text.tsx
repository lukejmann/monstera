/**
 * Preset styles of the Rebass Text component
 */
import { Text, TextProps as TextPropsOriginal } from 'rebass';
import styled from 'styled-components/macro';

const TextHeavy = styled.div`
	font-size: 11px;
	letter-spacing: -0.09px;
	font-weight: 550;
`;

export const PortfolioTitle = styled(TextHeavy)`
	font-size: 18px;
	color: ${({ theme }) => theme.text1};
`;

export const PrimaryValueText = styled(TextHeavy)`
	font-size: 25.754px;
	font-weight: 500;
	letter-spacing: -0.129px;
	color: ${({ theme }) => theme.text1};
`;

export const AddressLabel = styled(TextHeavy)`
	font-size: 12px;
	color: ${({ theme }) => theme.text2};
`;

export const ActionText = styled(TextHeavy)`
	font-size: 12px;
	color: ${({ theme }) => theme.text2};
`;
export const ErrorText = styled(TextHeavy)`
	font-size: 10px;
	color: ${({ theme }) => theme.text2};
`;

export const Input = styled.input`
	font-size: 12px;
	flex: 1;
	font-weight: 500;
	border: none;
	outline: none;
	&::placeholder {
		color: #d0d0d0;
	}
	&:focus {
		color: ${({ theme }) => theme.text2};
	}
`;

export const SectionTitle = styled(TextHeavy)`
	font-size: 12px;
	color: ${({ theme }) => theme.text2};
`;

const SubTextHeavy = styled.div`
	font-size: 11px;
	letter-spacing: -0.005em;
	font-weight: 450;
`;

export const SpaceTitle = styled(TextHeavy)`
	font-size: 18.3586px;
	color: ${({ theme }) => theme.text1};
`;

export const SpaceSubtitle = styled(SubTextHeavy)`
	font-size: 14.2269px;
	color: ${({ theme }) => theme.text2};
`;

export const SectionHeader = styled(TextHeavy)`
	color: ${({ theme }) => theme.text1};
`;

export const ItemTitle = styled(TextHeavy)`
	color: ${({ theme }) => theme.text1};
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

export const ItemSubtitle = styled(SubTextHeavy)`
	color: ${({ theme }) => theme.text2};
`;

export const ItemStatus = styled(SubTextHeavy)`
	font-style: normal;
	font-weight: 700;
	font-size: 9.82263px;

	letter-spacing: -0.005em;

	color: ${({ theme }) => theme.text2};
`;

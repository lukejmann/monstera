import { PropsWithChildren } from 'react';
import styled from 'styled-components/macro';

export const ButtonTextBase = styled.div`
	font-weight: 500;
	font-size: 12px;
	width: fit-content;

	color: ${({ theme }) => theme.textInverse1};
`;

export const ButtonBase = styled.div<{ disabled?: boolean }>`
	display: flex;
	padding: 7.5px 11px;
	flex-direction: column;
	align-items: flex-start;
	gap: 7.5px;
	border: 1.5px solid #e6e6e6;
	border-radius: 10px;
	background: ${({ theme }) => theme.backgroundInverse1};

	&:hover {
		cursor: pointer;
	}

	${({ disabled }) =>
		disabled &&
		`
        opacity: 0.5;
        &:hover {
            cursor: not-allowed;
        }
    `}
`;

interface ActionButtonProps extends PropsWithChildren {
	text?: string;
	onClick?: () => void;
	disabled?: boolean;
}

export default function ActionButton({ text, onClick, disabled, children }: ActionButtonProps) {
	return (
		<ButtonBase onClick={onClick ? onClick : undefined} disabled={disabled}>
			<ButtonTextBase>{text}</ButtonTextBase>
			{/* {children && (
				<div
					style={{
						position: 'absolute',
						opacity: 0,
						right: 0,
						top: 0,
						bottom: 0,
						left: 0,
						cursor: 'pointer'
					}}
				>
					{children}
				</div>
			)} */}
		</ButtonBase>
	);
}

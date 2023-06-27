import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { AreaClosed, Bar, Line } from '@visx/shape';
import { easeSinOut } from 'd3';
import ms from 'ms.macro';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useTheme } from 'styled-components/macro';
import { opacify } from '~/ui';
import { LineChartProps } from './LineChart';

type AnimatedInLineChartProps<T> = Omit<LineChartProps<T>, 'height' | 'width' | 'children'>;

const AnimatedAreaClosed = animated(AreaClosed);
const AnimatedLinearGradient = animated(LinearGradient);

const config = {
	duration: ms`0.8s`,
	easing: easeSinOut
};

function AnimatedInLineChart<T>({
	data,
	getX,
	getY,
	marginTop,
	curve,
	color,
	scale,
	strokeWidth
}: AnimatedInLineChartProps<T>) {
	const lineRef = useRef<SVGPathElement>(null);
	const [lineLength, setLineLength] = useState(0);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

	// const prevGetY = usePrevious(getY); // Storing the previous value of getY
	// const [ySpring, setYSpring] = useSpring(() => ({ y: getY(data[0]) }));

	const spring = useSpring({
		frame: shouldAnimate ? 0 : 1,
		config,
		onRest: () => {
			setShouldAnimate(true);
			setHasAnimatedIn(true);
		}
	});

	// // Use another useEffect to monitor getY changes and animate vertically
	// useEffect(() => {
	// 	if (prevGetY !== undefined && getY !== prevGetY) {
	// 		// interpolate the frame on data.length to call getY with the right index
	// 		const frame = spring.frame.to((frame) => Math.floor(frame * data.length));
	// 		setYSpring({ y: getY(data[frame]) });
	// 	}
	// }, [getY, prevGetY, setYSpring, spring.frame, data]);

	useEffect(() => {
		setShouldAnimate(false);
		setHasAnimatedIn(false);
	}, [data]);

	useEffect(() => {
		if (lineRef.current) {
			const length = lineRef.current.getTotalLength();
			if (length !== lineLength) {
				setLineLength(length);
			}
			if (length > 0 && !shouldAnimate && !hasAnimatedIn) {
				setShouldAnimate(true);
			}
		}
	});
	const theme = useTheme();
	const lineColor = color ?? theme.accent1;

	return (
		<Group top={marginTop} style={{ padding: 10, margin: -10, overflow: 'visible' }}>
			<LinePath curve={curve} x={getX} y={getY}>
				{({ path }) => {
					const d = path(data) || '';
					return (
						<>
							<AreaClosed
								yScale={scale}
								data={data}
								x={getX}
								y={getY}
								strokeWidth={1}
								fill="url(#area-gradient)"
								curve={curve}
							/>
							<AnimatedLinearGradient
								id="area-gradient"
								from={spring.frame.to((v) => opacify(10 - 10 * v, theme.accent2))}
								to={spring.frame.to((v) => opacify(2 - 2 * v, theme.accent1))}
							/>

							<animated.path
								d={d}
								ref={lineRef}
								strokeWidth={strokeWidth}
								strokeOpacity={hasAnimatedIn ? 1 : 0}
								fill="none"
								stroke={lineColor}
								// transform={ySpring.y.to((value) => `translate(0, ${value})`)} // Add this
							/>
							{shouldAnimate && lineLength !== 0 && (
								<animated.path
									d={d}
									strokeWidth={strokeWidth}
									fill="none"
									stroke={lineColor}
									strokeDashoffset={spring.frame.to((v) => v * lineLength)}
									strokeDasharray={lineLength}
									// transform={ySpring.y.to((value) => `translate(0, ${value})`)} // Add this
								/>
							)}
						</>
					);
				}}
			</LinePath>
		</Group>
	);
}

export default React.memo(AnimatedInLineChart) as typeof AnimatedInLineChart;

import { AxisBottom, TickFormatter } from '@visx/axis';
import { localPoint } from '@visx/event';
import { EventType } from '@visx/event/lib/types';
// @ts-ignore
import { GlyphCircle } from '@visx/glyph';
import { Line } from '@visx/shape';
import { NumberValue, bisect, curveCardinal, scaleLinear, timeDay, timeMinute } from 'd3';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingUp } from 'react-feather';
import styled, { useTheme } from 'styled-components/macro';
import { ErrorText } from '~/ui';
import { PortfolioScope, minutesPerScope } from '../index';
import { dayHourFormatter, formatUSD, hourFormatter, monthDayFormatter } from '../util';
import AnimatedInLineChart from './AnimatedInLineChart';
import InLineChart from './InLineChart';

const DATA_EMPTY = { value: 0, date: new Date() };

export interface ChartValuePoint {
	date: Date;
	value: number;
}

export function getValueBounds(valuePoints: ChartValuePoint[]): [number, number] {
	const values = valuePoints.map((x) => x.value);
	const min = Math.min(...values);
	const max = Math.max(...values);
	return [min, max];
}

const StyledUpArrow = styled(ArrowUpRight)`
	color: ${({ theme }) => theme.accentSuccess};
`;
const StyledDownArrow = styled(ArrowDownRight)`
	color: ${({ theme }) => theme.accentFailure};
`;

function calculateDelta(start: number, current: number) {
	return (current / start - 1) * 100;
}

export function getDeltaArrow(delta: number | null | undefined, iconSize = 20) {
	if (delta === null || delta === undefined) {
		return null;
	} else if (Math.sign(delta) < 0) {
		return <StyledDownArrow size={iconSize} key="arrow-down" aria-label="down" />;
	}
	return <StyledUpArrow size={iconSize} key="arrow-up" aria-label="up" />;
}

export function formatDelta(delta: number | null | undefined) {
	if (delta === null || delta === undefined || delta === Infinity || isNaN(delta)) {
		return '-';
	}
	const formattedDelta = Math.abs(delta).toFixed(2) + '%';
	return formattedDelta;
}

export const DeltaText = styled.span<{ delta?: number }>`
	color: ${({ theme, delta }) =>
		delta !== undefined
			? Math.sign(delta) < 0
				? theme.accentFailure
				: theme.accentSuccess
			: theme.textPrimary};
`;

const ChartWrapper = styled.div`
	position: relative;
	width: 100%;
	height: 100%;
`;

const ChartHeader = styled.div`
	position: absolute;
	animation-duration: ${({ theme }) => theme.transition.duration.medium};
`;
export const TokenValue = styled.span`
	font-size: 36px;
	line-height: 44px;
`;
const MissingValue = styled(TokenValue)`
	font-size: 24px;
	line-height: 44px;
	color: ${({ theme }) => theme.textTertiary};
`;

const DeltaContainer = styled.div`
	height: 16px;
	display: flex;
	align-items: center;
	margin-top: 4px;
`;
export const ArrowCell = styled.div`
	padding-right: 3px;
	display: flex;
`;

function fixChart(values: ChartValuePoint[] | undefined | null) {
	if (!values) return { values: null, blanks: [] };

	const fixedChart: ChartValuePoint[] = [];
	const blanks: ChartValuePoint[][] = [];
	let lastValue: ChartValuePoint | undefined = undefined;
	for (let i = 0; i < values.length; i++) {
		// @ts-ignore
		if (values[i].value !== 0) {
			if (fixedChart.length === 0 && i !== 0) {
				// @ts-ignore
				blanks.push([{ ...values[0], value: values[i].value }, values[i]]);
			}
			lastValue = values[i];
			// @ts-ignore
			fixedChart.push(values[i]);
		}
	}

	if (lastValue && lastValue !== values[values.length - 1]) {
		// @ts-ignore
		blanks.push([lastValue, { ...values[values.length - 1], value: lastValue.value }]);
	}

	return { values: fixedChart, blanks };
}

const margin = { top: 100, bottom: 48, crosshair: 72 };

interface ValueChartProps {
	width: number;
	height: number;
	values?: ChartValuePoint[] | null;
	portfolioScope: PortfolioScope;
}

export function ValueChart({
	width,
	height,
	values: originalValues,
	portfolioScope
}: ValueChartProps) {
	const locale = 'en-US';
	const theme = useTheme();

	const { values, blanks } = useMemo(
		() =>
			originalValues && originalValues.length > 0
				? fixChart(originalValues)
				: { values: null, blanks: [] },
		[originalValues]
	);

	const chartAvailable = !!values && values.length > 0;
	const missingValuesMessage = 'No data available';

	const startingValue = originalValues?.[0] ?? DATA_EMPTY;

	const endingValue = originalValues?.[originalValues.length - 1] ?? DATA_EMPTY;
	const [displayValue, setDisplayValue] = useState(startingValue);

	useEffect(() => {
		setDisplayValue(endingValue);
	}, [values, endingValue]);
	const [crosshair, setCrosshair] = useState<number | null>(null);

	const graphInnerHeight = height - margin.top - margin.bottom;

	const timeScale = useMemo(
		() =>
			scaleLinear()
				.domain([startingValue.date.valueOf(), endingValue.date.valueOf()])
				.range([0, width]),
		[startingValue, endingValue, width]
	);

	const rdScale = useMemo(
		() =>
			scaleLinear()
				.domain(getValueBounds(originalValues ?? []))
				.range([graphInnerHeight, 0]),
		[originalValues, graphInnerHeight]
	);

	function tickFormat(
		portfolioScope: PortfolioScope,
		locale: string
	): [TickFormatter<NumberValue>, (v: number) => string, NumberValue[]] {
		const offsetTime = (endingValue.date.valueOf() - startingValue.date.valueOf()) / 24;

		const startDateWithOffset = new Date((startingValue.date.valueOf() + offsetTime) * 1000);

		const endDateWithOffset = new Date((endingValue.date.valueOf() - offsetTime) * 1000);
		// console.log('startDateWithOffset', startDateWithOffset);
		// console.log('endDateWithOffset', endDateWithOffset);

		// switch (portfolioScope) {
		if (minutesPerScope(portfolioScope) <= minutesPerScope(PortfolioScope.ONEWEEK)) {
			const interval = timeMinute.every(5);

			return [
				hourFormatter(locale),
				dayHourFormatter(locale),
				(interval ?? timeMinute)
					.range(startDateWithOffset, endDateWithOffset, interval ? 2 : 10)
					.map((x) => x.valueOf() / 1000)
			];
		}

		return [
			monthDayFormatter(locale),
			dayHourFormatter(locale),
			timeDay.range(startDateWithOffset, endDateWithOffset, 7).map((x) => x.valueOf() / 1000)
		];
		// }
	}

	const handleHover = useCallback(
		(event: Element | EventType) => {
			if (!values) return;

			const { x } = localPoint(event) || { x: 0 };
			const x0 = timeScale.invert(x);
			const index = bisect(
				values.map((x) => x.date.valueOf()),
				x0,
				1
			);

			const d0 = values[index - 1] ?? DATA_EMPTY;
			const d1 = values[index];
			let valuePoint = d0;

			const hasPreviousData = d1 && d1.date;
			if (hasPreviousData) {
				valuePoint = x0.valueOf() - d0.date.valueOf() > d1.date.valueOf() - x0.valueOf() ? d1 : d0;
			}

			if (valuePoint) {
				setCrosshair(timeScale(valuePoint.date));
				setDisplayValue(valuePoint);
			}
		},
		[timeScale, values]
	);

	const resetDisplay = useCallback(() => {
		setCrosshair(null);
		setDisplayValue(endingValue);
	}, [setCrosshair, setDisplayValue, endingValue]);

	useEffect(() => {
		setCrosshair(null);
	}, [portfolioScope]);

	const [tickFormatter, crosshairDateFormatter, ticks] = tickFormat(portfolioScope, locale);

	const maxTicks = Math.floor(width / 100);
	function calculateTicks(ticks: NumberValue[]) {
		const newTicks = [];
		const tickSpacing = Math.floor(ticks.length / maxTicks);
		for (let i = 1; i < ticks.length; i += tickSpacing) {
			newTicks.push(ticks[i]);
		}
		return newTicks;
	}

	const updatedTicks =
		maxTicks > 0 ? (ticks.length > maxTicks ? calculateTicks(ticks) : ticks) : [];
	const delta = calculateDelta(startingValue.value, displayValue.value);
	const formattedDelta = formatDelta(delta);
	const arrow = getDeltaArrow(delta);
	const crosshairEdgeMax = width * 0.85;
	const crosshairAtEdge = !!crosshair && crosshair > crosshairEdgeMax;

	const curveTension = 0.9;

	const getX = useMemo(() => (p: ChartValuePoint) => timeScale(p.date.valueOf()), [timeScale]);
	const getY = useMemo(() => (p: ChartValuePoint) => rdScale(p.value), [rdScale]);
	const curve = useMemo(() => curveCardinal.tension(curveTension), [curveTension]);

	return (
		<ChartWrapper>
			<ChartHeader data-cy="chart-header">
				{displayValue.value ? (
					<>
						<TokenValue>{formatUSD(displayValue.value)}</TokenValue>
						<DeltaContainer>
							{formattedDelta}
							<ArrowCell>{arrow}</ArrowCell>
						</DeltaContainer>
					</>
				) : (
					<>
						<MissingValue>Value Unavailable</MissingValue>
						<ErrorText style={{ color: theme?.text3 }}>{missingValuesMessage}</ErrorText>
					</>
				)}
			</ChartHeader>
			{!chartAvailable ? (
				<MissingValueChart
					width={width}
					height={height}
					message={!!displayValue.value && missingValuesMessage}
				/>
			) : (
				<svg data-cy="value-chart" width={width} height={height} style={{ minWidth: '100%' }}>
					<AnimatedInLineChart
						data={values}
						getX={getX}
						getY={getY}
						marginTop={margin.top}
						curve={curve}
						strokeWidth={2}
					/>
					{blanks.map((blank, index) => (
						<InLineChart
							key={index}
							data={blank}
							getX={getX}
							getY={getY}
							marginTop={margin.top}
							curve={curve}
							strokeWidth={2}
							color={theme?.accent3}
							dashed
						/>
					))}
					{crosshair !== null ? (
						<g>
							<AxisBottom
								scale={timeScale}
								stroke={theme?.border1}
								tickFormat={tickFormatter}
								tickStroke={theme.backgroundOutline}
								tickLength={4}
								hideTicks={true}
								tickTransform="translate(0 -5)"
								tickValues={updatedTicks as number[]}
								top={height - 1}
								tickLabelProps={() => ({
									fill: theme.text2,
									fontSize: 12,
									textAnchor: 'middle',
									transform: 'translate(0 -24)'
								})}
							/>
							<text
								x={crosshair + (crosshairAtEdge ? -4 : 4)}
								y={margin.crosshair + 10}
								textAnchor={crosshairAtEdge ? 'end' : 'start'}
								fontSize={12}
								fill={theme.textSecondary}
							>
								{crosshairDateFormatter(displayValue.date.valueOf())}
							</text>
							<Line
								from={{ x: crosshair, y: margin.crosshair }}
								to={{ x: crosshair, y: height }}
								stroke={theme.backgroundOutline}
								strokeWidth={1}
								pointerEvents="none"
								strokeDasharray="4,4"
							/>
							<GlyphCircle
								left={crosshair}
								top={rdScale(displayValue.value) + margin.top}
								size={50}
								fill={theme.accentAction}
								stroke={theme.backgroundOutline}
								strokeWidth={0.5}
							/>
						</g>
					) : (
						<AxisBottom
							hideAxisLine={true}
							scale={timeScale}
							stroke={theme.backgroundOutline}
							top={height - 1}
							hideTicks
						/>
					)}
					{!width && (
						<line
							x1={0}
							y1={height - 1}
							x2="100%"
							y2={height - 1}
							fill="transparent"
							shapeRendering="crispEdges"
							stroke={theme.backgroundOutline}
							strokeWidth={1}
						/>
					)}
					<rect
						x={0}
						y={0}
						width={width}
						height={height}
						fill="transparent"
						onTouchStart={handleHover}
						onTouchMove={handleHover}
						onMouseMove={handleHover}
						onMouseLeave={resetDisplay}
					/>
				</svg>
			)}
		</ChartWrapper>
	);
}

const StyledMissingChart = styled.svg`
	text {
		font-size: 12px;
		font-weight: 400;
	}
`;
const chartBottomPadding = 15;
function MissingValueChart({
	width,
	height,
	message
}: {
	width: number;
	height: number;
	message: ReactNode;
}) {
	const theme = useTheme();
	const midPoint = height / 2 + 45;
	return (
		<StyledMissingChart
			data-cy="missing-chart"
			width={width}
			height={height}
			style={{ minWidth: '100%' }}
		>
			<path
				d={`M 0 ${midPoint} Q 104 ${midPoint - 70}, 208 ${midPoint} T 416 ${midPoint}
          M 416 ${midPoint} Q 520 ${midPoint - 70}, 624 ${midPoint} T 832 ${midPoint}`}
				stroke={theme.backgroundOutline}
				fill="transparent"
				strokeWidth="2"
			/>
			{message && (
				<TrendingUp
					stroke={theme.textTertiary}
					x={0}
					size={12}
					y={height - chartBottomPadding - 10}
				/>
			)}
			<text y={height - chartBottomPadding} x="20" fill={theme.textTertiary}>
				{message}
			</text>
		</StyledMissingChart>
	);
}

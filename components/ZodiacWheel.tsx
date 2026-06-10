import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'
import { ZODIAC, getSignByName } from '@/lib/astrology'
import { colors, elementColors } from '@/constants/theme'

interface ZodiacWheelProps {
  activeSign: string
  size: number
}

// Build an SVG pie-wedge path from `a0` to `a1` (degrees, clockwise from top).
function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }
  const [x0, y0] = toXY(a0)
  const [x1, y1] = toXY(a1)
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`
}

export default function ZodiacWheel({ activeSign, size }: ZodiacWheelProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(0.92)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [activeSign])

  const cx = size / 2
  const cy = size / 2
  const outerR = size / 2 - 2
  const wedgeR = outerR - 6
  const labelR = wedgeR * 0.72
  const centerR = wedgeR * 0.3

  const active = getSignByName(activeSign)

  return (
    <Animated.View style={{ width: size, height: size, opacity, transform: [{ scale }] }}>
      <Svg width={size} height={size}>
        {/* Outer ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="none"
          stroke="rgba(155,109,255,0.4)"
          strokeWidth={1.5}
        />

        {/* Segments */}
        {ZODIAC.map((sign, i) => {
          const a0 = i * 30
          const a1 = a0 + 30
          const mid = a0 + 15
          const rad = ((mid - 90) * Math.PI) / 180
          const lx = cx + labelR * Math.cos(rad)
          const ly = cy + labelR * Math.sin(rad)
          const isActive = active?.name === sign.name

          return (
            <G key={sign.name}>
              <Path
                d={wedgePath(cx, cy, wedgeR, a0, a1)}
                fill={isActive ? colors.purple : elementColors[sign.element]}
                fillOpacity={isActive ? 1 : 0.85}
                stroke={isActive ? colors.gold : colors.bg}
                strokeWidth={isActive ? 2.5 : 1}
              />
              <SvgText
                x={lx}
                y={ly}
                fontSize={wedgeR * 0.13}
                fill={isActive ? colors.gold : colors.bg}
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {sign.symbol}
              </SvgText>
            </G>
          )
        })}

        {/* Center circle */}
        <Circle
          cx={cx}
          cy={cy}
          r={centerR}
          fill={colors.bg}
          stroke="rgba(155,109,255,0.5)"
          strokeWidth={1.5}
        />
        <SvgText
          x={cx}
          y={cy}
          fontSize={centerR * 1.0}
          fill={colors.gold}
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {active?.symbol ?? '✦'}
        </SvgText>
      </Svg>
    </Animated.View>
  )
}

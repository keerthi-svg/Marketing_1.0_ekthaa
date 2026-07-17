// AnimatedCounter.jsx – smooth number counter on mount
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { formatNumber } from '../utils/formatTime';

export default function AnimatedCounter({ value, suffix = '', className = '', style = {} }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useAnimatedCounter(isInView ? value : 0, 1200);

  return (
    <span ref={ref} className={className} style={style}>
      {formatNumber(count)}{suffix}
    </span>
  );
}

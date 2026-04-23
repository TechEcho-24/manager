"use client";

import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number | string;
  duration?: number;
}

export function AnimatedNumber({ value, duration = 800 }: AnimatedNumberProps) {
  const numericValue = typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value;
  const isPercentage = typeof value === "string" && value.includes("%");
  
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const endValue = numericValue;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = Math.floor(easeProgress * (endValue - startValue) + startValue);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [numericValue, duration]);

  return (
    <span>
      {displayValue}
      {isPercentage ? "%" : ""}
    </span>
  );
}

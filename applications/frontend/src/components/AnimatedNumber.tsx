import { useEffect, useState } from "react";
import { useSpring } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
}

export default function AnimatedNumber({ value, className = "" }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const spring = useSpring(value, { stiffness: 120, damping: 20 });

  useEffect(() => {
    spring.set(value);
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return () => unsubscribe();
  }, [value, spring]);

  return <span className={className}>{display}</span>;
}

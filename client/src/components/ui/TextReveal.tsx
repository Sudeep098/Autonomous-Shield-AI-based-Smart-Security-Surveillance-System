import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CHARS = "-_~=\\/[]{}!@#$%^&*()_+";

export const TextReveal = ({ children, className }: { children: string, className?: string }) => {
    const [displayText, setDisplayText] = useState("");
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    useEffect(() => {
        if (!isInView) return;

        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(
                children
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return children[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= children.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [children, isInView]);

    return (
        <span ref={ref} className={className}>
            {displayText}
        </span>
    );
};

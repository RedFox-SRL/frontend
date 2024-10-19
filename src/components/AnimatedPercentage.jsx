import React, { useState, useEffect } from "react";

const AnimatedPercentage = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const animationDuration = 1000;
        const startTime = Date.now();

        const animateValue = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / animationDuration, 1);
            setDisplayValue(Math.round(progress * value));

            if (progress < 1) {
                requestAnimationFrame(animateValue);
            }
        };

        requestAnimationFrame(animateValue);
    }, [value]);

    return <span>{displayValue}</span>;
};

export default AnimatedPercentage;

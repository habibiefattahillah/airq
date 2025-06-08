import { Info } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

export default function InfoTooltip({ message }: { message: string }) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        const handlePosition = () => {
            const tooltip = tooltipRef.current;
            const container = containerRef.current;
            if (!tooltip || !container) return;

            // const tooltipRect = tooltip.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const padding = 8;

            let left = container.offsetWidth / 2 - tooltip.offsetWidth / 2;

            const absoluteLeft = containerRect.left + left;

            // Clamp if overflowing left
            if (absoluteLeft < padding) {
                left += padding - absoluteLeft;
            }
            // Clamp if overflowing right
            if (absoluteLeft + tooltip.offsetWidth > viewportWidth - padding) {
                left -= (absoluteLeft + tooltip.offsetWidth) - (viewportWidth - padding);
            }

            setTooltipStyle({
                left,
            });
        };

        handlePosition();
        window.addEventListener("resize", handlePosition);
        return () => window.removeEventListener("resize", handlePosition);
    }, [message]);

    return (
        <div ref={containerRef} className="relative group inline-block ml-1 align-top">
            <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer" />

            <div
                ref={tooltipRef}
                style={tooltipStyle}
                className={`absolute z-10 top-6 w-fit max-w-[90vw] bg-white border border-gray-300 text-sm text-gray-700 p-2 rounded shadow-md 
                    opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200`}
            >
                {message}
            </div>
        </div>
    );
}

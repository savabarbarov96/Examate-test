import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: number[]
    onValueChange?: (value: number[]) => void
    max?: number
    min?: number
    step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
        const val = value ? value[0] : min;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onValueChange) {
                onValueChange([parseFloat(e.target.value)]);
            }
        };

        return (
            <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
                <input
                    type="range"
                    ref={ref}
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={handleChange}
                    className={cn(
                        "h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary disabled:cursor-not-allowed disabled:opacity-50",
                        // Custom thumb styles for webkit
                        "[&::-webkit-slider-thumb]:appearance-none",
                        "[&::-webkit-slider-thumb]:h-5",
                        "[&::-webkit-slider-thumb]:w-5",
                        "[&::-webkit-slider-thumb]:rounded-full",
                        "[&::-webkit-slider-thumb]:border-2",
                        "[&::-webkit-slider-thumb]:border-primary",
                        "[&::-webkit-slider-thumb]:bg-background",
                        "[&::-webkit-slider-thumb]:ring-offset-background",
                        "[&::-webkit-slider-thumb]:transition-colors",
                        "[&::-webkit-slider-thumb]:focus-visible:outline-none",
                        "[&::-webkit-slider-thumb]:focus-visible:ring-2",
                        "[&::-webkit-slider-thumb]:focus-visible:ring-ring",
                        "[&::-webkit-slider-thumb]:focus-visible:ring-offset-2",
                        // Custom thumb styles for firefox
                        "[&::-moz-range-thumb]:h-5",
                        "[&::-moz-range-thumb]:w-5",
                        "[&::-moz-range-thumb]:rounded-full",
                        "[&::-moz-range-thumb]:border-2",
                        "[&::-moz-range-thumb]:border-primary",
                        "[&::-moz-range-thumb]:bg-background",
                        "[&::-moz-range-thumb]:ring-offset-background",
                        "[&::-moz-range-thumb]:transition-colors",
                        "[&::-moz-range-thumb]:focus-visible:outline-none",
                        "[&::-moz-range-thumb]:focus-visible:ring-2",
                        "[&::-moz-range-thumb]:focus-visible:ring-ring",
                        "[&::-moz-range-thumb]:focus-visible:ring-offset-2"
                    )}
                    {...props}
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }

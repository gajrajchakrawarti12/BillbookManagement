import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, onChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#d9e2ec] bg-white px-3 py-2 text-sm text-[#102a43] shadow-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#829ab1] transition-colors focus-visible:border-[#39b982] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#39b982]/15 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={onChange}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;

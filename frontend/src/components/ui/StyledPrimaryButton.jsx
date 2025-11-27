import { forwardRef } from "react";

const defaultClasses =
  "flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800";

const StyledPrimaryButton = forwardRef(
  ({ children, className = "", title, onClick, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`${defaultClasses} ${className}`}
        title={title}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

StyledPrimaryButton.displayName = "StyledPrimaryButton";
export default StyledPrimaryButton;

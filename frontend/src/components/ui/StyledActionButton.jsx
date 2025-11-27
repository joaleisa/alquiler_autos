import { forwardRef } from "react";

const primaryIconClasses =
  "size-8 rounded-full p-0 text-slate-800 hover:bg-slate-300/20 focus:bg-slate-300/20 active:bg-slate-300/25 dark:bg-navy-500 dark:text-navy-50 dark:hover:bg-navy-450 dark:focus:bg-navy-450 dark:active:bg-navy-450/90";

const StyledActionButton = forwardRef(
  (
    {
      children,
      className = "",
      title,
      onClick,
      colorClass = "text-blue-600",
      isIconOnly = true,
      isSecondary = false,
      ...rest
    },
    ref
  ) => {
    const secondaryButtonClasses = `flex items-center gap-2 px-4 py-2 text-sm border font-medium rounded-lg transition-colors duration-200 
    ${isSecondary ? "bg-white" : "bg-slate-150"} 
    ${colorClass.replace("text-", "border-")} border-opacity-50 
    ${colorClass} hover:bg-current hover:text-white hover:shadow-md`;

    const finalClasses = isIconOnly
      ? primaryIconClasses
      : secondaryButtonClasses;

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`btn ${finalClasses} ${className}`}
        title={title}
        {...rest}
      >
        {}
        {isIconOnly ? (
          <div className={`flex items-center justify-center ${colorClass}`}>
            {children}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

StyledActionButton.displayName = "StyledActionButton";
export default StyledActionButton;

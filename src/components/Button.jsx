import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  animate = true,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md",
    success:
      "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm hover:shadow-md",
    danger:
      "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm hover:shadow-md",
    warning:
      "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm hover:shadow-md",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 shadow-sm hover:shadow-md",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizes = {
    xs: "px-2.5 py-1.5 text-xs rounded-md",
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
    xl: "px-8 py-4 text-lg rounded-xl",
  };

  const buttonVariants = {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 },
  };

  const Component = animate ? motion.button : "button";

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      whileTap={animate ? buttonVariants.tap : undefined}
      whileHover={
        animate && !disabled && !loading ? buttonVariants.hover : undefined
      }
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}

      {Icon && iconPosition === "left" && !loading && (
        <Icon className={`w-4 h-4 ${children ? "mr-2" : ""}`} />
      )}

      {children}

      {Icon && iconPosition === "right" && !loading && (
        <Icon className={`w-4 h-4 ${children ? "ml-2" : ""}`} />
      )}
    </Component>
  );
};

export default Button;

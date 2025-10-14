import React from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const Button = React.memo(({
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
      "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-xl hover:shadow-2xl border border-primary-500/20 backdrop-blur-sm",
    secondary:
      "bg-white/10 text-white hover:bg-white/20 focus:ring-primary-500 shadow-xl hover:shadow-2xl border border-white/20 backdrop-blur-md",
    success:
      "bg-gradient-to-r from-success-600 to-success-700 text-white hover:from-success-700 hover:to-success-800 focus:ring-success-500 shadow-xl hover:shadow-2xl border border-success-500/20 backdrop-blur-sm",
    danger:
      "bg-gradient-to-r from-danger-600 to-danger-700 text-white hover:from-danger-700 hover:to-danger-800 focus:ring-danger-500 shadow-xl hover:shadow-2xl border border-danger-500/20 backdrop-blur-sm",
    warning:
      "bg-gradient-to-r from-warning-600 to-warning-700 text-white hover:from-warning-700 hover:to-warning-800 focus:ring-warning-500 shadow-xl hover:shadow-2xl border border-warning-500/20 backdrop-blur-sm",
    outline:
      "border border-white/30 bg-white/5 text-white hover:bg-white/15 focus:ring-primary-500 shadow-xl hover:shadow-2xl backdrop-blur-md",
    ghost: "text-white hover:bg-white/10 focus:ring-primary-500 backdrop-blur-sm",
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
});

Button.displayName = 'Button';

export default Button;

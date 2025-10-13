import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  animate = true,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    primary: 'bg-primary-500/20 text-primary-300 border border-primary-500/30 backdrop-blur-sm',
    secondary: 'bg-white/10 text-gray-300 border border-white/20 backdrop-blur-sm',
    success: 'bg-success-500/20 text-success-300 border border-success-500/30 backdrop-blur-sm',
    danger: 'bg-danger-500/20 text-danger-300 border border-danger-500/30 backdrop-blur-sm',
    warning: 'bg-warning-500/20 text-warning-300 border border-warning-500/30 backdrop-blur-sm',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const Component = animate ? motion.span : 'span';

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      variants={animate ? badgeVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Badge;
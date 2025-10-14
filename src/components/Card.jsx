import React from 'react';
import { motion } from 'framer-motion';

const Card = React.memo(({ 
  children, 
  className = '', 
  hover = false, 
  animate = true,
  delay = 0,
  ...props 
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    hover: { 
      y: -4,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    }
  };

  const Component = animate ? motion.div : 'div';

  return (
    <Component
      className={`liquid-glass p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-2xl hover:-translate-y-2 hover:bg-white/15 cursor-pointer' : ''
      } ${className}`}
      variants={animate ? cardVariants : undefined}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      whileHover={hover ? hoverVariants.hover : undefined}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

export default Card;
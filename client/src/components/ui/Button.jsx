import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false, 
  type = 'button',
  className = '',
  icon: Icon
}) => {
  const baseStyle = "flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gold-600 text-white hover:bg-gold-700 shadow-lg hover:shadow-gold-500/30 focus:ring-gold-500",
    secondary: "bg-gold-50 text-gold-700 hover:bg-gold-100 focus:ring-gold-500 border border-gold-200",
    outline: "border-2 border-gold-200 text-gold-700 hover:border-gold-500 hover:text-gold-600 bg-transparent focus:ring-gold-500",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
    ghost: "text-gold-600 hover:text-gold-800 hover:bg-gold-50 focus:ring-gold-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg w-full"
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, translateY: -1 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes.md} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5 ml-2" />}
      {children}
    </motion.button>
  );
};

export default Button;

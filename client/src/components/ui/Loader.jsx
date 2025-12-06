import { motion } from 'framer-motion';

const Loader = ({ size = 'md', className = '' }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const dot = {
    hidden: { y: 0 },
    show: {
      y: [0, -10, 0],
      transition: {
        repeat: Infinity,
        duration: 0.8
      }
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className={`flex space-x-2 items-center justify-center ${className}`}
    >
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          variants={dot}
          className="w-3 h-3 bg-indigo-600 rounded-full"
        />
      ))}
    </motion.div>
  );
};

export default Loader;

import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, Variable, LogOut, History, Plus } from 'lucide-react';
import Card from '../components/ui/Card';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const userName = user?.phoneNumber || 'کاربر عزیز';

  const menuItems = [
    {
      title: 'آپلود کارت جدید',
      description: 'یک فایل صوتی یا ویدیویی جدید اضافه کنید',
      icon: Plus,
      path: '/upload',
      color: 'bg-indigo-600',
      iconColor: 'text-indigo-100',
      delay: 0.1
    },
    {
      title: 'تاریخچه آپلودها',
      description: 'مشاهده و مدیریت فایل‌های قبلی',
      icon: History,
      path: '/history',
      color: 'bg-purple-600',
      iconColor: 'text-purple-100',
      delay: 0.2
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100"
      >
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
              P
            </div> */}
            <span className="font-bold text-xl text-gray-900 tracking-tight">شوروم هانه</span>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center text-gray-500 hover:text-red-500 transition-colors font-medium px-4 py-2 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="w-5 h-5 ml-2" />
            خروج
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight pb-2">
            سلام، خوش آمدید 👋
          </h1>
          {/* <p className="text-xl text-gray-500 max-w-2xl mx-auto text-center">
            امروز می‌خواهید چه کاری انجام دهید؟
          </p> */}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {menuItems.map((item, index) => (
            <Link to={item.path} key={index} className="block group">
              <Card className="h-full p-8 transition-all duration-300 hover:border-indigo-200">
                <div className="flex flex-col items-center text-center h-full">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: item.delay, type: "spring" }}
                    className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300 transform rotate-3 group-hover:rotate-6`}
                  >
                    <item.icon className={`w-10 h-10 ${item.iconColor}`} />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats or Footer can go here */}
        {/* <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center text-gray-400 text-sm"
        >
          نسخه ۲.۰ • طراحی شده با عشق 💜
        </motion.div> */}
      </main>
    </div>
  );
}

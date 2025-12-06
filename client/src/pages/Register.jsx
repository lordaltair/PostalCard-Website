import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Sparkles, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function Register() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(phoneNumber, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'ثبت نام ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 bg-[url('/grid-pattern.svg')]">
      <div className="absolute inset-0 bg-gradient-to-tl from-purple-50/50 to-pink-50/50 -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-purple-200"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">شروع کنید 🚀</h1>
          <p className="text-gray-500">حساب کاربری بسازید و خاطرات را ماندگار کنید</p>
        </div>

        <Card className="p-8 border-t-4 border-t-purple-500">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="شماره موبایل"
              type="text"
              placeholder="0912..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              icon={Phone}
              className="text-right"
              required
            />
            
            <Input
              label="رمز عبور"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              className="text-right"
              required
            />

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/30"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  در حال ساخت حساب...
                </div>
              ) : 'ثبت نام و شروع'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              قبلاً ثبت نام کرده‌اید؟{' '}
              <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                وارد شوید
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

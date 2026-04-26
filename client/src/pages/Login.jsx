import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Lock, ArrowRight, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phoneNumber, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gold-50 bg-[url('/grid-pattern.svg')]">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50/50 to-gold-100/50 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 mx-auto mb-6 flex items-center justify-center transform rotate-3"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 pb-4">
            خوش آمدید 👋
          </h1>
          <p className="text-gray-500">برای مدیریت کارت‌های پستی وارد شوید</p>
        </div>

        <Card className="p-8">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  در حال ورود...
                </div>
              ) : (
                <div className="flex items-center">
                  ورود به حساب
                  <ArrowRight className="w-5 h-5 mr-2" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              حساب کاربری ندارید؟{" "}
              <Link
                to="/register"
                className="text-gold-600 font-semibold hover:text-gold-700 transition-colors"
              >
                ثبت نام کنید
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

import { useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Check, Music, Video, ArrowRight, X } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Loader from "../components/ui/Loader";

const steps = [
  { id: 1, title: "انتخاب فایل" },
  { id: 2, title: "جزئیات" },
  { id: 3, title: "آپلود" },
  { id: 4, title: "اتمام" },
];

export default function Upload() {
  const uploadBaseUrl = (
    "http://188.121.125.218/api/" || "http://localhost:5000/api"
  ).replace("/api", "");
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [customName, setCustomName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (
      selectedFile.type.startsWith("audio/") ||
      selectedFile.type.startsWith("video/")
    ) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep(2);
      setError("");
    } else {
      setError("لطفاً فقط فایل صوتی یا ویدیویی انتخاب کنید.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCustomName("");
    setStep(1);
    setUploadedFile(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!customName) {
      setError("لطفاً نام کارت را وارد کنید.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("customName", customName);

    setUploading(true);
    setStep(3); // Show uploading UI
    setError("");

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedFile(res.data.file);
      // Small delay to show success state
      setTimeout(() => {
        setUploading(false);
        setStep(4);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "آپلود ناموفق بود. لطفاً دوباره تلاش کنید.(اگر به vpn متصل هستید، آن را قطع کنید)",
      );
      setStep(2); // Go back to details
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl overflow-hidden relative min-h-[500px] flex flex-col">
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2 w-full">
          <motion.div
            className="h-full bg-gold-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="p-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 && "آپلود فایل صوتی یا ویدئویی جدید 📤"}
              {step === 2 && "جزئیات کارت 📝"}
              {step === 3 && "در حال پردازش... ⚙️"}
              {step === 4 && "کارت شما آماده است! 🎉"}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Upload */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div
                  className={`w-full border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer mb-6 ${
                    dragActive
                      ? "border-gold-500 bg-gold-50 scale-[1.02]"
                      : "border-gold-200 hover:border-gold-400 hover:bg-gold-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) =>
                      e.target.files[0] && handleFileSelect(e.target.files[0])
                    }
                  />
                  <div className="w-20 h-20 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    برای آپلود کلیک کنید
                  </h3>
                  <p className="text-gray-500">یا فایل را اینجا رها کنید</p>
                  <p className="text-xs text-gray-400 mt-4 font-mono">
                    MP3, MP4, MOV (Max 150MB)
                  </p>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <Link to="/">
                  <Button variant="ghost">بازگشت به خانه</Button>
                </Link>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center bg-gray-50 p-4 rounded-xl mb-6">
                  <div className="w-12 h-12 bg-gold-100 text-gold-600 rounded-lg flex items-center justify-center ml-4">
                    {file?.type.startsWith("video") ? <Video /> : <Music />}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="font-bold text-gray-900 truncate" dir="ltr">
                      {file?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file?.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Input
                  label="نام کارت (عنوان نمایشی)"
                  placeholder="مثلا: روز مادر مبارک "
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  error={error}
                  className="mb-8"
                />

                <div className="mt-auto flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    تغییر فایل
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    className="flex-2"
                  >
                    ثبت و ایجاد لینک
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Loading */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <Loader size="lg" className="mb-8" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  در حال آپلود فایل...
                </h3>
                <p className="text-gray-500">
                  لطفاً صبر کنید، این عملیات ممکن است چند لحظه طول بکشد.
                </p>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && uploadedFile && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="bg-white p-4 rounded-xl border-2 border-gold-200 mb-6 shadow-lg">
                  <img
                    src={`${uploadBaseUrl}/uploads/${uploadedFile.qrCodePath}`}
                    alt="QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {uploadedFile.customName}
                </h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                  تبریک! کارت پستی شما ساخته شد. می‌توانید QR کد را دانلود کنید
                  یا لینک را به اشتراک بگذارید.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <a
                    href={`${uploadBaseUrl}/uploads/${uploadedFile.qrCodePath}`}
                    download
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      دانلود QR کد
                    </Button>
                  </a>
                  <Link
                    to={`/v/${uploadedFile.publicId}`}
                    target="_blank"
                    className="w-full"
                  >
                    <Button variant="primary" className="w-full">
                      مشاهده کارت پستی
                    </Button>
                  </Link>
                  <Link to="/history" className="w-full">
                    <Button variant="ghost" className="w-full text-sm">
                      رفتن به تاریخچه
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="w-full text-sm text-gray-400 hover:text-gray-600"
                  >
                    آپلود فایل جدید
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

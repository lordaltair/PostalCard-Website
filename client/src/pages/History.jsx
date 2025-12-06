import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ExternalLink, QrCode, ArrowRight, Video, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { formatToJalali } from '../utils/date';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function History() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to fetch files', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/files/${deleteId}`);
      setFiles(files.filter(f => f.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete file', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-colors ml-4">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تاریخچه فایل‌ها 📂</h1>
              <p className="text-gray-500 mt-1">مدیریت فایل‌های آپلود شده</p>
            </div>
          </div>
          <Link to="/upload">
            <Button variant="primary" size="sm">
              + فایل جدید
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : files.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl grayscale opacity-50">
              📭
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">هنوز فایلی ندارید</h3>
            <p className="text-gray-500 mb-6">اولین خاطره خود را ثبت کنید!</p>
            <Link to="/upload">
              <Button>شروع کنید</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {files.map((file) => (
                <motion.div key={file.id} variants={item} layout>
                  <Card className="h-full flex flex-col">
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${file.mimeType.startsWith('video') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {file.mimeType.startsWith('video') ? <Video className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                        </div>
                        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg">
                          {formatToJalali(file.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={file.customName}>
                        {file.customName}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md uppercase">
                          {file.mimeType.split('/')[1]}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                       <button
                         onClick={() => setSelectedQr(file)}
                         className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                       >
                         <QrCode className="w-4 h-4 ml-1" />
                         QR
                       </button>
                       <a
                         href={`/v/${file.publicId}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                       >
                         <ExternalLink className="w-4 h-4 ml-1" />
                         لینک
                       </a>
                       <button
                         onClick={() => setDeleteId(file.id)}
                         className="flex-none p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* QR Modal */}
        <Modal 
          isOpen={!!selectedQr} 
          onClose={() => setSelectedQr(null)}
          title="کد QR اختصاصی"
        >
          {selectedQr && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-100 mb-6">
                <img 
                  src={`http://localhost:5000/uploads/${selectedQr.qrCodePath}`} 
                  alt="QR Code" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              <h3 className="font-bold text-lg mb-2">{selectedQr.customName}</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">
                برای مشاهده فایل اسکن کنید یا از لینک زیر استفاده کنید
              </p>
              
              <div className="w-full flex gap-3">
                 <a 
                   href={`http://localhost:5000/uploads/${selectedQr.qrCodePath}`} 
                   download
                   className="flex-1"
                 >
                   <Button variant="outline" className="w-full">
                     دانلود QR
                   </Button>
                 </a>
                 <a 
                   href={`/v/${selectedQr.publicId}`} 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex-1"
                 >
                   <Button className="w-full">
                     مشاهده فایل
                   </Button>
                 </a>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="حذف فایل؟"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">آیا مطمئن هستید؟</h3>
            <p className="text-gray-500 mb-6">
              این فایل برای همیشه حذف خواهد شد و لینک آن دیگر کار نخواهد کرد.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setDeleteId(null)}
              >
                انصراف
              </Button>
              <Button 
                variant="danger" 
                className="flex-1"
                onClick={handleDelete}
              >
                بله، حذف کن
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

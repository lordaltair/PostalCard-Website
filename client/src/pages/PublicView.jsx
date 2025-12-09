import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Calendar, FileType, PlayCircle, Music, Mail, Gift } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { formatToJalali } from '../utils/date';
import Button from '../components/ui/Button';

export default function PublicView() {
  const { publicId } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const mediaRef = useRef(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
        const res = await axios.get(`${baseUrl}/public/${publicId}`);
        setFile(res.data);
      } catch (err) {
        setError('این کارت پستی منقضی شده یا حذف شده است.');
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [publicId]);

  const handleOpen = () => {
    setIsOpened(true);
    // Add a slight delay to allow the video/audio element to mount
    setTimeout(() => {
        if (mediaRef.current) {
            mediaRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
    }, 100);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
            <div className="text-6xl mb-6">💔</div>
            <p className="text-white text-xl font-medium mb-8">{error}</p>
        </div>
    </div>
  );

  const uploadBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '').replace(/\/$/, '');
  const fileUrl = `${uploadBaseUrl}/uploads/${file.filePath}`;

  return (
    <div className="min-h-screen bg-gold-50 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-gold-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-gold-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="z-10 w-full max-w-4xl p-4 md:p-8"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl shadow-gold-100 border border-white/40 ring-1 ring-gold-100/20">
              
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                {file.mimeType.startsWith('video/') ? (
                  <video 
                    ref={mediaRef}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    src={fileUrl}
                    poster="/video-placeholder.png"
                  >
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gold-50 to-white p-12 relative overflow-hidden">
                         {/* Audio Visualizer Effect Placeholder */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            {[1,2,3].map(i => (
                                <div key={i} className={`absolute border border-white rounded-full animate-ping`} style={{ width: `${i * 200}px`, height: `${i * 200}px`, animationDuration: `${i + 2}s` }} />
                            ))}
                         </div>
                         
                         <div className="z-10 bg-gold-50 p-8 rounded-full mb-8 backdrop-blur-sm border border-gold-200">
                            <Music className="w-16 h-16 text-gold-500" />
                         </div>
                        <audio ref={mediaRef} controls autoPlay className="w-full max-w-md z-10" src={fileUrl}>
                            مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                        </audio>
                    </div>
                )}
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                     <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{file.customName}</h1>
                        <div className="flex items-center text-gray-600 text-sm gap-4">
                            <span className="flex items-center bg-gold-100/50 px-3 py-1 rounded-full border border-gold-200/50">
                                <Calendar className="w-4 h-4 ml-2" />
                                {formatToJalali(file.createdAt)}
                            </span>
                            <span className="flex items-center bg-gold-100/50 px-3 py-1 rounded-full uppercase border border-gold-200/50">
                                <FileType className="w-4 h-4 ml-2" />
                                {file.mimeType.split('/')[1]}
                            </span>
                        </div>
                    </div>
                    
                    <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={fileUrl} 
                        download 
                        className="flex items-center justify-center px-8 py-4 rounded-2xl bg-gold-600 hover:bg-gold-500 text-white font-bold transition-all shadow-lg hover:shadow-gold-500/40"
                    >
                        <Download className="w-5 h-5 ml-2" />
                        دانلود فایل اصلی
                    </motion.a>
                </div>
                
                <div className="flex justify-center">
                    <p className="text-gray-400 text-sm flex items-center">
                        <span className="w-2 h-2 bg-gold-500 rounded-full ml-2 animate-pulse"></span>
                        قدرت گرفته از <img src="/logo.png" alt="Logo" className="h-10 w-auto mx-2 object-contain" />
                    </p>
                </div>
              </div>

            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}

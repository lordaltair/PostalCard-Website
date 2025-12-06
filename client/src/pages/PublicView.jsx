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
        const res = await axios.get(`http://localhost:5000/api/public/${publicId}`);
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

  const fileUrl = `http://localhost:5000/uploads/${file.filePath}`;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <AnimatePresence>
        {!isOpened ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            className="z-50 flex items-center justify-center p-8"
          >
            <div 
              onClick={handleOpen}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3rem] cursor-pointer hover:scale-105 hover:bg-white/15 transition-all duration-500 shadow-2xl group flex flex-col items-center justify-center font-sans"
            >
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative bg-indigo-600 w-full h-full rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <Mail className="w-16 h-16 text-white" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-4 font-sans">یک پیام جدید دارید!</h1>
                <p className="text-indigo-200 mb-8 font-sans">برای باز کردن کارت ضربه بزنید</p>
                <Button variant="primary" className="rounded-full px-8 font-sans">
                    مشاهده پیام
                </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="z-10 w-full max-w-4xl p-4 md:p-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
              
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                {file.mimeType.startsWith('video/') ? (
                  <video 
                    ref={mediaRef}
                    controls 
                    className="w-full h-full object-contain"
                    src={fileUrl}
                    poster="/video-placeholder.png"
                  >
                    مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                  </video>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-12 relative overflow-hidden">
                         {/* Audio Visualizer Effect Placeholder */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            {[1,2,3].map(i => (
                                <div key={i} className={`absolute border border-white rounded-full animate-ping`} style={{ width: `${i * 200}px`, height: `${i * 200}px`, animationDuration: `${i + 2}s` }} />
                            ))}
                         </div>
                         
                         <div className="z-10 bg-indigo-500/10 p-8 rounded-full mb-8 backdrop-blur-sm border border-indigo-500/20">
                            <Music className="w-16 h-16 text-indigo-400" />
                         </div>
                        <audio ref={mediaRef} controls className="w-full max-w-md z-10" src={fileUrl}>
                            مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                        </audio>
                    </div>
                )}
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    {/* Content hidden as per previous user edit preference, but structure remains */}
                </div>
                
                <div className="flex justify-center">
                    <p className="text-white/40 text-sm flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full ml-2 animate-pulse"></span>
                        قدرت گرفته از <span className="text-white ml-1 font-bold">  «پستال کارت»  </span>
                    </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

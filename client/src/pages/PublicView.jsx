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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="z-10 w-full max-w-4xl p-4 md:p-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-2xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
              
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                {file.mimeType.startsWith('video/') ? (
                  <>
                    <video 
                        ref={mediaRef}
                        className="w-full h-full object-contain"
                        src={fileUrl}
                        poster="/video-placeholder.png"
                        playsInline
                        onEnded={() => {
                            if (document.fullscreenElement) {
                                document.exitFullscreen().catch(err => console.log(err));
                            }
                        }}
                        onPlay={() => {
                            // Optional: Automatically enter fullscreen on play if desired by user logic,
                            // specific request was "when it is finished, unset the fullscreen", implying it might be set manually or auto.
                             if (mediaRef.current && mediaRef.current.requestFullscreen) {
                                mediaRef.current.requestFullscreen().catch(err => console.log(err));
                            }
                        }}
                    >
                        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                    </video>
                    {/* Fallback Play Button Overlay if not playing */}
                     <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
                        style={{ display: isOpened ? 'none' : 'flex' }}
                     >
                         {/* We use a separate state or check strictly if playing. 
                             Better: Use a button that ACTUALLY triggers play if autoplay failed.
                         */}
                     </div>
                     {/* 
                        Actually, let's implement the logic: 
                        1. Try autoPlay in useEffect.
                        2. If fails (paused), show Big Button.
                        3. Clicking button -> play() + requestFullscreen()
                     */}
                  </>
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
                        <audio ref={mediaRef} className="w-full max-w-md z-10" src={fileUrl}>
                            مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                        </audio>
                    </div>
                )}
                
                {/* Universal Play Button Overlay for both Video and Audio if not playing */}
                {!isOpened && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
                        <button 
                            onClick={() => {
                                if (mediaRef.current) {
                                    mediaRef.current.play()
                                        .then(() => {
                                            setIsOpened(true);
                                            // Only request fullscreen for video
                                            if (file.mimeType.startsWith('video/') && mediaRef.current.requestFullscreen) {
                                                mediaRef.current.requestFullscreen().catch(e => console.log(e));
                                            }
                                        })
                                        .catch(e => console.log("Play failed", e));
                                }
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-6 backdrop-blur-md border border-white/50 shadow-2xl transform hover:scale-110 transition-all duration-300 group"
                        >
                             <PlayCircle className="w-20 h-20 opacity-90 group-hover:opacity-100" />
                             <span className="sr-only">پخش</span>
                        </button>
                    </div>
                )}
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                     <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{file.customName}</h1>
                        <div className="flex items-center text-gray-400 text-sm gap-4">
                            <span className="flex items-center bg-white/5 px-3 py-1 rounded-full">
                                <Calendar className="w-4 h-4 ml-2" />
                                {formatToJalali(file.createdAt)}
                            </span>
                            <span className="flex items-center bg-white/5 px-3 py-1 rounded-full uppercase">
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
                        className="flex items-center justify-center px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/40"
                    >
                        <Download className="w-5 h-5 ml-2" />
                        دانلود فایل اصلی
                    </motion.a>
                </div>
                
                <div className="flex justify-center">
                    <p className="text-white/40 text-sm flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full ml-2 animate-pulse"></span>
                        قدرت گرفته از <span className="text-white ml-1 font-bold">  «شوروم هانه»  </span>
                    </p>
                </div>
              </div>

            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}

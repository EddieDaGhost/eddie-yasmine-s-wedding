import { useState, useRef, useCallback } from 'react';
import { useIsUnlocked } from '@/hooks/useAdminPreview';
import { LockedPage } from '@/components/shared/LockedPage';
import { AdminPreviewBanner } from '@/components/shared/AdminPreviewBanner';
import { Layout } from '@/components/layout/Layout';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Download, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FRAMES = [
  { id: 'none', label: 'No Frame', border: '' },
  { id: 'gold', label: 'Gold', border: 'ring-4 ring-gold' },
  { id: 'floral', label: 'Blush', border: 'ring-4 ring-blush' },
  { id: 'elegant', label: 'Elegant', border: 'ring-4 ring-primary shadow-elegant' },
];

const PhotoBooth = () => {
  const { toast } = useToast();
  const { isUnlocked, isAdminPreview } = useIsUnlocked();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (!isUnlocked) {
    return (
      <LockedPage
        title="Photo Booth"
        description="Take fun photos at the wedding — available on the day!"
      />
    );
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use the photo booth.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = useCallback(() => {
    setIsCountingDown(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCountingDown(false);

          // Actually capture
          if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const size = Math.min(video.videoWidth, video.videoHeight);
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Center-crop to square
              const sx = (video.videoWidth - size) / 2;
              const sy = (video.videoHeight - size) / 2;
              ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

              // Add watermark text
              ctx.fillStyle = 'rgba(255,255,255,0.7)';
              ctx.font = `${size * 0.03}px serif`;
              ctx.textAlign = 'center';
              ctx.fillText('Eddie & Yasmine • 2027', size / 2, size - size * 0.04);

              setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
            }
          }

          stopCamera();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stream]);

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `ey-wedding-photobooth-${Date.now()}.jpg`;
    link.click();

    toast({
      title: "Photo Saved!",
      description: "Your photo booth picture has been downloaded.",
    });
  };

  const currentFrame = FRAMES.find((f) => f.id === selectedFrame);

  return (
    <Layout>
      {isAdminPreview && <AdminPreviewBanner pageName="Photo Booth" />}

      <section className={`py-20 md:py-32 romantic-gradient ${isAdminPreview ? 'mt-12' : ''}`}>
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Photo Booth"
            subtitle="Strike a pose! Take a fun photo to remember the day."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Camera / Captured view */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 mb-6"
            >
              <div className={`relative aspect-square rounded-xl overflow-hidden bg-muted ${currentFrame?.border ?? ''}`}>
                {!stream && !capturedImage ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Camera className="w-16 h-16 text-primary/30" />
                    <Button variant="romantic" onClick={startCamera}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                  </div>
                ) : capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Photo booth capture"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    <AnimatePresence>
                      {isCountingDown && (
                        <motion.div
                          key={countdown}
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="text-8xl font-display text-white drop-shadow-lg">
                            {countdown}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>

            {/* Frame Selection */}
            {(stream || capturedImage) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center gap-3 mb-6"
              >
                {FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedFrame === frame.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {frame.label}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {stream && !capturedImage && (
                <Button
                  variant="romantic"
                  size="lg"
                  className="w-full"
                  onClick={capturePhoto}
                  disabled={isCountingDown}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isCountingDown ? `${countdown}...` : 'Take Photo'}
                </Button>
              )}
              {capturedImage && (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={retake}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    variant="romantic"
                    size="lg"
                    className="flex-1"
                    onClick={downloadPhoto}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save Photo
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PhotoBooth;

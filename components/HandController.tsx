
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { HandGesture } from '../types';
import { Hand, EyeOff, Loader2 } from 'lucide-react';
import { detectAdvancedGestures, handleVRAction, VRGesture } from '../modules/vrControl';

export const HandController: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const { setGesture, showWebcam, setGain, gain, setZoomDelta } = useStore();
  const lastVideoTime = useRef(-1);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  
  // Ref to track previous hand distance for zoom calculation
  const lastHandsDistRef = useRef<number>(0);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        startWebcam();
      } catch (err) {
        console.error("MediaPipe Init Error:", err);
        setLoading(false);
      }
    };

    initMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
        setLoading(false);
      } catch (err) {
        console.error("Webcam Error:", err);
        setLoading(false);
      }
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current || !handLandmarkerRef.current || !canvasRef.current) return;
    
    const now = performance.now();
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, now);
      
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
          // Draw Skeletons
          for (const landmarks of results.landmarks) {
            if (!landmarks || landmarks.length === 0) continue;
            drawConnectors(ctx, landmarks);
            
            // Advanced gestures (Pinch/Swipe) - per hand
            const advancedGesture = detectAdvancedGestures(landmarks);
            if (advancedGesture) {
                // handleVRAction(advancedGesture); // DISABLED IN DEMO MODE
                
                // Visual feedback only
                ctx.fillStyle = "orange";
                ctx.font = "bold 16px Arial";
                ctx.fillText(`${advancedGesture} (DEMO)`, 10, 50);
            }
          }

          // --- TWO HAND ZOOM LOGIC (DEMO VISUALIZATION) ---
          if (results.landmarks.length === 2) {
             const h1 = results.landmarks[0]?.[0]; // Wrist Hand 1
             const h2 = results.landmarks[1]?.[0]; // Wrist Hand 2
             
             if (h1 && h2) {
                 // Visual feedback for zoom
                 ctx.strokeStyle = "cyan";
                 ctx.beginPath();
                 ctx.moveTo(h1.x * ctx.canvas.width, h1.y * ctx.canvas.height);
                 ctx.lineTo(h2.x * ctx.canvas.width, h2.y * ctx.canvas.height);
                 ctx.stroke();
                 
                 ctx.fillStyle = "cyan";
                 ctx.fillText("ZOOM (DEMO)", (h1.x*ctx.canvas.width + h2.x*ctx.canvas.width)/2, (h1.y*ctx.canvas.height + h2.y*ctx.canvas.height)/2);
             }
             // setZoomDelta(0); // DISABLED

          } else {
              // Process Single Hand Gestures (Fist/Palm)
              // processGestures(results.landmarks); // DISABLED
          }
        } 
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const drawConnectors = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
     ctx.fillStyle = "#2563eb";
     ctx.strokeStyle = "#2563eb";
     ctx.lineWidth = 2;
     
     landmarks.forEach((point) => {
         if (point) {
            ctx.beginPath();
            ctx.arc(point.x * ctx.canvas.width, point.y * ctx.canvas.height, 3, 0, 2 * Math.PI);
            ctx.fill();
         }
     });
  };

  // Disabled in demo
  const processGestures = (landmarksArray: any[]) => {
     // No-op
  };

  if (!showWebcam) return null;

  return (
    <div className="absolute bottom-4 right-4 w-64 h-48 bg-white border-2 border-slate-300 rounded-lg overflow-hidden shadow-xl z-50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
           <Loader2 className="animate-spin w-8 h-8" />
        </div>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <canvas 
        ref={canvasRef}
        width={320}
        height={240}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-2 left-2 bg-white/80 px-2 py-1 rounded text-[10px] font-mono text-amber-600 flex items-center gap-1 border border-amber-100 font-bold">
        <Hand size={12} />
        AI VISION: DEMO (NO CONTROL)
      </div>
    </div>
  );
};

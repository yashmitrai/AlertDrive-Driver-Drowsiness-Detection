import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

interface FaceDetectionResult {
  eyeAspectRatio: number;
  mouthAspectRatio: number;
  eyesClosed: boolean;
  mouthOpen: boolean;
}

// Calculate Eye Aspect Ratio (EAR)
const calculateEAR = (landmarks: any) => {
  if (!landmarks || landmarks.length === 0) return 0;

  const keypoints = landmarks[0].keypoints;
  
  // Left eye indices (using MediaPipe Face Mesh indices)
  const leftEyeVertical1 = [159, 145]; // top and bottom
  const leftEyeVertical2 = [158, 153]; // top and bottom
  const leftEyeHorizontal = [33, 133]; // left and right corners

  // Right eye indices
  const rightEyeVertical1 = [386, 374];
  const rightEyeVertical2 = [385, 380];
  const rightEyeHorizontal = [362, 263];

  const distance = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Calculate EAR for left eye
  const leftV1 = distance(keypoints[leftEyeVertical1[0]], keypoints[leftEyeVertical1[1]]);
  const leftV2 = distance(keypoints[leftEyeVertical2[0]], keypoints[leftEyeVertical2[1]]);
  const leftH = distance(keypoints[leftEyeHorizontal[0]], keypoints[leftEyeHorizontal[1]]);
  const leftEAR = (leftV1 + leftV2) / (2.0 * leftH);

  // Calculate EAR for right eye
  const rightV1 = distance(keypoints[rightEyeVertical1[0]], keypoints[rightEyeVertical1[1]]);
  const rightV2 = distance(keypoints[rightEyeVertical2[0]], keypoints[rightEyeVertical2[1]]);
  const rightH = distance(keypoints[rightEyeHorizontal[0]], keypoints[rightEyeHorizontal[1]]);
  const rightEAR = (rightV1 + rightV2) / (2.0 * rightH);

  // Average EAR
  return (leftEAR + rightEAR) / 2.0;
};

// Calculate Mouth Aspect Ratio (MAR)
const calculateMAR = (landmarks: any) => {
  if (!landmarks || landmarks.length === 0) return 0;

  const keypoints = landmarks[0].keypoints;
  
  // Mouth indices
  const mouthTop = 13;
  const mouthBottom = 14;
  const mouthLeft = 78;
  const mouthRight = 308;

  const distance = (p1: any, p2: any) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const vertical = distance(keypoints[mouthTop], keypoints[mouthBottom]);
  const horizontal = distance(keypoints[mouthLeft], keypoints[mouthRight]);

  return vertical / horizontal;
};

export const useFaceDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  isActive: boolean
) => {
  const [detection, setDetection] = useState<FaceDetectionResult>({
    eyeAspectRatio: 0.3,
    mouthAspectRatio: 0.3,
    eyesClosed: false,
    mouthOpen: false,
  });
  const detectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let isLoaded = false;

    const loadModel = async () => {
      try {
        await tf.ready();
        
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
          runtime: "mediapipe",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
          refineLandmarks: true,
        };

        detectorRef.current = await faceLandmarksDetection.createDetector(
          model,
          detectorConfig
        );
        
        isLoaded = true;
        console.log("Face detection model loaded");
      } catch (error) {
        console.error("Error loading face detection model:", error);
      }
    };

    loadModel();

    return () => {
      isLoaded = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive || !detectorRef.current || !videoRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const detect = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        detectorRef.current
      ) {
        try {
          const predictions = await detectorRef.current.estimateFaces(
            videoRef.current,
            { flipHorizontal: false }
          );

          if (predictions && predictions.length > 0) {
            const ear = calculateEAR(predictions);
            const mar = calculateMAR(predictions);

            // EAR threshold: < 0.2 means eyes closed
            const eyesClosed = ear < 0.2;
            
            // MAR threshold: > 0.6 means mouth open (yawning)
            const mouthOpen = mar > 0.6;

            setDetection({
              eyeAspectRatio: ear,
              mouthAspectRatio: mar,
              eyesClosed,
              mouthOpen,
            });
          } else {
            // No face detected - keep previous state
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, videoRef]);

  return detection;
};


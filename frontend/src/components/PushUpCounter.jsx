import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";  

const PushUpCounter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [pushUpCount, setPushUpCount] = useState(0);
  const [feedback, setFeedback] = useState("Loading pose detection...");
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("up"); // "up" or "down"
  const [debugInfo, setDebugInfo] = useState({});
  const { state } = useLocation();  // Getting the location state passed from the Challenges screen
  const goal = state?.goal || "No goal set"; //
  useEffect(() => {
    const loadScripts = async () => {
      try {
        const script1 = document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
        document.body.appendChild(script1);

        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        document.body.appendChild(script2);

        script2.onload = () => {
          setFeedback("Click 'Start' to begin");
        };
      } catch (err) {
        setError("Failed to load pose detection. Please refresh the page.");
      }
    };

    loadScripts();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const calculateAngle = (shoulder, elbow, wrist) => {
    // Convert to screen coordinates
    const shoulderScreen = { x: shoulder.x * canvasRef.current.width, y: shoulder.y * canvasRef.current.height };
    const elbowScreen = { x: elbow.x * canvasRef.current.width, y: elbow.y * canvasRef.current.height };
    const wristScreen = { x: wrist.x * canvasRef.current.width, y: wrist.y * canvasRef.current.height };

    // Calculate vectors
    const vector1 = { x: elbowScreen.x - shoulderScreen.x, y: elbowScreen.y - shoulderScreen.y };
    const vector2 = { x: wristScreen.x - elbowScreen.x, y: wristScreen.y - elbowScreen.y };

    // Calculate dot product
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2);
    const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2);

    // Calculate angle in degrees
    const angle = Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI);

    return angle;
  };

  const isValidPose = (landmarks) => {
    if (!landmarks) return false;

    const requiredLandmarks = [
      landmarks[11], // Left shoulder
      landmarks[12], // Right shoulder
      landmarks[13], // Left elbow
      landmarks[14], // Right elbow
      landmarks[15], // Left wrist
      landmarks[16], // Right wrist
    ];

    return requiredLandmarks.every(landmark => landmark && landmark.visibility > 0.65);
  };

  const startPoseDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        pose.onResults((results) => {
          if (!results.poseLandmarks) return;

          const ctx = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;

          // Draw the video frame
          ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

          const landmarks = results.poseLandmarks;

          if (!isValidPose(landmarks)) {
            setFeedback("Please ensure your full body is visible");
            return;
          }

          // Calculate angles
          const leftElbowAngle = calculateAngle(
            landmarks[11], // Left shoulder
            landmarks[13], // Left elbow
            landmarks[15]  // Left wrist
          );

          const rightElbowAngle = calculateAngle(
            landmarks[12], // Right shoulder
            landmarks[14], // Right elbow
            landmarks[16]  // Right wrist
          );

          const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

          // Update debug info
          setDebugInfo({
            leftElbowAngle: Math.round(leftElbowAngle),
            rightElbowAngle: Math.round(rightElbowAngle),
            avgElbowAngle: Math.round(avgElbowAngle),
            stage
          });

          // Draw visualization
          ctx.fillStyle = 'red';
          [11, 12, 13, 14, 15, 16].forEach(index => {
            const point = landmarks[index];
            ctx.beginPath();
            ctx.arc(
              point.x * canvasRef.current.width,
              point.y * canvasRef.current.height,
              5, 0, 2 * Math.PI
            );
            ctx.fill();
          });

          // Draw connecting lines
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;

          // Draw arms
          ctx.beginPath();
          ctx.moveTo(landmarks[11].x * canvasRef.current.width, landmarks[11].y * canvasRef.current.height);
          ctx.lineTo(landmarks[13].x * canvasRef.current.width, landmarks[13].y * canvasRef.current.height);
          ctx.lineTo(landmarks[15].x * canvasRef.current.width, landmarks[15].y * canvasRef.current.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(landmarks[12].x * canvasRef.current.width, landmarks[12].y * canvasRef.current.height);
          ctx.lineTo(landmarks[14].x * canvasRef.current.width, landmarks[14].y * canvasRef.current.height);
          ctx.lineTo(landmarks[16].x * canvasRef.current.width, landmarks[16].y * canvasRef.current.height);
          ctx.stroke();

          // Draw angles
          ctx.font = '16px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(`Left Elbow: ${Math.round(leftElbowAngle)}°`, 10, 20);
          ctx.fillText(`Right Elbow: ${Math.round(rightElbowAngle)}°`, 10, 40);
          ctx.fillText(`Avg Elbow: ${Math.round(avgElbowAngle)}°`, 10, 60);
          ctx.fillText(`Stage: ${stage}`, 10, 80);

          // Improved push-up detection logic
          if (stage === "up" && avgElbowAngle > 160) {
            setStage("down");
            setFeedback("Good! Now push down");
          } else if (stage === "down" && avgElbowAngle < 90) {
            setPushUpCount(prev => prev + 1);
            setStage("up");
            setFeedback("Great push-up! Go for another one");
          }
        });

        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            await pose.send({ image: videoRef.current });
          },
          width: 640,
          height: 480
        });

        camera.start();
        setIsStarted(true);
        setError("");
        setFeedback("Position yourself to start counting push-ups");
      }
    } catch (err) {
      setError("Failed to access camera. Please ensure you have granted camera permissions.");
      console.error("Error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStarted(false);
      setFeedback("Click 'Start' to begin");
    }
  };

  const resetCounter = () => {
    setPushUpCount(0);
    setFeedback("Counter reset. Ready to count push-ups.");
    setStage("up");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Push-Up Counter</h1>
      <div className="flex items-center gap-6 mb-4">
  <p className="text-2xl">Count: {pushUpCount}</p>
  {goal && <p className="text-2xl">Goal: {goal}</p>}
</div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={isStarted ? stopCamera : startPoseDetection}
          className={`px-4 py-2 rounded-lg ${
            isStarted 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isStarted ? "Stop" : "Start"}
        </button>
        
        <button
          onClick={resetCounter}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Reset Counter
        </button>
      </div>

      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      <p className="text-lg mb-4">{feedback}</p>

      <div className="relative w-[640px] h-[480px] border border-gray-300 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>Instructions:</p>
        <ul className="list-disc pl-5">
          <li>Stand 4-6 feet back from the camera</li>
          <li>Ensure your full body is visible</li>
          <li>Keep your body straight during push-ups</li>
          <li>Watch the elbow angle indicators for feedback</li>
        </ul>
      </div>
    </div>
  );
};

export default PushUpCounter;
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";  

const CrunchCounter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [crunchCount, setCrunchCount] = useState(0);
  const [feedback, setFeedback] = useState("Loading pose detection...");
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("down"); // "up" or "down"
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

  const calculateAngle = (pointA, pointB, pointC) => {
    const vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
    const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };

    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
    const magnitudeAB = Math.sqrt(vectorAB.x ** 2 + vectorAB.y ** 2);
    const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);

    const angle = Math.acos(dotProduct / (magnitudeAB * magnitudeBC)) * (180 / Math.PI);
    return angle;
  };

  const isValidPose = (landmarks) => {
    if (!landmarks) return false;

    const requiredLandmarks = [
      landmarks[11], // Left shoulder
      landmarks[12], // Right shoulder
      landmarks[23], // Left hip
      landmarks[24], // Right hip
      landmarks[27], // Left knee
      landmarks[28], // Right knee
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
            setFeedback("Please ensure your upper body is visible");
            return;
          }

          // Calculate angles for crunch detection
          const shoulderLeft = landmarks[11]; // Left shoulder
          const shoulderRight = landmarks[12]; // Right shoulder
          const hipLeft = landmarks[23]; // Left hip
          const hipRight = landmarks[24]; // Right hip
          const kneeLeft = landmarks[27]; // Left knee
          const kneeRight = landmarks[28]; // Right knee

          // Calculate angle between shoulder, hip, and knee
          const leftCrunchAngle = calculateAngle(shoulderLeft, hipLeft, kneeLeft);
          const rightCrunchAngle = calculateAngle(shoulderRight, hipRight, kneeRight);
          const avgCrunchAngle = (leftCrunchAngle + rightCrunchAngle) / 2;

          // Update debug info
          setDebugInfo({
            leftCrunchAngle: Math.round(leftCrunchAngle),
            rightCrunchAngle: Math.round(rightCrunchAngle),
            avgCrunchAngle: Math.round(avgCrunchAngle),
            stage
          });

          // Draw visualization
          ctx.fillStyle = 'red';
          [11, 12, 23, 24, 27, 28].forEach(index => {
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

          // Draw shoulders to hips
          ctx.beginPath();
          ctx.moveTo(shoulderLeft.x * canvasRef.current.width, shoulderLeft.y * canvasRef.current.height);
          ctx.lineTo(hipLeft.x * canvasRef.current.width, hipLeft.y * canvasRef.current.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(shoulderRight.x * canvasRef.current.width, shoulderRight.y * canvasRef.current.height);
          ctx.lineTo(hipRight.x * canvasRef.current.width, hipRight.y * canvasRef.current.height);
          ctx.stroke();

          // Draw angles
          ctx.font = '16px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(`Left Crunch Angle: ${Math.round(leftCrunchAngle)}°`, 10, 20);
          ctx.fillText(`Right Crunch Angle: ${Math.round(rightCrunchAngle)}°`, 10, 40);
          ctx.fillText(`Avg Crunch Angle: ${Math.round(avgCrunchAngle)}°`, 10, 60);
          ctx.fillText(`Stage: ${stage}`, 10, 80);

          // Improved crunch detection logic
          if (stage === "down" && avgCrunchAngle < 45) {
            setStage("up");
            setFeedback("Good! Now lower back down");
          } else if (stage === "up" && avgCrunchAngle > 100) {
            setCrunchCount(prev => prev + 1);
            setStage("down");
            setFeedback("Great crunch! Go for another one");
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
        setFeedback("Position yourself to start counting crunches");
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
    setCrunchCount(0);
    setFeedback("Counter reset. Ready to count crunches.");
    setStage("down");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Crunch Counter</h1>
      <div className="flex items-center gap-6 mb-4">
  <p className="text-2xl">Count: {crunchCount}</p>
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
          <li>Lie down with your knees bent and feet flat on the ground.</li>
          <li>Ensure your upper body is visible to the camera.</li>
          <li>Focus on lifting your shoulder blades off the ground.</li>
          <li>Watch the angle indicators for feedback.</li>
        </ul>
      </div>
    </div>
  );
};

export default CrunchCounter;
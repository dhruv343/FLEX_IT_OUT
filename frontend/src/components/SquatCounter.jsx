import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";  

const SquatCounter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [squatCount, setSquatCount] = useState(0);
  const [feedback, setFeedback] = useState("Loading pose detection...");
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("stand"); // "stand" or "squat"
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

  const calculateAngle = (hip, knee, ankle) => {
    try {
      // Convert to screen coordinates
      const hipScreen = {
        x: hip.x * canvasRef.current.width,
        y: hip.y * canvasRef.current.height
      };
      const kneeScreen = {
        x: knee.x * canvasRef.current.width,
        y: knee.y * canvasRef.current.height
      };
      const ankleScreen = {
        x: ankle.x * canvasRef.current.width,
        y: ankle.y * canvasRef.current.height
      };

      // Calculate vectors
      const vector1 = {
        x: hipScreen.x - kneeScreen.x,
        y: hipScreen.y - kneeScreen.y
      };
      const vector2 = {
        x: ankleScreen.x - kneeScreen.x,
        y: ankleScreen.y - kneeScreen.y
      };

      // Calculate dot product
      const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
      
      // Calculate magnitudes
      const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
      const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

      // Calculate angle in degrees
      const angle = Math.acos(dotProduct / (magnitude1 * magnitude2)) * (180 / Math.PI);

      return angle;
    } catch (error) {
      console.error("Angle calculation error:", error);
      return 180; // Default angle if calculation fails
    }
  };

  const isValidPose = (landmarks) => {
    if (!landmarks) return false;

    const requiredLandmarks = [
      landmarks[23], // Left hip
      landmarks[24], // Right hip
      landmarks[25], // Left knee
      landmarks[26], // Right knee
      landmarks[27], // Left ankle
      landmarks[28], // Right ankle
    ];

    return requiredLandmarks.every(landmark => 
      landmark && landmark.visibility > 0.65
    );
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
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
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

          // Calculate angles for both legs
          const leftKneeAngle = calculateAngle(
            landmarks[23], // Left hip
            landmarks[25], // Left knee
            landmarks[27]  // Left ankle
          );

          const rightKneeAngle = calculateAngle(
            landmarks[24], // Right hip
            landmarks[26], // Right knee
            landmarks[28]  // Right ankle
          );

          const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

          // Update debug info
          setDebugInfo({
            leftKneeAngle: Math.round(leftKneeAngle),
            rightKneeAngle: Math.round(rightKneeAngle),
            avgKneeAngle: Math.round(avgKneeAngle),
            stage
          });

          // Draw visualization
          ctx.fillStyle = 'red';
          [23, 24, 25, 26, 27, 28].forEach(index => {
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

          // Draw left leg
          ctx.beginPath();
          ctx.moveTo(landmarks[23].x * canvasRef.current.width, landmarks[23].y * canvasRef.current.height);
          ctx.lineTo(landmarks[25].x * canvasRef.current.width, landmarks[25].y * canvasRef.current.height);
          ctx.lineTo(landmarks[27].x * canvasRef.current.width, landmarks[27].y * canvasRef.current.height);
          ctx.stroke();

          // Draw right leg
          ctx.beginPath();
          ctx.moveTo(landmarks[24].x * canvasRef.current.width, landmarks[24].y * canvasRef.current.height);
          ctx.lineTo(landmarks[26].x * canvasRef.current.width, landmarks[26].y * canvasRef.current.height);
          ctx.lineTo(landmarks[28].x * canvasRef.current.width, landmarks[28].y * canvasRef.current.height);
          ctx.stroke();

          // Draw angles
          ctx.font = '16px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(`Left Knee: ${Math.round(leftKneeAngle)}°`, 10, 20);
          ctx.fillText(`Right Knee: ${Math.round(rightKneeAngle)}°`, 10, 40);
          ctx.fillText(`Avg Knee: ${Math.round(avgKneeAngle)}°`, 10, 40);
          ctx.fillText(`Stage: ${stage}`, 10, 80);

          // Improved squat detection logic
          if (stage === "stand" && avgKneeAngle < 120) {
            
            setSquatCount(prev => prev + 1);
            setStage("squat");
            setFeedback("Good! Now stand up");
          } else if (stage === "squat" && avgKneeAngle > 160) {
            setStage("stand");
            setSquatCount(prev => prev + 1);
            setFeedback("Great squat! Go for another one");
          }
          else{

            setStage("squat");
            
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
        setFeedback("Stand in frame to begin");
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
    setSquatCount(0);
    setFeedback("Counter reset. Ready to count squats.");
    setStage("stand");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Squat Counter</h1>
      <div className="flex items-center gap-6 mb-4">
  <p className="text-2xl">Count: {squatCount}</p>
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
          <li>Keep your back straight during squats</li>
          <li>Watch the knee angle indicators for feedback</li>
        </ul>
      </div>
    </div>
  );
};

export default SquatCounter;
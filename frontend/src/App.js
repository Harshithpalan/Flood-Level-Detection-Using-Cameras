import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [floodLevel, setFloodLevel] = useState(0);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [threshold, setThreshold] = useState(50);

  useEffect(() => {
    // Listen for flood level updates from server
    socket.on('floodLevel', (data) => {
      setFloodLevel(data.level);
      setIsAlertActive(data.alert);
    });

    return () => {
      socket.off('floodLevel');
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        processVideoFrame();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const processVideoFrame = () => {
    if (!isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simple flood detection algorithm based on color analysis
      // This is a basic implementation - in production, you'd use more sophisticated CV
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Analyze bottom portion of the frame for water-like colors
      const bottomRegion = Math.floor(canvas.height * 0.3);
      let waterPixels = 0;
      let totalPixels = 0;

      for (let y = canvas.height - bottomRegion; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Detect water-like colors (blue/dark colors)
          if (b > r + 30 && b > g + 30) {
            waterPixels++;
          }
          totalPixels++;
        }
      }

      const detectedLevel = Math.round((waterPixels / totalPixels) * 100);
      
      // Send detected level to server
      if (detectedLevel !== floodLevel) {
        fetch('http://localhost:5000/api/flood-level', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: detectedLevel })
        });
      }

      // Draw flood level indicator on canvas
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(0, canvas.height - (canvas.height * detectedLevel / 100), canvas.width, 5);
    }

    requestAnimationFrame(processVideoFrame);
  };

  const handleThresholdChange = (e) => {
    setThreshold(parseInt(e.target.value));
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Flood Level Detection System</h1>
        
        <div className="main-content">
          <div className="video-section">
            <div className="video-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ display: isCameraActive ? 'block' : 'none' }}
              />
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }}
              />
              {!isCameraActive && (
                <div className="placeholder">
                  <p>Camera is inactive</p>
                </div>
              )}
            </div>
            
            <div className="controls">
              {!isCameraActive ? (
                <button onClick={startCamera} className="btn btn-primary">
                  Start Camera
                </button>
              ) : (
                <button onClick={stopCamera} className="btn btn-danger">
                  Stop Camera
                </button>
              )}
            </div>
          </div>

          <div className="stats-section">
            <div className={`stat-card ${isAlertActive ? 'alert' : ''}`}>
              <h3>Flood Level</h3>
              <div className="level-display">
                <span className="level-value">{floodLevel}</span>
                <span className="level-unit">%</span>
              </div>
              <div className="level-bar">
                <div 
                  className="level-fill" 
                  style={{ 
                    width: `${floodLevel}%`,
                    backgroundColor: isAlertActive ? '#ff4444' : '#4CAF50'
                  }}
                ></div>
              </div>
            </div>

            <div className="stat-card">
              <h3>Alert Status</h3>
              <div className={`alert-status ${isAlertActive ? 'active' : 'inactive'}`}>
                {isAlertActive ? '⚠️ ALERT ACTIVE' : '✓ Normal'}
              </div>
            </div>

            <div className="stat-card">
              <h3>Threshold Setting</h3>
              <div className="threshold-control">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={threshold}
                  onChange={handleThresholdChange}
                />
                <span>{threshold}%</span>
              </div>
            </div>

            <div className="stat-card">
              <h3>System Status</h3>
              <div className="system-status">
                <div className="status-item">
                  <span className="status-label">Camera:</span>
                  <span className={`status-value ${isCameraActive ? 'online' : 'offline'}`}>
                    {isCameraActive ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Server:</span>
                  <span className="status-value online">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAlertActive && (
          <div className="alert-banner">
            ⚠️ FLOOD ALERT: Water level has exceeded the threshold!
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

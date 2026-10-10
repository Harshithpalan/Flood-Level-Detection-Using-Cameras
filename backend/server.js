const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store flood level data
let floodLevel = 0;
let isAlertActive = false;
const FLOOD_THRESHOLD = 50; // Threshold percentage for flood alert

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send current state to new client
  socket.emit('floodLevel', { level: floodLevel, alert: isAlertActive });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API endpoint to receive flood level data from frontend
app.post('/api/flood-level', (req, res) => {
  const { level } = req.body;
  floodLevel = level;
  
  // Check if alert should be triggered
  const wasAlertActive = isAlertActive;
  isAlertActive = level >= FLOOD_THRESHOLD;
  
  // Broadcast to all connected clients
  io.emit('floodLevel', { level: floodLevel, alert: isAlertActive });
  
  // Log alert state change
  if (wasAlertActive !== isAlertActive) {
    console.log(`Alert state changed: ${isAlertActive ? 'ACTIVE' : 'INACTIVE'} (Level: ${level}%)`);
  }
  
  res.json({ success: true, level, alert: isAlertActive });
});

// API endpoint to get current flood level
app.get('/api/flood-level', (req, res) => {
  res.json({ level: floodLevel, alert: isAlertActive });
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Endpoint to upload images for analysis
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    success: true, 
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

# Flood Level Detection Using Cameras

A real-time web application for detecting flood levels using camera feeds with computer vision analysis.

## Features

- **Real-time Camera Feed**: Access and display live webcam feed
- **Flood Level Detection**: Analyzes video frames to detect water levels using color-based computer vision
- **Real-time Monitoring**: WebSocket-based real-time updates of flood levels
- **Alert System**: Automatic alerts when flood levels exceed configurable threshold
- **Dashboard**: Visual display of current flood level, alert status, and system health
- **Configurable Threshold**: Adjustable flood alert threshold (0-100%)

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.io
- **Image Processing**: Canvas API for frame analysis

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A webcam connected to your computer

### Setup

1. Clone the repository or navigate to the project directory

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

### Start the Frontend Application

In a new terminal:

```bash
cd frontend
npm start
```

The React application will open in your browser at `http://localhost:3000`

## Usage

1. Open the application in your browser
2. Click "Start Camera" to activate your webcam
3. The system will begin analyzing the video feed for water detection
4. Monitor the flood level percentage in real-time
5. Adjust the threshold slider to set the alert level
6. When water levels exceed the threshold, an alert will be triggered

## How It Works

The flood detection system uses a color-based analysis algorithm:

1. **Frame Capture**: Captures video frames from the webcam
2. **Region Analysis**: Analyzes the bottom 30% of the frame (where water would typically appear)
3. **Color Detection**: Identifies water-like colors (blue/dark pixels)
4. **Level Calculation**: Calculates the percentage of water pixels in the analysis region
5. **Alert Trigger**: Compares detected level against threshold and triggers alerts if exceeded

## API Endpoints

- `POST /api/flood-level` - Send flood level data to server
- `GET /api/flood-level` - Get current flood level and alert status
- `POST /api/upload` - Upload images for analysis

## WebSocket Events

- `floodLevel` - Real-time flood level updates
  - Data: `{ level: number, alert: boolean }`

## Configuration

You can adjust the following parameters in `backend/server.js`:

- `FLOOD_THRESHOLD`: Default flood alert threshold (default: 50)
- `PORT`: Server port (default: 5000)

## Future Enhancements

- [ ] Add machine learning model for more accurate water detection
- [ ] Support for IP cameras (RTSP streams)
- [ ] Historical data logging and visualization
- [ ] Email/SMS notifications for alerts
- [ ] Multiple camera support
- [ ] Mobile app version
- [ ] Integration with weather APIs

## Security Notes

- This application runs locally and does not transmit video data externally
- Camera access requires user permission
- Ensure proper security measures if deploying to production

## Troubleshooting

**Camera not starting:**
- Ensure camera permissions are granted in your browser
- Check if another application is using the camera
- Verify your webcam is properly connected

**Backend connection issues:**
- Ensure the backend server is running on port 5000
- Check for firewall or antivirus blocking the connection
- Verify both frontend and backend are running

**No flood detection:**
- The current algorithm uses simple color detection
- Works best with clear water (blue/dark colors)
- Lighting conditions can affect detection accuracy

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

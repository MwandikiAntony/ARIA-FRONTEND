# ARIA - Adaptive Real-time Intelligence Agent

One unified AI platform combining real-time navigation assistance for the visually impaired with live human performance coaching.

![ARIA Platform](https://via.placeholder.com/1200x600/020609/00e5ff?text=ARIA+Platform)

## Features

### Navigation Mode
- 🧭 Outdoor & indoor guidance for visually impaired users
- 🗺️ Real-time GPS routing with turn-by-turn directions
- 🚗 Object detection (vehicles, pedestrians, obstacles)
- 🚦 Traffic light and crosswalk detection
- 🆘 Emergency SOS with GPS dispatch and SMS alerts

### Coach Mode
- 🎯 Real-time communication coaching
- 👁️ Eye contact, posture, and gesture tracking
- 🗣️ Filler word detection and pace analysis
- 💡 Whisper-style hints at the perfect moment
- 📊 Post-session analytics and insights

## Tech Stack

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- WebRTC for media capture
- WebSocket for real-time communication
- Firebase Auth for authentication

### Backend
- Python FastAPI
- WebSocket native protocol
- Gemini Live API integration
- TFLite for on-device object detection
- Cloud Run for deployment

### Infrastructure
- Google Cloud Platform
- Firebase Firestore
- Terraform for IaC
- Cloud Build CI/CD

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Cloud Platform account
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aria-frontend.git
cd aria-frontend
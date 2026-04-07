# Virtual Cosmos 🚀

**Virtual Cosmos** is a real-time, proximity-based chat application. It features a stunning 2D space environment where users can move around as "nodes" in a digital universe. When two users get close to each other, a private, encrypted communication channel is automatically established.

---

## ✨ Features

- **Proximity-Based Connectivity**: Seamlessly connect with others by simply moving closer to them in the virtual space.
- **Real-Time Movement**: Smooth 2D navigation using Pixi.js for high-performance rendering.
- **Dynamic HUD**: A futuristic Head-Up Display (HUD) showing real-time coordinates, system status, and encryption levels.
- **Automatic Room Management**: Socket.io handles private room creation and cleanup based on user proximity.
- **Cyberpunk Aesthetics**: Glitch text effects, pulsing radar indicators, and a deep-space grid system.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Rendering**: Pixi.js 8
- **Communication**: Socket.io-client
- **Language**: TypeScript

### Backend
- **Server**: Node.js / Express 5
- **Real-Time**: Socket.io
- **Language**: TypeScript (using `ts-node-dev` for development)

---

## 📁 Project Structure

```text
.
├── cosmos-frontend/      # React + Vite + Pixi.js frontend
│   ├── src/
│   │   ├── components/   # UI & Game components (Pixi/React)
│   │   ├── assets/       # Static assets
│   │   └── socket.ts     # Socket.io client configuration
│   └── public/           # Public assets
├── server/               # Node.js + Express + Socket.io backend
│   └── src/
│       └── index.ts      # Server logic & Proximity engine
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to get the project running locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### 1. Clone the repository
```bash
git clone git@github.com:sarthak03dot/Virtual-Cosmos-Real-Time-Proximity-Chat-App.git
cd Virtual-Cosmos-Real-Time-Proximity-Chat-App
```

### 2. Setup the Backend
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:3000`.

### 3. Setup the Frontend
```bash
cd ../cosmos-frontend
npm install
npm run dev
```
The frontend will start on your local dev port (usually `5173`). Open the URL in multiple browser tabs to test the proximity chat.

---

## 🎮 Usage

- **Movement**: Use `W`, `A`, `S`, `D` keys to navigate the cosmos.
- **Connecting**: Move your node within the radar range of another user. Once connected, a chat box will appear.
- **Chatting**: Type your message in the chat box and press enter to communicate with the nearby user.
- **Disconnecting**: Move away from the user to automatically close the chat room.

---

## 🔒 Security

- **Proximity Logic**: Connections are validated server-side based on Euclidean distance.
- **HUD Indicator**: Visual confirmation of AES-256 encryption status (simulated/active).

---

## 📜 License

This project is licensed under the ISC License.

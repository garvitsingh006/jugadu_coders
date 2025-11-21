# VibeCircle - AI-Powered Social Platform

A full-stack MERN application that enables users to discover, join, or create communities using AI-powered matching, with real-time ephemeral activity pods.

## Features

- 🤖 **AI-Powered Community Search**: Semantic search using OpenAI embeddings
- 🌍 **Local & Global Modes**: Find communities nearby or worldwide
- 💬 **Real-Time Pods**: Ephemeral activity rooms with Socket.io
- 🗺️ **Geolocation**: IP-based and GPS location tracking
- 🎨 **Modern UI**: Built with React and Tailwind CSS
- 🔒 **Secure**: JWT authentication, input validation, rate limiting

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Socket.io Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT Authentication
- OpenAI API
- Bcrypt

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vibecircle
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000
```

## Project Structure

```
vibecircle/
├── backend/
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic (AI, geo, cron)
│   ├── middleware/      # Auth, rate limiting
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── api/         # API client
│   │   ├── hooks/       # Custom hooks
│   │   └── App.jsx      # Main app
│   └── index.html
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Communities
- `POST /api/community/search` - Search communities with AI
- `POST /api/community/create` - Create new community
- `GET /api/community/:id` - Get community details
- `GET /api/community/nearby` - Get nearby communities
- `GET /api/community/trending` - Get trending communities
- `POST /api/community/:id/join` - Join community

### Pods
- `POST /api/pod/create` - Create new pod
- `POST /api/pod/:id/join` - Join pod
- `GET /api/pod/active` - Get active pods
- `GET /api/pod/:id` - Get pod details

### Geolocation
- `GET /api/geo/ip` - Get location from IP

## Socket.io Events

- `join-pod` - Join a pod room
- `leave-pod` - Leave a pod room
- `pod-message` - Send/receive messages
- `user-joined` - User joined notification
- `user-left` - User left notification

## AI Features

### Community Matching
The AI search uses a multi-step process:
1. Keyword matching
2. Fuzzy search (Fuse.js)
3. Semantic matching (OpenAI embeddings)
4. Context scoring (activity, proximity, popularity)

**Score Formula:**
```
score = 0.6 * keyword + 0.25 * fuzzy + 0.45 * semantic + 0.1 * activity + 0.05 * proximity
```

**Threshold:** If score ≥ 0.6, join existing community; otherwise, AI suggests creating new community

### Auto-Generation
When no match is found, AI generates:
- Community name
- Relevant tags
- Description
- Optional icebreakers

## Security Features

- JWT token-based authentication
- HttpOnly cookies
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting on community creation
- Sanitized user inputs

## Cron Jobs

- **Every 5 minutes:** Expire inactive pods
- **Every hour:** Recompute trending community scores

## Development

### Run Backend
```bash
cd backend
npm run dev
```

### Run Frontend
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build

# Backend (set NODE_ENV=production in .env)
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

## Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using MERN Stack + AI

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();


app.use(
  cors({
    origin: "https://flex-it-out-ten.vercel.app", 
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

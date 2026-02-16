import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './src/router/auth.router';

const app = express();
const PORT = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
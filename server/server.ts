import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './src/router/authRouter';

const app = express();
const PORT = 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send('Артем Качан делал бэк в соло!');
});

app.use('/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
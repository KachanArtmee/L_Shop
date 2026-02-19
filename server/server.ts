import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './src/router/auth.router';
import productRouter from './src/router/product.router';
import cartRouter from './src/router/cart.router';
import deliveryRouter from './src/router/delivery.router';

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/delivery', deliveryRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
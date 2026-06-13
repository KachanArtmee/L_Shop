import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRouter from './router/auth.router';
import productRouter from './router/product.router';
import cartRouter from './router/cart.router';
import deliveryRouter from './router/delivery.router';
import { authMiddleware } from './middleware/auth.middleware';
import { openApiDocument } from './docs/openapi';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'TechFlow API is running',
        docs: '/api-docs',
    });
});

app.get('/openapi.json', (req, res) => {
    res.status(200).json(openApiDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/cart', authMiddleware, cartRouter);
app.use('/delivery', authMiddleware, deliveryRouter);

export default app;

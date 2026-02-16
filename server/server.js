"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const authRouter_1 = __importDefault(require("./src/router/authRouter"));
const productRouter_1 = __importDefault(require("./src/router/productRouter"));
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.get('/', (req, res) => {
    res.send('Артем Качан делал бэк в соло!');
});
app.use('/auth', authRouter_1.default);
app.use('/products', productRouter_1.default);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

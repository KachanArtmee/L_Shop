import { AuthController } from '../controllers/auth.controller';
import {Router} from "express";

const authRouter = Router();


authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);

authRouter.get('/getUser', AuthController.getUser);

export default authRouter;
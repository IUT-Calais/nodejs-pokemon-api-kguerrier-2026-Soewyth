import { Router } from 'express';
import { verifyJWT } from '../common/jwt.middleware';


// Import controller functions
import { createUser, 
    // loginUser 
} from './user.controller';

// Create router
export const userRouter = Router();


// Define routes 
userRouter.post('/', createUser);
// userRouter.post('/login', loginUser);
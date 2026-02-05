import { Router } from 'express';
import { verifyJWT } from '../common/jwt.middleware';


// Import controller functions
import { createUser, 
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from './user.controller';

// Create router
export const userRouter = Router();


// Define routes 
// create user
userRouter.post('/', createUser);
// login user
userRouter.post('/login', loginUser);
// getUsers, getUserById, updateUser, deleteUser routes
userRouter.get('/', verifyJWT, getUsers);
userRouter.get('/:id', verifyJWT, getUserById);
userRouter.patch('/:id', verifyJWT, updateUser);
userRouter.delete('/:id', verifyJWT, deleteUser);
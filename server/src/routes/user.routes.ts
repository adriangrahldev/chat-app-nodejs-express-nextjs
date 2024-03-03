// routes/userRoutes.ts

import express from 'express';
import { createUser, getUsers, loginUser, logoutUser } from '../controllers/user.controller';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;
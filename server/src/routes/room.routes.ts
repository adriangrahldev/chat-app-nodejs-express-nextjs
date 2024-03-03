// routes/roomRoutes.ts

import express from 'express';
import { createRoom, getRoom, getRooms, getUsersInRoom } from '../controllers/room.controller';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:id', getRoom);
router.get('/:roomId/users', getUsersInRoom);

export default router;
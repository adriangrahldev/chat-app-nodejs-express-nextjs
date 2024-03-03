// routes/roomRoutes.ts

import express from 'express';
import { createRoom, getRoom, getRooms } from '../controllers/room.controller';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:id', getRoom);

export default router;
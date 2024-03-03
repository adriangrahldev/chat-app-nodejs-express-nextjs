// routes/roomRoutes.ts

import express from 'express';
import { createMessage, getMessages } from '../controllers/message.controller';

const router = express.Router();

router.post('/', createMessage);
router.get('/:roomId', getMessages);

export default router;
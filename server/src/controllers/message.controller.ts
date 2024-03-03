import { Request, Response } from 'express';
import Room from '../models/room.model';

export const createMessage = async (req: Request, res: Response) => {
    const { roomId, user, message } = req.body;

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    // Create the message
    const newMessage = { user, message };
    room.messages.push(newMessage);
    await room.save();

    res.status(201).json(newMessage);
};

export const getMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room.messages);
};

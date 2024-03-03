// controllers/roomController.ts
import { Request, Response } from 'express';
import Room from '../models/room.model';

export const createRoom = async (req: Request, res: Response) => {
    const room = new Room(req.body);
    await room.save();
    if (!room) {
        return res.status(500).json({ message: 'Error creating room'});
    }
    res.status(201).json({room: room, message: 'Room created'});
}

export const getRooms = async (req: Request, res: Response) => {
    const rooms = await Room.find({});
    res.json({rooms: rooms, message: 'Rooms found'});
}

export const getRoom = async (req: Request, res: Response) => {
    const room = await Room.findOne({ _id: req.params.id });
    if (!room) {
        return res.status(404).json({ message: 'Room not found'});
    }
    res.json({room: room, message: 'Room found'});
}
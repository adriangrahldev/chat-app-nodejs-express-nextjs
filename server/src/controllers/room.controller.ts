// controllers/roomController.ts
import { Request, Response } from 'express';
import Room from '../models/room.model';
import { getUsers } from './user.controller';

export const createRoom = async (req: Request, res: Response) => {
    if (!req.body.name) {
        return res.status(400).json({ message: 'Name is required'});
    }
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
export const getUsersInRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  // Find the room and populate the users
  const room = await Room.findById(roomId).populate('users');
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  res.json(room.users);
};
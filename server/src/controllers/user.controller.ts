// controllers/userController.ts

import { Request, Response } from "express";
import User from '../models/user.model';
import Room from '../models/room.model';


export const getUsers = async (req: Request, res: Response) => {
    const users = await User.find({});
    res.json(users);
}

export const createUser = async (req: Request, res: Response) => {
    const user = new User(req.body);
    await user.save();
    if (!user) {
        return res.status(500).json({ message: 'Error creating user' });
    }
    res.status(201).json(user);
};

export const loginUser = async (req: Request, res: Response) => {
    let user = await User.findOne({ username: req.body.username });

    if (!user) {
        // Create new user if user not found
        user = new User(req.body);
        await user.save();
    } else {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (user.lastActivity < oneDayAgo) {
            // Recreate user if they have been inactive for more than a day
            await User.deleteOne({ username: req.body.username });
            user = new User(req.body);
            await user.save();
        } else {
            // Update lastActivity date
            user.lastActivity = new Date(); // Convert Date.now() to a Date object
            await user.save();
        }
    }

    // Join the user to the room if not already added
    if (req.body.roomId) {
        const room = await Room.findById(req.body.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        if (!room.users.includes(user._id)) {
            room.users.push(user._id);
            await room.save();
        }
    }

    res.json(user);
};

export const logoutUser = (req: Request, res: Response) => {
    
    res.json({ message: 'User logged out', user: req.body.username});
};
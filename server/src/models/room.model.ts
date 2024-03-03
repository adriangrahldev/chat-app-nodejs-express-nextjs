import mongoose from 'mongoose';
import { MessageSchema } from './message.model';

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [MessageSchema]

});

const Room = mongoose.model('Room', RoomSchema);

export default Room;
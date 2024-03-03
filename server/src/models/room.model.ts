import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Room = mongoose.model('Room', RoomSchema);

export default Room;
"use client"
import { useSession } from "@/hooks/session";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface Room {
    _id: string;
    name: string;
}

const JoinPage = () => {
    const [username, setUsername] = useState("");
    const [rooms, setRooms] = useState([] as Room[]);
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [selectedRoomName, setSelectedRoomName] = useState("");

    const router = useRouter();

    const [session, setSession] = useSession();

    const handleJoin = async (e:FormEvent) => {
        e.preventDefault();
        if (!username || !/^[a-zA-Z0-9]+$/.test(username)) {
            return;
        }
        if (!selectedRoomId) {
            return;
        }
        const response = await axios.post("http://localhost:8000/api/users/login", {
            username,
            roomId: selectedRoomId,
        });
        const user = response.data;
        if (!user) {
            return;
        }
        setSession({username, roomId: selectedRoomId, roomName: selectedRoomName});
        router.push("/");

    };

    const getActiveRooms = async () => {
        // Obtener salas activas
        const response = await axios.get("http://localhost:8000/api/rooms");
        setRooms(response.data.rooms || []);
    };

    const handleRoomChange = (roomId: string, roomName: string) => {
        setSelectedRoomId(roomId);
        setSelectedRoomName(roomName);
    };

    useEffect(() => {
        getActiveRooms();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Join Chat</h1>
            <form className="flex flex-col items-center" onSubmit={handleJoin}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4"
                    pattern="^[a-zA-Z0-9]+$"
                    title="Please enter a valid username without special characters or spaces."
                    required
                />
                <select
                    value={selectedRoomId}
                    onChange={(e) =>
                        handleRoomChange(e.target.value, e.target.selectedOptions[0].text)
                    }
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4"
                    required
                >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                            {room.name}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleJoin}
                    className="bg-blue-500 text-white rounded-md px-4 py-2"
                >
                    Join
                </button>
            </form>
        </div>
    );
};

export default JoinPage;
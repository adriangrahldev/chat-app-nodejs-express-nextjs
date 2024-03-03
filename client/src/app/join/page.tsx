"use client"
import { useSession } from "@/hooks/session";
import { useEffect, useState } from "react";

interface Room {
    id: string;
    name: string;
}

const JoinPage = () => {
    const [username, setUsername] = useState("");
    const [rooms, setRooms] = useState([] as Room[]);
    const [room, setRoom] = useState({} as Room);

    const [session, set] = useSession();

    const handleJoin = () => {
        // Unirse a la sala
    };

    const getActiveRooms = () => {
        // Obtener las salas activas
    };

    useEffect(() => {
        getActiveRooms();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Join Chat</h1>
            <form className="flex flex-col items-center">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4"
                />
                <select
                    value={room.name}
                    onChange={(e) =>
                        setRoom({ id: "", name: e.target.value })
                    }
                    className="border border-gray-300 rounded-md px-4 py-2 mb-4"
                >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.name}>
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
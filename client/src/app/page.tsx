"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/session";

interface User {
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  created_at: number;
}

interface Room {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
}

export default function Home(props: { session: any }) {
  const [session, setSession] = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");


  const room: Room = {
    id: "1",
    name: "Chat Room",
    users: [
      { id: "1", username: "User 1" },
      { id: "2", username: "User 2" },
      { id: "3", username: "User 3" },
    ],
    messages: [
      {
        id: "1",
        content: "Hello!",
        sender: { id: "2", username: "User 2" },
        created_at: Date.now(),
      },
      {
        id: "2",
        content: "Hi there!",
        sender: { id: "1", username: "User 1" },
        created_at: Date.now(),
      },
    ],
  };

  const handleSendMessage = (e: any) => {
    console.log("message", message);
    setMessage("");
    
  }

  useEffect(() => {
    if (!session.username) {
      router.push("/join");
    }
  }, [session, router]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="grid grid-cols-2">
        <div className="border-[1px] border-black min-h-96 min-w-96">
          <div className="flex justify-between items-center border-[1px] border-black h-12 p-2">
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Leave
            </button>
          </div>
          <div className="border-[1px] border-black min-h-80 min-w-96">
            <div className="h-80 overflow-y-auto p-2 bg-slate-200 space-y-2">
              {room.messages.map((message) => (
                <div
                  key={message.id}
                  className="flex flex-col bg-white p-1 rounded-e-md rounded-bl-md shadow-sm"
                >
                  <p className="text-xs font-bold text-blue-600 flex justify-between">
                  <span>{message.sender.username}</span>
                  <span>{new Date(message.created_at).toUTCString()}</span>
                  </p>
                  <hr />
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-[1px] border-black h-12">
              <input type="text" className="w-3/4 h-full" value={message} onChange={(e) => setMessage(e.target.value)} />
              <button onClick={(e)=> handleSendMessage(e)} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Send
              </button>
            </div>
          </div>
        </div>
        <div className="border-[1px] border-black min-h-96 w-52">
          <div className="flex justify-between items-center  h-12 p-2">
            <h1 className="text-2xl font-bold">Users</h1>
          </div>
          <div className="h-80 overflow-y-auto p-2 space-y-2 ">
            {room.users.map((user) => (
              <div key={user.id} className="flex border-b-2 justify-between items-center">
                <p>{user.username}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

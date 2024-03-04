"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/session";
import axios from "axios";
import io from 'socket.io-client';

interface User {
  _id: string;
  username: string;
}

interface Message {
  _id: string;
  user: User;
  message: string;
  timestamp: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

 const handleSendMessage = async (e: any) => {
  const response = await axios.post(`http://localhost:8000/api/messages`, {
    roomId: session.roomId,
    message,
    username: session.username,
  });
  const newMessage =  response.data;
  setMessages([...messages, newMessage]);
  console.log(newMessage);
  
  // Emit 'new message' event with the new message
  socket.emit('new message', newMessage);

  setMessage("");
};
  const handleExit = async () => {
    const response = await axios.post(`http://localhost:8000/api/users/logout`, {
      username: session.username,
      roomId: session.roomId,
    });
    setSession({username: '', roomId: '', roomName: ''});
    router.push("/join");
  }

  
useEffect(() => {
  // Connect to the socket
  const socketIo = io('http://localhost:8000');
  setSocket(socketIo);


    // Listen for 'new message' events
    socketIo.on('new message', (newMessage) => {
      setMessages((messages) => [...messages, newMessage]);
    });
  

  return () => {
    // Disconnect from the socket when the component unmounts
    socketIo.disconnect();
  };
}, []);

useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await axios.get(
        `http://localhost:8000/api/rooms/${session.roomId}/users`
      );
      const data = await response.data;
      setUsers(data);
    };
    const getMessages = async () => {
      const response = await axios.get(
        `http://localhost:8000/api/messages/${session.roomId}`
      );
      const data = await response.data;
      setMessages(data);
    };
    if (!session.username) {
      router.push("/join");
    }

    getMessages();
    getUsers();
  }, [session, router]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex ">
        <div className="border-[1px] border-black min-h-96 min-w-96">
          <div className="flex justify-between items-center border-[1px] border-black h-12 p-2">
            <h1 className="text-2xl font-bold">{session.roomName}</h1>
            <button className="bg-blue-500 text-white  px-4 py-1 rounded-md" onClick={()=>handleExit()}>
              Leave
            </button>
          </div>
          <div className="border-[1px] border-black min-h-80 min-w-96">
            <div className="h-80 overflow-y-auto p-2 bg-slate-200 space-y-2">
              {messages.map((message,index) => (
                <div
                  key={message._id}
                  ref={index === messages.length - 1 ? messagesEndRef : null}

                  className={`flex flex-col bg-white p-1  shadow-md ${session.username === message.user.username ? 'rounded-s-lg rounded-br-lg' : 'rounded-e-lg rounded-bl-lg bg-gray-100'} `}
                >
                  <p className="text-xs font-bold flex justify-between">
                    <span className="text-blue-600">{message.user.username} {session.username === message.user.username ? '(You)' : '' }</span>
                    <span>{message.timestamp}</span>
                  </p>
                  <hr />
                  <p className="text-gray-800">{message.message}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-[1px] border-black h-12">
              <input
                type="text"
                className="w-3/4 h-full"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={(e) => handleSendMessage(e)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
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
            {users.map((user) => (
              <div
                key={user._id}
                className="flex border-b-2 justify-between items-center"
              >
                <p>{user.username} 
                {session.username === user.username ? ' (You)' : '' }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Importaciones necesarias
"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/session";
import axios from "axios";
import io from "socket.io-client";
import { Message } from "../interfaces/Message";
import { User } from "../interfaces/User";

// Componente principal
export default function Home(props: { session: any }) {
  // Definición de los estados
  const [session, setSession] = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función para enviar mensajes
  const handleSendMessage = async (e: any) => {
    const response = await axios.post(`http://localhost:8000/api/messages`, {
      roomId: session.roomId,
      message,
      username: session.username,
    });
    const newMessage = response.data;
    setMessages([...messages, newMessage]);
    console.log(newMessage);

    // Emitir evento 'new message' con el nuevo mensaje
    socket.emit("new message", newMessage);

    setMessage("");
  };

  // Función para salir de la sala
  const handleExit = async () => {
    const response = await axios.post(
      `http://localhost:8000/api/users/logout`,
      {
        username: session.username,
        roomId: session.roomId,
      }
    );
    const data = response.data;
    socket.emit("user left", session.username);
    router.push("/join");
  };

  // Conexión con el socket
  useEffect(() => {
    const socketIo = io("http://localhost:8000");
    setSocket(socketIo);

    // Escuchar eventos 'new message'
    socketIo.on("new message", (newMessage) => {
      setMessages((messages) => [...messages, newMessage]);
    });

    socketIo.on("user joined", (user) => {
      setUsers((users) => [...users, user]);
    });

    socketIo.on("user left", (username) => {
      setUsers((users) => users.filter((user) => user.username !== username));
    });

    // Desconectar del socket cuando el componente se desmonte
    return () => {
      socketIo.disconnect();
    };
  }, []);

  // Desplazamiento automático al final de la lista de mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Obtención de los usuarios y los mensajes al cargar el componente
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
            <button
              className="bg-blue-500 text-white  px-4 py-1 rounded-md"
              onClick={() => handleExit()}
            >
              Leave
            </button>
          </div>
          <div className="border-[1px] border-black min-h-80 min-w-96">
            <div className="h-80 overflow-y-auto p-2 bg-slate-200 space-y-2">
              {messages.map((message, index) => (
                <div
                  key={message._id}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                  className={`flex flex-col bg-white p-1  shadow-md ${
                    session.username === message.user.username
                      ? "rounded-s-lg rounded-br-lg"
                      : "rounded-e-lg rounded-bl-lg bg-gray-100"
                  } `}
                >
                  <p className="text-xs  flex justify-between">
                    <span className="text-blue-600 font-bold">
                      {message.user.username}{" "}
                      {session.username === message.user.username
                        ? "(You)"
                        : ""}
                    </span>
                    <span className="text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </p>
                  <hr />
                  <p className="text-gray-800 font-light">{message.message}</p>
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
                <p>
                  {user.username}
                  {session.username === user.username ? " (You)" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

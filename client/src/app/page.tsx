"use client";
// Importaciones necesarias
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/session";
import axios from "axios";
import io from "socket.io-client";
import { Message } from "../interfaces/Message";
import { User } from "../interfaces/User";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});



// Componente principal
const Home = (props: { session: any }) => {
  // Definición de los estados
  const [session, setSession] = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [audio, setAudio] = useState<any>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función para enviar mensajes

  const handleSendMessage = useCallback(
    async (e: any) => {
      try {
        const response = await api.post("/messages", {
          roomId: session.roomId,
          message,
          username: session.username,
        });
        const newMessage = response.data;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        socket.emit("new message", newMessage);
        setMessage("");
      } catch (error) {
        console.error(error);
      }
    },
    [message, session, socket]
  );

  // Función para salir de la sala

  const handleExit = useCallback(async () => {
    try {
      await api.post("/users/logout", {
        username: session.username,
        roomId: session.roomId,
      });
      socket.emit("user left", session.username);
      router.push("/join");
    } catch (error) {
      console.error(error);
    }
  }, [session, socket, router]);

  // Conexión con el socket
  useEffect(() => {
    
    const audio = new Audio("./sounds/alert.mp3");
    setAudio(audio);
    audio.play();
    const socketIo = io("http://localhost:8000");
    setSocket(socketIo);

    // Escuchar eventos 'new message'
    socketIo.on("new message", (newMessage) => {
      setMessages((messages) => [...messages, newMessage]);
    });

    socketIo.on("user joined", (user) => {
      setUsers((users) => [...users, user]);
      audio.play();
    });

    socketIo.on("user left", (username) => {
      setUsers([...users.filter((user) => user.username !== username)]);
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
    if (session) {
      setIsAuthenticated(session.isAuthenticated);
    }

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
    if (!session?.isAuthenticated) {
      router.push("/join");
    }

    getMessages();
    getUsers();
  }, [session, router]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-300">
      {isAuthenticated ? (
        <div className="flex shadow-lg rounded-md">
          <div className="border border-gray-300 rounded-md rounded-bl-md w-96">
            <div className="flex justify-between items-center rounded-tl-md shadow-md bg-gray-100 p-4 ">
              <h1 className="text-2xl font-bold text-sky-800">
                # {session.roomName}
              </h1>
              <button
                className="bg-sky-800 font-semibold text-white px-4 py-1 rounded-md"
                onClick={() => handleExit()}
              >
                Salir
              </button>
            </div>
            <div className="border-t border-gray-300 bg-teal-300 p-4 h-80 overflow-y-auto ">
              {messages.map((message, index) => (
                <div
                  key={message._id}
                  ref={index === messages.length - 1 ? messagesEndRef : null}
                  className={`flex flex-col mb-4 ${
                    session.username === message.user.username
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div
                    className={`bg-white p-4 rounded-lg shadow-md ${
                      session.username === message.user.username
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-xs mb-2 space-x-3">
                      <span className="font-bold">
                        {message.user.username}{" "}
                        {session.username === message.user.username
                          ? "(Tú)"
                          : ""}
                      </span>
                      <span className="text-gray-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-gray-800">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="p-4 rounded-t-lg rounded-bl-md flex bg-sky-800 items-center">
              <input
                type="text"
                className="flex-grow rounded-s-md py-2 px-4 focus:outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  e.key === "Enter" && handleSendMessage(e);
                }}
                placeholder="Escribe un mensaje..."
              />
              <button
                onClick={(e) => handleSendMessage(e)}
                className="text-slate-100 border-y border-e border-white bg-sky-800 font-bold px-4 py-2 rounded-e-md"
              >
                Enviar
              </button>
            </div>
          </div>
          <div className="bg-slate-100  w-52 rounded-lg">
            <div className="bg-sky-800 p-4 rounded-tr-md">
              <h1 className="text-2xl font-bold text-white">Users</h1>
            </div>
            <div className="p-4 ">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center mb-2 border-b-2 border-slate-300"
                >
                  <p>
                    {user.username}
                    {session.username === user.username ? " (Tú)" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Home;

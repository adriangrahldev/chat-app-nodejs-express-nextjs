"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/session";
import axios from "axios";
import io from "socket.io-client";
import { Message } from "../interfaces/Message";
import { User } from "../interfaces/User";
import Image from "next/image";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

const Home = (props: { session: any }) => {
  const [session, setSession] = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [audio, setAudio] = useState<any>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const audio = new Audio("./sounds/alert.mp3");
    setAudio(audio);
    const socketIo = io("http://localhost:8000");
    setSocket(socketIo);

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

    return () => {
      socketIo.disconnect();
    };
  }, [users]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
    <div className="w-screen h-screen bg-slate-100 flex flex-col items-center justify-center">
      <div id="chat-title" className="w-3/6">
        <h1 className="text-lg font-bold"># {session.roomName}</h1>
      </div>
      <div
        id="chat-panel"
        className="bg-white w-3/6 h-96 flex shadow-lg rounded-md"
      >
        <div id="users" className="bg-blue-600 w-3/12 relative rounded-s-md">
          <div
            id="user-stitle"
            className="w-full flex items-center py-2 px-4 border-b-2 border-blue-400"
          >
            <div className="flex flex-row justify-between text-white items-center w-full">
              <span className=" text-xl">Users </span>
              <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center text-blue-600 font-bold bg-white">
                {users.length}
              </span>
            </div>
          </div>
          <ul id="users-content">
            {users.map((user) => (
              <li
                key={user._id}
                className="flex items-center py-2 px-4 border-b border-blue-400"
              >
                <p className="text-white text-sm">
                  {user.username}{" "}
                  {user.username === session.username && (
                    <span className="text-xs text-gray-300">(Tú)</span>
                  )}{" "}
                </p>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleExit()}
            className="w-full py-2 px-4 bg-slate-900 text-white font-semibold absolute bottom-0 rounded-bl-lg"
          >
            Salir
          </button>
        </div>
        <div className="w-full  flex flex-col">

          <div
            id="messages-panel"
            className="border-t border-gray-300 bg-gray-200 p-4  overflow-y-auto relative rounded-e-lg "
            style={{
              backgroundImage: "url('/img/bg.png')",
              opacity: 1,
              backgroundBlendMode: "multiply",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={message._id}
                ref={index === messages.length - 1 ? messagesEndRef : null}
                className={`flex flex-col mb-4 ${
                  session.username === message.user?.username
                    ? "items-end"
                    : "items-start"
                }`}
              >
                <div
                  className={`bg-white p-4 rounded-lg shadow-md ${
                    session.username === message.user?.username
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-xs mb-2 space-x-3">
                    <span className="font-bold">
                      {message.user?.username}{" "}
                      {session.username === message.user?.username ? "(Tú)" : ""}
                    </span>
                    <span className="text-gray-500">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-gray-800">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
            <div id="message-input" className="w-full flex bg-white items-center rounded-br-lg">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(e);
                  }
                }}
                placeholder="Escriba un mensaje..."
                className="w-full bg-gray-100 p-2"
              />
              <button
                onClick={handleSendMessage}
                className="w-32 bg-blue-600 text-white p-2 rounded-br-lg"
              >
                Enviar
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

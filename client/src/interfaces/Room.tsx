// Importaciones necesarias
"use client";
import { Message } from "./Message";
import { User } from "./User";

export interface Room {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
}

"use client"
import React, { createContext, useContext, useState, useEffect } from "react";

interface Session {
  username: string;
  roomId: string;
  roomName: string;
  isAuthenticated: boolean; // Nuevo campo para indicar si está autenticado
}

const SessionContext = createContext<
  [Session, (session: Session) => void] | undefined
>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(() => {
    // Obtener la sesión inicial de localStorage
    if (typeof window !== "undefined") {
      const savedSession = localStorage.getItem("session");
      return savedSession
        ? JSON.parse(savedSession)
        : {
            username: "",
            roomId: "",
            roomName: "",
            isAuthenticated: false, // Valor inicial para autenticación
          };
    }
  });

  // Actualizar localStorage cada vez que cambie la sesión
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("session", JSON.stringify(session));
    }
  }, [session]);

  return (
    <SessionContext.Provider value={[session, setSession]}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession debe ser utilizado dentro de un SessionProvider");
  }
  return context;
};
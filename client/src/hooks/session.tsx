"use client"
import React, { createContext, useContext, useState, useEffect } from "react";

interface Session {
  username: string;
  roomId: string;
  roomName: string;
}

const SessionContext = createContext<
  [Session, (session: Session) => void] | undefined
>(undefined);

export const SessionProvider  = ({ children }: {children: React.ReactNode}) => {
  const [session, setSession] = useState<Session>(() => {
    // Get the initial session from localStorage
    const savedSession = localStorage.getItem('session');
    return savedSession ? JSON.parse(savedSession) : {
      username: "",
      roomId: "",
      roomName: "",
    };
  });

  // Update localStorage whenever the session changes
  useEffect(() => {
    localStorage.setItem('session', JSON.stringify(session));
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
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
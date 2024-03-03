"use client"
import React, { createContext, useContext, useState } from "react";

interface Session {
  username: string;
  roomId: string;
  roomName: string;
}

const SessionContext = createContext<
  [Session, (session: Session) => void] | undefined
>(undefined);

export const SessionProvider  = ({ children }: {children: React.ReactNode}) => {
  const [session, setSession] = useState<Session>({
    username: "",
    roomId: "",
    roomName: "",
  });

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

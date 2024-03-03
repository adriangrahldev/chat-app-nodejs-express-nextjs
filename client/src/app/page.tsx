"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/session';

export default function Home(props: { session: any }) {
  const [session, setSession] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session.username) {
      router.push('/join');
    }
  }, [session, router]);

  return (
    <>
    {session.username}
    </>
  );
}
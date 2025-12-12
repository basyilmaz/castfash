"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "../lib/storage";

export function AuthGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = authStorage.token();
    if (!token) {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="p-6 text-center text-slate-200">
        Checking session...
      </div>
    );
  }

  return children;
}

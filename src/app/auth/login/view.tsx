"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { useCookie } from "react-use";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ADMIN_PASSWORD_HEADER_KEY } from "@/constants";
const View = () => {
  const router = useRouter();
  const [passwordCookie, setPasswordCookie] = useCookie(
    ADMIN_PASSWORD_HEADER_KEY
  );

  const submit = async () => {
    //fetch /api/check-password
    const requestHeaders: HeadersInit = new Headers();
    if (!passwordCookie) {
      alert("Password is required");
      return;
    }
    requestHeaders.set(ADMIN_PASSWORD_HEADER_KEY, passwordCookie);
    const res = await fetch("/api/check-password", {
      headers: requestHeaders,
    });
    if (res.status !== 200) {
      alert("Incorrect password");
      return;
    }
    //Redirect to /admin
    router.push("/admin");
  };
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-semibold text-center">Login</h1>
        <form className="mt-4">
          <Input
            onChange={(e) => setPasswordCookie(e.target.value)}
            type="password"
            placeholder="password"
            className="mb-4"
          />
          <Button
            onClick={submit}
            className="w-full bg-primary text-white rounded-md py-2"
          >
            Login
          </Button>
        </form>
      </div>
    </main>
  );
};

export default View;

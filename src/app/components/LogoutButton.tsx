"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
   
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    router.push("/auth/login");
  };

  return (
    <button onClick={handleLogout} className="btn btn-outline-danger">
      Logout
    </button>
  );
}

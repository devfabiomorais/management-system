"use client"
import { useEffect } from "react";

const useAuthCheck = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("@Portal:token");
      if (!token) {
        window.location.href = "/";
      }
    }
  }, []);
};

export default useAuthCheck;
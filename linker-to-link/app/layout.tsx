"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export default function ToastProvider({ children }: { children?: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
          },
          success: {
            style: {
              background: "green",
              color: "white",
            },
          },
          error: {
            style: {
              background: "red",
              color: "white",
            },
          },
        }}
      />
    </>
  );
}

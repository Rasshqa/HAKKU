"use client";

import React, { Suspense } from "react";
import SignInPage from "../masuk/page";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignInPage />
    </Suspense>
  );
}

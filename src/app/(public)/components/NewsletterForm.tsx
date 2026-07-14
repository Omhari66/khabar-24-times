"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    // Simulate a brief delay then show success
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 800);
  }

  if (status === "success") {
    return (
      <div className="bg-primary/20 border border-primary/40 px-4 py-4 text-sm font-sans text-white">
        <p className="font-bold mb-1">🎉 You&apos;re subscribed!</p>
        <p className="text-secondary-light text-xs">
          Thank you! We&apos;ll be in touch with the top headlines soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <input
        type="email"
        id="newsletter-email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder="Your email address"
        required
        aria-label="Email address for newsletter"
        className={`bg-secondary-dark text-white px-4 py-2.5 border focus:outline-none text-sm placeholder:text-secondary-light/50 transition-colors ${
          status === "error" ? "border-red-400" : "border-secondary-dark focus:border-white"
        }`}
      />
      {status === "error" && (
        <p className="text-red-400 text-xs -mt-1">Please enter a valid email address.</p>
      )}
      <button
        id="newsletter-subscribe-btn"
        type="submit"
        disabled={status === "loading"}
        className="bg-primary text-white font-condensed font-bold uppercase tracking-widest py-2.5 hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </button>
    </form>
  );
}

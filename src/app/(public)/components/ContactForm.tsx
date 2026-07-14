"use client";

import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL: FormState = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus("error");
      return;
    }
    setStatus("loading");

    // Build a mailto link and open it — works without a backend
    const subject = encodeURIComponent(form.subject || "Contact from website");
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:editor@khabar24times.in?subject=${subject}&body=${body}`;

    // After triggering mailto, show success UI
    setTimeout(() => {
      setStatus("success");
      setForm(INITIAL);
    }, 500);
  }

  if (status === "success") {
    return (
      <div className="bg-primary/10 border border-primary/30 p-6 text-center">
        <p className="text-2xl mb-2">✅</p>
        <h3 className="font-serif font-bold text-text-primary text-lg mb-2">
          Message Sent!
        </h3>
        <p className="text-text-secondary font-sans text-sm">
          Your email client has opened with your message pre-filled. Simply hit Send
          in your email app. We&apos;ll get back to you at{" "}
          <strong className="text-text-primary">{form.email || "your email"}</strong> within
          24–48 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-primary text-sm underline font-sans"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="block text-xs font-condensed font-bold uppercase tracking-wider text-text-secondary mb-1"
        >
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className={`w-full border bg-white px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary transition-colors ${
            status === "error" && !form.name ? "border-red-400" : "border-structural"
          }`}
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-xs font-condensed font-bold uppercase tracking-wider text-text-secondary mb-1"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={`w-full border bg-white px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary transition-colors ${
            status === "error" && !form.email ? "border-red-400" : "border-structural"
          }`}
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-xs font-condensed font-bold uppercase tracking-wider text-text-secondary mb-1"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder="News Tip / Correction / Feedback / Other"
          className="w-full border border-structural bg-white px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-condensed font-bold uppercase tracking-wider text-text-secondary mb-1"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Write your message here..."
          className={`w-full border bg-white px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-primary transition-colors resize-none ${
            status === "error" && !form.message ? "border-red-400" : "border-structural"
          }`}
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm font-sans">
          Please fill in all required fields marked with *.
        </p>
      )}

      <button
        id="contact-submit"
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary text-white font-condensed font-bold uppercase tracking-widest py-3 hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Opening email...
          </>
        ) : (
          "Send Message"
        )}
      </button>

      <p className="text-xs text-text-secondary font-sans text-center">
        This will open your email app with the message pre-filled addressed to{" "}
        <strong>editor@khabar24times.in</strong>
      </p>
    </form>
  );
}

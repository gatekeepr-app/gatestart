"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Email sent successfully!");
      } else {
        setMessage("❌ Failed to send email.");
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-2 w-80 mx-auto">
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded p-2"
      />
      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded p-2"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded p-2"
      >
        {loading ? "Sending..." : "Subscribe"}
      </button>
      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}

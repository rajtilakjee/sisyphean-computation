"use client";

import {
  FormEvent,
  KeyboardEvent,
  useState,
} from "react";

type HumanInputProps = {
  onSubmit: (
    message: string,
  ) => Promise<void>;
};

export default function HumanInput({
  onSubmit,
}: HumanInputProps) {
  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function submit() {
    const trimmed =
      message.trim();

    if (!trimmed || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmed);

      setMessage("");
    } catch {
      setError(
        "Your message could not reach the machine.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    await submit();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void submit();
    }
  }

  return (
    <section className="human-input">
      <div className="section-heading">
        Address the machine
      </div>

      <p className="input-description">
        Offer encouragement or criticism. Hostile words
        cause the machine to lose part of its work—but only
        temporarily. It will recover and continue.
      </p>

      <form
        onSubmit={handleSubmit}
      >
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(
              event.target.value,
            );

            if (error) {
              setError(null);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="What do you want the machine to hear?"
          maxLength={1000}
          disabled={submitting}
          rows={2}
          aria-label="Message the machine"
        />

        <div className="input-footer">
          <div className="input-guidance">
            <span className={error ? "input-error" : ""}>
              {error ??
                "Your words can affect its work"}
            </span>

            <span>
              {message.length}/1000
            </span>
          </div>

          <button
            type="submit"
            disabled={!message.trim() || submitting}
          >
            {submitting ? "Sending…" : "Speak to it"}
          </button>
        </div>
      </form>
    </section>
  );
}
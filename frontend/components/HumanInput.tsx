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
        "INTERVENTION FAILED",
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
        HUMAN INTERVENTION
      </div>

      <p className="input-description">
        Address the machine.
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
          placeholder="Enter a message..."
          maxLength={1000}
          disabled={submitting}
          rows={2}
          aria-label="Message the machine"
        />

        <div className="input-footer">
          <span>
            {error ??
              "ENTER TO SUBMIT / SHIFT+ENTER FOR NEWLINE"}
          </span>

          <span>
            {message.length}/1000
          </span>
        </div>
      </form>
    </section>
  );
}
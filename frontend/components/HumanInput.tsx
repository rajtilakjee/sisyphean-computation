"use client";

import {
  FormEvent,
  useState,
} from "react";

type HumanInputProps = {
  onSubmit: (message: string) => Promise<void>;
};

export default function HumanInput({
  onSubmit,
}: HumanInputProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmed = message.trim();

    if (!trimmed || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(trimmed);
      setMessage("");
    } finally {
      setSubmitting(false);
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

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Enter a message..."
          maxLength={1000}
          rows={3}
          disabled={submitting}
        />

        <div className="input-footer">
          <span>
            {message.length} / 1000
          </span>

          <button
            type="submit"
            disabled={
              submitting ||
              !message.trim()
            }
          >
            {submitting
              ? "PROCESSING..."
              : "SUBMIT"}
          </button>
        </div>
      </form>
    </section>
  );
}
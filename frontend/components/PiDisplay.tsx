"use client";

type PiDisplayProps = {
  pi: string;
  erased: boolean;
};

export default function PiDisplay({
  pi,
  erased,
}: PiDisplayProps) {
  const [integer, decimals = ""] =
    pi.split(".");

  return (
    <section className="pi-section">
      <div className="pi-label">
        CURRENT COMPUTATION
      </div>

      <div
        className={`pi-display ${
          erased ? "pi-erased" : ""
        }`}
      >
        <span className="pi-integer">
          {integer}
        </span>

        <span className="pi-dot">.</span>

        <span className="pi-decimals">
          {decimals || " "}
        </span>
      </div>
    </section>
  );
}
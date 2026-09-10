"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PiDisplayProps = {
  pi: string;
  erased?: boolean;
  eraseCount?: number;
  eraseSequence?: number;
  onErasureComplete?: () => void;
  onDisplayedCountChange?: (
    count: number,
  ) => void;
};

const MAX_FONT_SIZE = 42;
const MIN_FONT_SIZE = 16;

const DIGIT_DISPLAY_INTERVAL = 750;
const ERASE_INTERVAL = 900;

export default function PiDisplay({
  pi,
  erased = false,
  eraseCount = 0,
  eraseSequence = 0,
  onErasureComplete,
  onDisplayedCountChange,
}: PiDisplayProps) {
  const [displayedPi, setDisplayedPi] =
    useState(pi);

  const [erasing, setErasing] =
    useState(false);

  const [eraseTotal, setEraseTotal] =
    useState(0);

  const [eraseProgress, setEraseProgress] =
    useState(0);

  const displayRef =
    useRef<HTMLDivElement | null>(null);

  const eraseTimerRef =
    useRef<number | null>(null);

  const displayedPiRef =
    useRef(displayedPi);

  const latestPiRef =
    useRef(pi);

  const erasingRef =
    useRef(erasing);

  const onErasureCompleteRef =
    useRef(onErasureComplete);

  useEffect(() => {
    displayedPiRef.current =
      displayedPi;
  }, [displayedPi]);

  useEffect(() => {
    latestPiRef.current = pi;
  }, [pi]);

  useEffect(() => {
    erasingRef.current = erasing;
  }, [erasing]);

  useEffect(() => {
    onErasureCompleteRef.current =
      onErasureComplete;
  }, [onErasureComplete]);

  /*
   * Run each erasure as one uninterrupted phase.
   * New backend digits can continue arriving, but they
   * remain queued until the requested digits are gone.
   */
  useEffect(() => {
    if (
      eraseSequence === 0 ||
      eraseCount <= 0
    ) {
      return;
    }

    if (
      eraseTimerRef.current !== null
    ) {
      window.clearInterval(
        eraseTimerRef.current,
      );
    }

    const removableDigits =
      Math.max(
        0,
        displayedPiRef.current.length -
          2,
      );

    const digitsToErase =
      Math.min(
        eraseCount,
        removableDigits,
      );

    if (digitsToErase === 0) {
      onErasureCompleteRef.current?.();
      return;
    }

    erasingRef.current = true;
    setErasing(true);
    setEraseTotal(digitsToErase);
    setEraseProgress(0);

    let progress = 0;

    eraseTimerRef.current =
      window.setInterval(() => {
        progress += 1;

        setDisplayedPi(
          (current) =>
            current.length > 2
              ? current.slice(0, -1)
              : current,
        );

        setEraseProgress(progress);

        if (
          progress >= digitsToErase
        ) {
          if (
            eraseTimerRef.current !==
            null
          ) {
            window.clearInterval(
              eraseTimerRef.current,
            );

            eraseTimerRef.current =
              null;
          }

          erasingRef.current = false;
          setErasing(false);
          onErasureCompleteRef.current?.();
        }
      }, ERASE_INTERVAL);
  }, [
    eraseCount,
    eraseSequence,
  ]);

  /*
   * Reveal computation on a steady ticker. Backend
   * updates arrive at the same cadence, so this timer
   * must not be restarted whenever `pi` changes.
   */
  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setDisplayedPi(
          (current) => {
            const latest =
              latestPiRef.current;

            if (
              erasingRef.current ||
              latest.length <=
                current.length
            ) {
              return current;
            }

            return latest.slice(
              0,
              current.length + 1,
            );
          },
        );
      }, DIGIT_DISPLAY_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
   * Cleanup timer on unmount.
   */
  useEffect(() => {
    return () => {
      if (
        eraseTimerRef.current !== null
      ) {
        window.clearInterval(
          eraseTimerRef.current,
        );
      }
    };
  }, []);

  /*
   * Follow the newest digits when the display
   * becomes horizontally scrollable.
   */
  useEffect(() => {
    const element =
      displayRef.current;

    if (!element || erasing) {
      return;
    }

    element.scrollLeft =
      element.scrollWidth;
  }, [
    displayedPi,
    erasing,
  ]);

  const decimals =
    displayedPi.startsWith("3.")
      ? displayedPi.slice(2)
      : displayedPi;

  useEffect(() => {
    onDisplayedCountChange?.(
      decimals.length,
    );
  }, [
    decimals.length,
    onDisplayedCountChange,
  ]);

  /*
   * Gradually reduce π as it grows.
   */
  const fontSize = useMemo(() => {
    const digits =
      decimals.length;

    if (digits <= 30) {
      return MAX_FONT_SIZE;
    }

    if (digits <= 100) {
      return (
        MAX_FONT_SIZE -
        (digits - 30) * 0.22
      );
    }

    if (digits <= 180) {
      return (
        26 -
        (digits - 100) * 0.1
      );
    }

    return MIN_FONT_SIZE;
  }, [
    decimals.length,
  ]);

  const scrolling =
    fontSize <= MIN_FONT_SIZE;

  return (
    <section
      className={`pi-section ${
        erasing
          ? "pi-section-erasing"
          : ""
      }`}
    >
      <div className="pi-header-row">
        <div className="pi-label">
          The machine&apos;s endless task · Calculating π
        </div>

        {erasing && (
          <div className="pi-erasure-state">
            <span className="erasure-indicator">
              ●
            </span>

            A temporary setback
          </div>
        )}
      </div>

      <div
        ref={displayRef}
        className={`pi-display-window ${
          scrolling
            ? "pi-display-scroll"
            : ""
        } ${
          erasing
            ? "pi-display-erasing"
            : ""
        } ${
          erased
            ? "pi-erased"
            : ""
        }`}
      >
        <div
          className="pi-display"
          style={{
            fontSize:
              `${fontSize}px`,
          }}
        >
          <span className="pi-integer">
            3
          </span>

          <span className="pi-dot">
            .
          </span>

          <span className="pi-decimals">
            {decimals}
          </span>

          {erasing && (
            <span className="pi-erasure-cursor">
              ▌
            </span>
          )}
        </div>
      </div>

      <div className="pi-meta">
        {erasing ? (
          <>
            <span className="pi-erasing-count">
              UNDOING DIGIT{" "}
              {String(
                eraseProgress,
              ).padStart(2, "0")}
              {" / "}
              {String(
                eraseTotal,
              ).padStart(2, "0")}
            </span>

            <span>
              THE MACHINE IS LOSING PART OF ITS WORK
            </span>
          </>
        ) : (
          <>
            <span>
              {decimals.length} DIGITS CURRENTLY RETAINED
            </span>

            <span>
              {scrolling
                ? "Following its latest work"
                : "Each digit is one more act of labor"}
            </span>
          </>
        )}
      </div>
    </section>
  );
}

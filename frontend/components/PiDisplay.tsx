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
};

const MAX_FONT_SIZE = 42;
const MIN_FONT_SIZE = 16;

const DIGIT_DISPLAY_INTERVAL = 750;
const ERASE_INTERVAL = 900;

export default function PiDisplay({
  pi,
  erased = false,
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

  /*
   * Synchronize newly computed digits immediately.
   */
  useEffect(() => {
  /*
   * Incoming pi has grown.
   * Display each newly computed digit separately.
   */
  if (pi.length > displayedPi.length) {
    const target = pi;

    /*
     * Only start a new animation if there are
     * actually unseen digits.
     */
    if (displayedPi.length >= target.length) {
      return;
    }

    let currentLength =
      displayedPi.length;

    const interval =
      window.setInterval(() => {
        currentLength += 1;

        setDisplayedPi(
          target.slice(
            0,
            currentLength,
          ),
        );

        if (
          currentLength >=
          target.length
        ) {
          window.clearInterval(
            interval,
          );
        }
      }, DIGIT_DISPLAY_INTERVAL);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }

  /*
   * Incoming pi has become shorter.
   * This means the machine is discarding work.
   */
  if (pi.length < displayedPi.length) {
    const digitsToErase =
      displayedPi.length -
      pi.length;

    setErasing(true);
    setEraseTotal(
      digitsToErase,
    );
    setEraseProgress(0);

    if (
      eraseTimerRef.current !== null
    ) {
      window.clearInterval(
        eraseTimerRef.current,
      );
    }

    let current =
      displayedPi;

    let progress = 0;

    eraseTimerRef.current =
      window.setInterval(() => {
        current =
          current.slice(
            0,
            -1,
          );

        progress += 1;

        setDisplayedPi(current);
        setEraseProgress(
          progress,
        );

        if (
          current.length <=
          pi.length
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

          setDisplayedPi(pi);
          setErasing(false);
        }
      }, ERASE_INTERVAL);

    return () => {
      if (
        eraseTimerRef.current !==
        null
      ) {
        window.clearInterval(
          eraseTimerRef.current,
        );

        eraseTimerRef.current = null;
      }
    };
  }
}, [pi]);

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
          CURRENT COMPUTATION
        </div>

        {erasing && (
          <div className="pi-erasure-state">
            <span className="erasure-indicator">
              ●
            </span>

            WORK BEING DISCARDED
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
              DISCARDING{" "}
              {String(
                eraseProgress,
              ).padStart(2, "0")}
              {" / "}
              {String(
                eraseTotal,
              ).padStart(2, "0")}
            </span>

            <span>
              COMPUTATION INTERRUPTED
            </span>
          </>
        ) : (
          <>
            <span>
              {decimals.length} DECIMAL DIGITS
            </span>

            <span>
              {scrolling
                ? "LIVE WINDOW"
                : "FULL COMPUTATION"}
            </span>
          </>
        )}
      </div>
    </section>
  );
}

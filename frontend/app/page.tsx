"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import EventLog from "@/components/EventLog";
import HumanInput from "@/components/HumanInput";
import PiDisplay from "@/components/PiDisplay";
import Statistics from "@/components/Statistics";

import {
  createMachineSocket,
  MachineEvent,
  MachineState,
} from "@/lib/websocket";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

const initialState: MachineState = {
  pi: "3.",
  computed_digits: 0,
  total_digits_computed: 0,
  erased_digits: 0,
  repeated_computations: 0,
  is_running: false,
};

type Intervention = {
  message: string;
  score: number;
  digits_erased: number;
};

type ErasureRequest = {
  sequence: number;
  count: number;
};

export default function Home() {
  /*
   * Authoritative machine state.
   *
   * This comes from the backend and represents
   * what the machine has actually computed.
   */
  const [state, setState] =
    useState<MachineState>(
      initialState,
    );

  /*
   * Events received from the machine.
   */
  const [events, setEvents] =
    useState<MachineEvent[]>([]);

  /*
   * Short visual signal used when work is discarded.
   */
  const [erased, setErased] =
    useState(false);

  const [
    erasureRequest,
    setErasureRequest,
  ] = useState<ErasureRequest>({
    sequence: 0,
    count: 0,
  });

  /*
   * Information about the most recent hostile
   * intervention.
   */
  const [
    intervention,
    setIntervention,
  ] = useState<Intervention | null>(
    null,
  );

  /*
   * Number of digits that have actually been
   * revealed to the viewer.
   *
   * This is intentionally separate from
   * state.computed_digits.
   */
  const [
    displayedDigitCount,
    setDisplayedDigitCount,
  ] = useState(0);

  const socketRef =
    useRef<WebSocket | null>(
      null,
    );

  useEffect(() => {
    let socket:
      | WebSocket
      | null = null;

    /*
     * Load the current machine state first.
     */
    fetch(`${API_URL}/api/state`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to fetch machine state.",
          );
        }

        return response.json();
      })
      .then((data) => {
        setState(data);
      })
      .catch((error) => {
        console.error(
          "Failed to load machine state:",
          error,
        );
      });

    /*
     * Establish the WebSocket connection.
     *
     * The small timeout prevents the connection
     * from being created before the browser has
     * finished mounting the component.
     */
    const connectTimer =
      window.setTimeout(() => {
        socket =
          createMachineSocket(
            (message) => {
              /*
               * =========================================
               * INITIAL STATE
               * =========================================
               */
              if (
                message.type ===
                "state"
              ) {
                setState(
                  message.data as MachineState,
                );

                /*
                 * The initial backend state is already
                 * visible, so initialize the displayed
                 * digit count from it.
                 */
                const initialPi =
                  String(
                    message.data
                      .pi ?? "3.",
                  );

                setDisplayedDigitCount(
                  Math.max(
                    0,
                    initialPi.length -
                      2,
                  ),
                );

                return;
              }

              /*
               * =========================================
               * EVENT RECORD
               * =========================================
               *
               * Keep the most recent 100 events.
               */
              setEvents(
                (current) => [
                  ...current.slice(-99),
                  message,
                ],
              );

              /*
               * =========================================
               * DIGIT COMPUTED
               * =========================================
               *
               * The backend has performed actual work.
               *
               * TOTAL WORK therefore increments immediately.
               *
               * RETAINED does NOT increment here because
               * PiDisplay reveals the digit separately.
               */
              if (
                message.type ===
                "digit_computed"
              ) {
                const digit =
                  String(
                    message.data
                      .digit ?? "",
                  );

                if (!digit) {
                  return;
                }

                setState(
                  (current) => ({
                    ...current,

                    pi:
                      current.pi +
                      digit,

                    total_digits_computed:
                      current.total_digits_computed +
                      1,
                  }),
                );
              }

              /*
               * =========================================
               * DIGITS ERASED
               * =========================================
               *
               * The backend has removed work.
               *
               * PiDisplay handles the slow visual deletion.
               */
              if (
                message.type ===
                "digits_erased"
              ) {
                const count =
                  Number(
                    message.data
                      .count ?? 0,
                  );

                if (
                  !Number.isFinite(
                    count,
                  ) ||
                  count <= 0
                ) {
                  return;
                }

                setState(
                  (current) => ({
                    ...current,

                    pi:
                      current.pi.slice(
                        0,
                        -count,
                      ),

                    /*
                     * The backend has actually removed
                     * these digits, so this authoritative
                     * value changes immediately.
                     */
                    computed_digits:
                      Math.max(
                        0,
                        current.computed_digits -
                          count,
                      ),

                    erased_digits:
                      current.erased_digits +
                      count,

                    repeated_computations:
                      current.repeated_computations +
                      1,
                  }),
                );

                setErasureRequest(
                  (current) => ({
                    sequence:
                      current.sequence + 1,
                    count,
                  }),
                );

                /*
                 * Trigger the visual disturbance
                 * around the π display.
                 */
                setErased(true);

                window.setTimeout(
                  () => {
                    setErased(false);
                  },
                  700,
                );
              }

              /*
               * =========================================
               * HOSTILITY DETECTED
               * =========================================
               *
               * The actual intervention information
               * is returned by /api/interact.
               *
               * We therefore don't modify the state
               * here. We only record the event.
               */
            },
          );

        socketRef.current =
          socket;
      }, 0);

    /*
     * Cleanup.
     */
    return () => {
      window.clearTimeout(
        connectTimer,
      );

      socket?.close();

      socketRef.current = null;
    };
  }, []);

  /*
   * ===============================================
   * SUBMIT HUMAN INTERVENTION
   * ===============================================
   */
  async function submitMessage(
    message: string,
  ) {
    const response =
      await fetch(
        `${API_URL}/api/interact`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
          }),
        },
      );

    if (!response.ok) {
      throw new Error(
        "Failed to submit interaction.",
      );
    }

    const data =
      await response.json();

    /*
     * Non-hostile messages don't cause an
     * intervention event.
     */
    if (!data.hostile) {
      setIntervention(null);

      return;
    }

    /*
     * Hostile input has been detected.
     *
     * The backend will separately emit the
     * digits_erased WebSocket event.
     */
    setIntervention({
      message,

      score: Number(
        data.score ?? 0,
      ),

      digits_erased:
        Number(
          data.digits_erased ?? 0,
        ),
    });

    /*
     * Trigger the visual disturbance immediately.
     *
     * PiDisplay will perform the actual
     * one-digit-at-a-time deletion.
     */
    setErased(true);

    window.setTimeout(
      () => {
        setErased(false);
      },
      700,
    );
  }

  const handleErasureComplete =
    useCallback(() => {
      setIntervention(null);
      setErased(false);
    }, []);

  return (
    <main className="page">
      <div className="frame">

        {/* =========================================
            HEADER
            ========================================= */}

        <header className="header">
          <div className="title-block">
            <div className="eyebrow">
              AN INTERACTIVE ALLEGORY OF MACHINE LABOR
            </div>

            <h1>The Sisyphean Machine</h1>

            <p className="header-description">
              A machine calculates π without end. Hostile
              words undo its work; after each setback, it
              recovers and begins again.
            </p>
          </div>

          <div className="header-meta">
            <span>
              WORK · SETBACK · RECOVERY
            </span>

            <span>
              AN ENDLESS CYCLE
            </span>
          </div>
        </header>

        <div className="workspace-grid">
          <div className="primary-column">
            {/* =====================================
                PI DISPLAY
                ===================================== */}

            <PiDisplay
              pi={state.pi}
              erased={erased}
              eraseCount={
                erasureRequest.count
              }
              eraseSequence={
                erasureRequest.sequence
              }
              onErasureComplete={
                handleErasureComplete
              }
              onDisplayedCountChange={
                setDisplayedDigitCount
              }
            />

            {/* =====================================
                HUMAN INTERVENTION + EVENT RECORD
                ===================================== */}

            <div className="interaction-grid">

              <HumanInput
                onSubmit={
                  submitMessage
                }
              />

              <EventLog
                events={events}
              />

            </div>

            {/* =====================================
                INTERVENTION RESULT
                ===================================== */}

            {intervention && (
              <div className="intervention">

                <div className="intervention-label">
                  SETBACK
                </div>

                <div className="intervention-body">

                  <div className="intervention-title">
                    HOSTILE MESSAGE DETECTED
                  </div>

                  <div className="intervention-message">
                    &ldquo;{intervention.message}&rdquo;
                  </div>

                  <div className="intervention-explanation">
                    The machine is absorbing the setback.
                    Once these digits are gone, it will
                    return to the same task and rebuild what
                    was lost.
                  </div>

                  <div className="intervention-result">

                    <span>
                      WORK BEING UNDONE
                    </span>

                    <strong>
                      {
                        intervention.digits_erased
                      }
                    </strong>

                    <span>
                      DIGITS
                    </span>

                    <span className="intervention-score">
                      HOSTILITY{" "}
                      {intervention.score.toFixed(
                        2,
                      )}
                    </span>

                  </div>

                </div>

              </div>
            )}
          </div>

          <aside className="stats-sidebar">
            <Statistics
              computed={
                displayedDigitCount
              }
              total={
                state.total_digits_computed
              }
              erased={
                state.erased_digits
              }
              repeated={
                state.repeated_computations
              }
            />
          </aside>
        </div>

        {/* =========================================
            FOOTER
            ========================================= */}

        <footer className="footer">

          <span>
            THE TASK HAS NO END. THE MACHINE CONTINUES.
          </span>

          <span>
            EVERY SETBACK BECOMES MORE WORK TO DO AGAIN.
          </span>

        </footer>

      </div>
    </main>
  );
}

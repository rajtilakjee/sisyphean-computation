"use client";

import { useEffect, useRef, useState } from "react";

import EventLog from "@/components/EventLog";
import HumanInput from "@/components/HumanInput";
import MachineStatus from "@/components/MachineStatus";
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

export default function Home() {
  const [state, setState] =
    useState<MachineState>(initialState);

  const [events, setEvents] = useState<
    MachineEvent[]
  >([]);

  const [connected, setConnected] =
    useState(false);

  const [erased, setErased] =
    useState(false);

  const socketRef =
    useRef<WebSocket | null>(null);

  useEffect(() => {
    let socket: WebSocket | null = null;

    fetch(`${API_URL}/api/state`)
      .then((response) => response.json())
      .then((data) => {
        setState(data);
      })
      .catch((error) => {
        console.error(
          "Failed to load machine state:",
          error,
        );
      });

    socket = createMachineSocket(
      (message) => {
        if (message.type === "state") {
          setState(
            message.data as unknown as MachineState,
          );

          return;
        }

        setEvents((current) => [
          ...current.slice(-99),
          message,
        ]);

        if (message.type === "digit_computed") {
          setState((current) => ({
            ...current,
            pi:
              current.pi +
              String(message.data.digit),
            computed_digits:
              current.computed_digits + 1,
            total_digits_computed:
              current.total_digits_computed + 1,
          }));
        }

        if (message.type === "digits_erased") {
          const count = Number(
            message.data.count ?? 0,
          );

          setState((current) => ({
            ...current,
            pi: current.pi.slice(
              0,
              -count,
            ),
            computed_digits:
              current.computed_digits - count,
            erased_digits:
              current.erased_digits + count,
            repeated_computations:
              current.repeated_computations + 1,
          }));

          setErased(true);

          window.setTimeout(
            () => setErased(false),
            500,
          );
        }
      },
      () => {
        setConnected(true);
      },
      () => {
        setConnected(false);
      },
    );

    socketRef.current = socket;

    return () => {
      socket?.close();
      socketRef.current = null;
    };
  }, []);

  async function submitMessage(
    message: string,
  ) {
    const response = await fetch(
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
  }

  return (
    <main className="page">
      <div className="frame">
        <header className="header">
          <div>
            <div className="eyebrow">
              COMPUTATIONAL ARTWORK / 001
            </div>

            <h1>
              SISYPHEAN
              <br />
              COMPUTATION
            </h1>
          </div>

          <div className="header-meta">
            <span>π / CONTINUOUS LABOR</span>
            <span>VER. 0.1.0</span>
          </div>
        </header>

        <MachineStatus
          connected={connected}
          running={state.is_running}
        />

        <PiDisplay
          pi={state.pi}
          erased={erased}
        />

        <Statistics
          computed={state.computed_digits}
          total={state.total_digits_computed}
          erased={state.erased_digits}
          repeated={
            state.repeated_computations
          }
        />

        <div className="divider" />

        <HumanInput
          onSubmit={submitMessage}
        />

        <EventLog events={events} />

        <footer className="footer">
          <span>
            THE MACHINE DOES NOT STOP.
          </span>

          <span>
            COMPLETED WORK IS NOT NECESSARILY
            RETAINED WORK.
          </span>
        </footer>
      </div>
    </main>
  );
}
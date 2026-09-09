export type MachineState = {
  pi: string;
  computed_digits: number;
  total_digits_computed: number;
  erased_digits: number;
  repeated_computations: number;
  is_running: boolean;
  connected_clients?: number;
};

export type MachineEvent = {
  type: string;
  timestamp: string | null;
  data: Record<string, unknown>;
};

export type MachineMessage =
  MachineEvent;

const WS_URL =
  "ws://127.0.0.1:8000/ws";

export function createMachineSocket(
  onMessage: (
    message: MachineMessage,
  ) => void,
  onOpen?: () => void,
  onClose?: () => void,
) {
  console.log(
    "[machine] connecting:",
    WS_URL,
  );

  const socket =
    new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log(
      "[machine] websocket connected",
    );

    onOpen?.();
  };

  socket.onmessage = (event) => {
    console.log(
      "[machine] received:",
      event.data,
    );

    try {
      const message =
        JSON.parse(
          event.data,
        ) as MachineMessage;

      onMessage(message);
    } catch (error) {
      console.error(
        "[machine] invalid message:",
        error,
      );
    }
  };

  socket.onclose = (event) => {
    console.log(
      "[machine] websocket closed",
      {
        code: event.code,
        reason: event.reason,
        wasClean:
          event.wasClean,
      },
    );

    onClose?.();
  };

  socket.onerror = () => {
    console.error(
      `[machine] websocket failed: ${WS_URL}`,
    );
  };

  return socket;
}
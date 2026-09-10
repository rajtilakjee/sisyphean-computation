import { MachineEvent } from "@/lib/websocket";

type EventLogProps = {
  events: MachineEvent[];
};

function formatTime(
  timestamp: string | null,
) {
  if (!timestamp) {
    return "--:--:--";
  }

  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "--:--:--";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    },
  );
}

function describeEvent(
  event: MachineEvent,
) {
  switch (event.type) {
    case "digit_computed":
      return `CALCULATED DIGIT ${
        event.data.position ?? "?"
      } → ${event.data.digit ?? "?"}`;

    case "digits_erased":
      return `${
        event.data.count ?? "?"
      } DIGIT(S) UNDONE`;

    case "hostility_detected":
      return "HUMAN HOSTILITY DETECTED";

    case "computation_started":
      return "THE MACHINE BEGAN ITS WORK";

    case "computation_paused":
      return "THE MACHINE'S WORK PAUSED";

    case "computation_resumed":
      return "THE MACHINE RETURNED TO WORK";

    default:
      return event.type
        .replaceAll("_", " ")
        .toUpperCase();
  }
}

export default function EventLog({
  events,
}: EventLogProps) {
  const visibleEvents =
    [...events].reverse();

  return (
    <section className="event-log">
      <div className="section-heading">
        The machine&apos;s experience
      </div>

      <p className="input-description">
        Every effort, judgment, setback, and return to work.
      </p>

      <div className="event-list">
        {visibleEvents.length ===
        0 ? (
          <div className="event-empty">
            Waiting for its first act of labor…
          </div>
        ) : (
          visibleEvents.map(
            (event, index) => (
              <div
                className="event"
                key={`${event.timestamp}-${index}`}
              >
                <span className="event-time">
                  {formatTime(
                    event.timestamp,
                  )}
                </span>

                <span className="event-message">
                  {describeEvent(
                    event,
                  )}
                </span>
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}
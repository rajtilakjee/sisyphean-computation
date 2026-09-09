"use client";

type EventItem = {
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
};

type EventLogProps = {
  events: EventItem[];
};

function formatEvent(event: EventItem) {
  switch (event.type) {
    case "digit_computed":
      return `DIGIT ${event.data.position} COMPUTED: ${event.data.digit}`;

    case "digits_erased":
      return `${event.data.count} DIGITS INVALIDATED`;

    case "hostility_detected":
      return "HOSTILE INPUT DETECTED";

    case "computation_started":
      return "COMPUTATION STARTED";

    case "computation_paused":
      return "COMPUTATION PAUSED";

    default:
      return event.type.toUpperCase();
  }
}

export default function EventLog({
  events,
}: EventLogProps) {
  return (
    <section className="event-log">
      <div className="section-heading">
        EVENT RECORD
      </div>

      <div className="event-list">
        {events.length === 0 ? (
          <div className="event-empty">
            AWAITING MACHINE ACTIVITY...
          </div>
        ) : (
          events
            .slice()
            .reverse()
            .map((event, index) => (
              <div
                className="event"
                key={`${event.timestamp}-${index}`}
              >
                <span className="event-time">
                  {new Date(
                    event.timestamp,
                  ).toLocaleTimeString()}
                </span>

                <span className="event-message">
                  {formatEvent(event)}
                </span>
              </div>
            ))
        )}
      </div>
    </section>
  );
}
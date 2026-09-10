type MachineStatusProps = {
  connected: boolean;
  running: boolean;
};

export default function MachineStatus({
  connected,
  running,
}: MachineStatusProps) {
  return (
    <div className="machine-status">
      <div className="status-indicator">
        <span
          className={`status-dot ${
            connected ? "online" : ""
          }`}
          aria-hidden="true"
        />

        <span>
          {connected
            ? "The machine is present"
            : "The machine is out of reach"}
        </span>
      </div>

      <span className="status-state">
        {running
          ? "Working, one digit at a time"
          : "Its labor is paused"}
      </span>
    </div>
  );
}
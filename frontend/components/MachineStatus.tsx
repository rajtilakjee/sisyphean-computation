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
            connected ? "online" : "offline"
          }`}
        />
        <span>
          {connected
            ? "MACHINE CONNECTED"
            : "CONNECTION LOST"}
        </span>
      </div>

      <div className="status-state">
        {running
          ? "COMPUTATION IN PROGRESS"
          : "COMPUTATION PAUSED"}
      </div>
    </div>
  );
}
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
        />

        <span>
          {connected
            ? "MACHINE LINK ESTABLISHED"
            : "MACHINE LINK OFFLINE"}
        </span>
      </div>

      <span className="status-state">
        {running
          ? "COMPUTATION RUNNING"
          : "COMPUTATION PAUSED"}
      </span>
    </div>
  );
}
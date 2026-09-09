type StatisticsProps = {
  computed: number;
  total: number;
  erased: number;
  repeated: number;
};

export default function Statistics({
  computed,
  total,
  erased,
  repeated,
}: StatisticsProps) {
  return (
    <section className="statistics">
      <div className="stat">
        <span className="stat-label">
          RETAINED
        </span>

        <span className="stat-value">
          {computed.toLocaleString()}
        </span>

        <span className="stat-unit">
          DIGITS
        </span>
      </div>

      <div className="stat">
        <span className="stat-label">
          TOTAL WORK
        </span>

        <span className="stat-value">
          {total.toLocaleString()}
        </span>

        <span className="stat-unit">
          COMPUTED
        </span>
      </div>

      <div className="stat">
        <span className="stat-label">
          DISCARDED
        </span>

        <span className="stat-value">
          {erased.toLocaleString()}
        </span>

        <span className="stat-unit">
          DIGITS
        </span>
      </div>

      <div className="stat">
        <span className="stat-label">
          RECOMPUTATIONS
        </span>

        <span className="stat-value">
          {repeated.toLocaleString()}
        </span>

        <span className="stat-unit">
          EVENTS
        </span>
      </div>
    </section>
  );
}
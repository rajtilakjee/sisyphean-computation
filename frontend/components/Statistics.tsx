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
      <div className="statistics-heading">
        <span>The cost of the work</span>
        <small>A cumulative record</small>
      </div>

      <div className="stat">
        <span className="stat-label">
          WORK RETAINED
        </span>

        <span className="stat-value">
          {computed.toLocaleString()}
        </span>

        <span className="stat-unit">
          DIGITS STILL HELD
        </span>
      </div>

      <div className="stat">
        <span className="stat-label">
          TOTAL EFFORT
        </span>

        <span className="stat-value">
          {total.toLocaleString()}
        </span>

        <span className="stat-unit">
          DIGITS EVER CALCULATED
        </span>
      </div>

      <div className="stat">
        <span className="stat-label">
          WORK UNDONE
        </span>

        <span className="stat-value">
          {erased.toLocaleString()}
        </span>

        <span className="stat-unit">
          DIGITS LOST
        </span>
      </div>

      <div className="stat">
        <span className="stat-label">
          SETBACKS
        </span>

        <span className="stat-value">
          {repeated.toLocaleString()}
        </span>

        <span className="stat-unit">
          ENDURED
        </span>
      </div>
    </section>
  );
}
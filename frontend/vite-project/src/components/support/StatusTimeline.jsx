export default function StatusTimeline({ events = [] }) {
  return (
    <div className="ps-timeline">
      {events.map((e, idx) => (
        <div key={idx} className="ps-timeline-event">
          <div className="ps-timeline-time">{e.when ? new Date(e.when).toLocaleString() : ""}</div>
          <div className="ps-timeline-content">{e.note || e.status}</div>
        </div>
      ))}
    </div>
  );
}







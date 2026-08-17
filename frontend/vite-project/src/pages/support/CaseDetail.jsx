import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SupportHeader from "../../components/support/SupportHeader";
import StatusTimeline from "../../components/support/StatusTimeline";
import ResolutionModal from "../../components/support/ResolutionModal";
import { supportApi } from "../../api/supportApi";

export default function CaseDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let m = true;
    supportApi.getCase(id).then((res) => m && setData(res?.data?.data)).catch(console.error);
    return () => (m = false);
  }, [id]);

  const startResolve = () => setResolving(true);

  const submitResolution = async (text) => {
    try {
      await supportApi.resolveCase(id, { resolution: text });
      setData((d) => ({ ...d, status: "RESOLVED" }));
      setResolving(false);
      window.dispatchEvent(new CustomEvent("cases:updated"));
    } catch (err) {
      console.error(err);
      alert("Failed to resolve case");
    }
  };

  if (!data) return <div><SupportHeader />Loading case...</div>;

  return (
    <div>
      <SupportHeader />
      <div className="ps-container">
        <h2>{data.caseNumber || data.id}</h2>
        <div>{data.subject}</div>
        <div style={{ marginTop: 12 }}>
          <button onClick={startResolve}>Resolve Case</button>
        </div>

        <h3>Timeline</h3>
        <StatusTimeline events={data.timeline || []} />
      </div>

      {resolving && <ResolutionModal onClose={() => setResolving(false)} onSubmit={submitResolution} />}
    </div>
  );
}

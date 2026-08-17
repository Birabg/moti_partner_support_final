export default function ResolutionModal({ onClose, onSubmit, initial = "" }) {
  return (
    <div className="ps-modal">
      <h3>Resolution Summary</h3>
      <textarea defaultValue={initial} className="ps-resolution-editor" />
      <div className="ps-modal-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => onSubmit(document.querySelector('.ps-resolution-editor').value)}>Submit</button>
      </div>
    </div>
  );
}

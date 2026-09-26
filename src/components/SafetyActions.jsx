import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { blocksChanged, safetyRequest } from '../api/safety';
import './SafetyActions.css';

const reasons = {
  user: [['suspicious_account', 'Suspicious account'], ['harassment', 'Harassment'], ['inappropriate_behavior', 'Inappropriate behavior'], ['misleading_profile', 'Misleading profile'], ['unsafe_behavior', 'Unsafe behavior'], ['other', 'Other']],
  job: [['fake_or_spam', 'Fake or spam'], ['misleading_details', 'Misleading details'], ['misleading_payment', 'Misleading payment'], ['unsafe_work', 'Unsafe work'], ['inappropriate_content', 'Inappropriate content'], ['other', 'Other']],
};

function SafetyModal({ mode, type, targetId, onClose, onSuccess }) {
  const dialog = useRef(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const isReport = mode === 'report';

  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const data = isReport
        ? await safetyRequest(`reports/${type}s/${targetId}`, 'POST', { reason, details })
        : await safetyRequest(`blocks/${targetId}`, 'POST');
      if (!isReport) blocksChanged();
      onSuccess(data.message, !isReport);
    } catch (err) {
      setError(err.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return createPortal(
    <dialog ref={dialog} className="safety-modal" aria-labelledby="safety-title" aria-describedby="safety-description"
      onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
      <form onSubmit={submit}>
        <h2 id="safety-title">{isReport ? `Report this ${type === 'user' ? 'user' : 'work'}` : 'Block this user?'}</h2>
        <p id="safety-description">{isReport ? 'Tell us what happened. Reports help us keep Karviam safer.' : 'They won’t be able to interact with you through new applications or messages. Existing work history will remain.'}</p>
        {isReport && <>
          <label htmlFor="safety-reason">Select reason</label>
          <select id="safety-reason" value={reason} onChange={event => setReason(event.target.value)} required disabled={busy}>
            <option value="">Choose a reason</option>
            {reasons[type].map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <label htmlFor="safety-details">Add details (optional)</label>
          <textarea id="safety-details" value={details} onChange={event => setDetails(event.target.value)} maxLength={500} rows={4} disabled={busy} />
          <small className="safety-count">{details.length}/500</small>
        </>}
        {error && <p role="alert" className="safety-error">{error}</p>}
        <div className="safety-buttons">
          <button type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className={isReport ? '' : 'safety-danger'} disabled={busy}>{busy ? 'Saving…' : isReport ? 'Submit Report' : 'Block User'}</button>
        </div>
      </form>
    </dialog>, document.body
  );
}

export default function SafetyActions({ type, targetId, blocked = false, onBlockChange }) {
  const [mode, setMode] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function unblock() {
    if (busy) return;
    setBusy(true);
    try {
      const data = await safetyRequest(`blocks/${targetId}`, 'DELETE');
      setMessage(data.message);
      blocksChanged();
      onBlockChange?.(false);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <div className="safety-actions">
    <div className="safety-buttons">
      <button type="button" onClick={() => setMode('report')}>{type === 'user' ? 'Report User' : 'Report Work'}</button>
      {type === 'user' && (blocked ? <>
        <span className="safety-badge">Blocked</span>
        <button type="button" disabled={busy} onClick={unblock}>{busy ? 'Saving…' : 'Unblock'}</button>
      </> : <button type="button" className="safety-danger" onClick={() => setMode('block')}>Block User</button>)}
    </div>
    {message && <p role="status">{message}</p>}
    {mode && <SafetyModal mode={mode} type={type} targetId={targetId} onClose={() => setMode(null)} onSuccess={(text, didBlock) => {
      setMode(null); setMessage(text); if (didBlock) onBlockChange?.(true);
    }} />}
  </div>;
}

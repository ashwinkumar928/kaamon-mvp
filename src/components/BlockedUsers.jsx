import { useEffect, useState } from 'react';
import { blocksChanged, safetyRequest } from '../api/safety';
import UserAvatar from './UserAvatar';
import './SafetyActions.css';

export default function BlockedUsers() {
  const [users, setUsers] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    safetyRequest('blocks').then(data => { if (active) { setUsers(data); setMessage(''); } })
      .catch(error => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [attempt]);

  async function unblock(id) {
    setBusy(id);
    try {
      const data = await safetyRequest(`blocks/${id}`, 'DELETE');
      setUsers(current => current.filter(user => String(user.user_id) !== String(id)));
      setMessage(data.message);
      blocksChanged();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(null); }
  }

  return <section className="profile-section safety-settings">
    <h2>Blocked users</h2>
    {users === null && !message && <p>Loading blocked users…</p>}
    {users?.length === 0 && <p>No blocked users.</p>}
    {users?.map(user => <div className="safety-user" key={user.user_id}>
      <UserAvatar name={user.name} src={user.profile_picture_url} size={38} />
      <div><strong>{user.name}</strong><small>Blocked {new Date(user.created_at).toLocaleDateString()}</small></div>
      <button type="button" disabled={busy !== null} onClick={() => unblock(user.user_id)}>{busy === user.user_id ? 'Saving…' : 'Unblock'}</button>
    </div>)}
    {message && <p role="status">{message}</p>}
    {users === null && message && <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button>}
  </section>;
}

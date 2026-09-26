import API_URL from '../api';

export async function safetyRequest(path, method = 'GET', body) {
  const token = localStorage.getItem('kaamonToken');
  if (!token) throw new Error('Please log in to continue.');
  let response;
  try {
    response = await fetch(`${API_URL}/api/${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Could not connect to Karviam. Please try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 401 ? 'Please log in again to continue.' : data.message || 'Could not complete this action. Please try again.');
  return data;
}

export function blocksChanged() {
  window.dispatchEvent(new Event('karviamBlocksChanged'));
}

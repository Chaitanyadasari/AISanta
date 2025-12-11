export const API_URL = 'http://localhost:5000/api';

export async function login(nameCode, email) {
  const resp = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameCode, email })
  });
  return resp.json();
}

export async function getAssignment(nameCode) {
  const resp = await fetch(`${API_URL}/getAssignment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameCode })
  });
  return resp.json();
}

export async function getNameCodes() {
  const resp = await fetch(`${API_URL}/namecodes`);
  return resp.json();
}

export async function addPlayer(nameCode, email) {
  const resp = await fetch(`${API_URL}/namecodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameCode, email })
  });
  return resp.json();
}

export async function generateAssignments(nameCode) {
  const resp = await fetch(`${API_URL}/generate-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameCode })
  });
  return resp.json();
}

export async function resetAssignments(nameCode) {
  const resp = await fetch(`${API_URL}/reset-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameCode })
  });
  return resp.json();
}

export async function deletePlayer(nameCode) {
  const resp = await fetch(`${API_URL}/namecodes`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nameCode })
  });
  return resp.json();
}


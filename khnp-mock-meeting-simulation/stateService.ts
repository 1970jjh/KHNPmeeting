
import { Room, Participant, RoleType } from './types';
import { getRolesForCount } from './constants';

const STORAGE_KEY = 'KHNP_MOCK_MEETING_STATE';

export const getState = (): { rooms: Room[] } => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { rooms: [] };
};

export const saveState = (state: { rooms: Room[] }) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('storage'));
};

export const createRoom = (name: string, teamCount: number, duration: number): Room => {
  const state = getState();
  const newRoom: Room = {
    id: Math.random().toString(36).slice(2, 11),
    name,
    teamCount,
    duration,
    participants: [],
    isStarted: false,
    createdAt: Date.now()
  };
  state.rooms.push(newRoom);
  saveState(state);
  return newRoom;
};

export const updateRoom = (id: string, updates: Partial<Room>) => {
  const state = getState();
  const index = state.rooms.findIndex(r => r.id === id);
  if (index !== -1) {
    state.rooms[index] = { ...state.rooms[index], ...updates };
    saveState(state);
  }
};

export const deleteRoom = (id: string) => {
  const state = getState();
  state.rooms = state.rooms.filter(r => r.id !== id);
  saveState(state);
};

export const joinRoom = (roomId: string, teamIndex: number, name: string): string => {
  const state = getState();
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) throw new Error('방을 찾을 수 없습니다.');
  
  const participantId = Math.random().toString(36).slice(2, 11);
  room.participants.push({ id: participantId, name, teamIndex });
  saveState(state);
  return participantId;
};

export const startMeeting = (roomId: string) => {
  const state = getState();
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) return;
  
  // Assign roles per team
  for (let t = 0; t < room.teamCount; t++) {
    const teamParticipants = room.participants.filter(p => p.teamIndex === t);
    if (teamParticipants.length >= 1) { // 최소 인원을 1명으로 변경
      const roles = getRolesForCount(Math.max(4, teamParticipants.length)); // 최소 4명 기준 역할을 가져와서 배정
      const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
      teamParticipants.forEach((p, idx) => {
        p.roleId = shuffledRoles[idx];
      });
    }
  }
  
  room.isStarted = true;
  room.startTime = Date.now();
  saveState(state);
};

import { Room, Participant, RoleType } from './types';
import { getRolesForCount } from './constants';
import { database, ref, set, get, onValue, remove, update } from './firebase';

// 실시간 구독을 위한 콜백 저장
type RoomsCallback = (rooms: Room[]) => void;
let roomsCallbacks: RoomsCallback[] = [];

// 실시간 데이터 구독 시작
export const subscribeToRooms = (callback: RoomsCallback) => {
  roomsCallbacks.push(callback);

  const roomsRef = ref(database, 'rooms');
  const unsubscribe = onValue(roomsRef, (snapshot) => {
    const data = snapshot.val();
    const rooms: Room[] = data ? Object.values(data) : [];
    // 모든 콜백에 알림
    roomsCallbacks.forEach(cb => cb(rooms));
  });

  // 구독 해제 함수 반환
  return () => {
    roomsCallbacks = roomsCallbacks.filter(cb => cb !== callback);
    if (roomsCallbacks.length === 0) {
      unsubscribe();
    }
  };
};

// 동기적 상태 반환 (호환성 유지용 - 빈 배열 반환)
export const getState = (): { rooms: Room[] } => {
  return { rooms: [] };
};

// 비동기 상태 가져오기
export const getStateAsync = async (): Promise<{ rooms: Room[] }> => {
  const roomsRef = ref(database, 'rooms');
  const snapshot = await get(roomsRef);
  const data = snapshot.val();
  const rooms: Room[] = data ? Object.values(data) : [];
  return { rooms };
};

// 방 생성
export const createRoom = async (name: string, teamCount: number, duration: number): Promise<Room> => {
  const newRoom: Room = {
    id: Math.random().toString(36).slice(2, 11),
    name,
    teamCount,
    duration,
    participants: [],
    isStarted: false,
    createdAt: Date.now()
  };

  const roomRef = ref(database, `rooms/${newRoom.id}`);
  await set(roomRef, newRoom);
  return newRoom;
};

// 방 업데이트
export const updateRoom = async (id: string, updates: Partial<Room>) => {
  const roomRef = ref(database, `rooms/${id}`);
  await update(roomRef, updates);
};

// 방 삭제
export const deleteRoom = async (id: string) => {
  const roomRef = ref(database, `rooms/${id}`);
  await remove(roomRef);
};

// 방 참가
export const joinRoom = async (roomId: string, teamIndex: number, name: string): Promise<string> => {
  const roomRef = ref(database, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val() as Room | null;

  if (!room) throw new Error('방을 찾을 수 없습니다.');

  const participantId = Math.random().toString(36).slice(2, 11);
  const participants = room.participants || [];
  participants.push({ id: participantId, name, teamIndex });

  await update(roomRef, { participants });
  return participantId;
};

// 회의 시작
export const startMeeting = async (roomId: string) => {
  const roomRef = ref(database, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val() as Room | null;

  if (!room) return;

  const participants = room.participants || [];

  // 팀별 역할 배정
  for (let t = 0; t < room.teamCount; t++) {
    const teamParticipants = participants.filter(p => p.teamIndex === t);
    if (teamParticipants.length >= 1) {
      const roles = getRolesForCount(Math.max(4, teamParticipants.length));
      const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);
      teamParticipants.forEach((p, idx) => {
        p.roleId = shuffledRoles[idx];
      });
    }
  }

  await update(roomRef, {
    participants,
    isStarted: true,
    startTime: Date.now()
  });
};

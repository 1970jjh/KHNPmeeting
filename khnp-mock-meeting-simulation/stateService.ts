import { Room, Participant, RoleType } from './types';
import { getRolesForCount } from './constants';
import { database, ref, set, get, onValue, remove, update, runTransaction, DatabaseReference } from './firebase';

// 세션 저장 키
const SESSION_KEY = 'KHNP_MEETING_SESSION';

// 세션 타입
interface SessionData {
  roomId: string;
  participantId: string;
  timestamp: number;
}

// 세션 저장
export const saveSession = (roomId: string, participantId: string) => {
  const session: SessionData = { roomId, participantId, timestamp: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// 세션 불러오기
export const getSession = (): SessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as SessionData;
  } catch {
    return null;
  }
};

// 세션 삭제
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

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

// 사용 가능한 역할 찾기 (중간 참여용)
const getAvailableRole = (room: Room, teamIndex: number): RoleType => {
  const participants = room.participants || [];
  const teamParticipants = participants.filter(p => p.teamIndex === teamIndex);
  const usedRoles = teamParticipants.map(p => p.roleId).filter(Boolean) as RoleType[];

  // 팀 크기에 맞는 역할 목록 가져오기 (새 참가자 포함)
  const allRoles = getRolesForCount(teamParticipants.length + 1);

  // 사용되지 않은 역할 찾기
  const availableRoles = allRoles.filter(role => !usedRoles.includes(role));

  if (availableRoles.length > 0) {
    // 랜덤하게 하나 선택
    return availableRoles[Math.floor(Math.random() * availableRoles.length)];
  }

  // 모든 역할이 사용 중이면 랜덤하게 배정 (중복 허용)
  const fallbackRoles = [RoleType.YESMAN, RoleType.ACTIVE, RoleType.MEDIATOR, RoleType.FREELOADER];
  return fallbackRoles[Math.floor(Math.random() * fallbackRoles.length)];
};

// 방 참가 (트랜잭션 사용으로 동시 접속 안정화)
export const joinRoom = async (roomId: string, teamIndex: number, name: string): Promise<string> => {
  const roomRef = ref(database, `rooms/${roomId}`) as DatabaseReference;
  const participantId = Math.random().toString(36).slice(2, 11);

  try {
    await runTransaction(roomRef, (room: Room | null) => {
      if (!room) {
        throw new Error('방을 찾을 수 없습니다.');
      }

      const participants = room.participants || [];
      const newParticipant: Participant = { id: participantId, name, teamIndex };

      // 회의가 이미 시작되었으면 역할도 함께 배정
      if (room.isStarted) {
        newParticipant.roleId = getAvailableRole(room, teamIndex);
      }

      participants.push(newParticipant);
      room.participants = participants;

      return room;
    });

    return participantId;
  } catch (error) {
    // 트랜잭션 실패시 일반 방식으로 재시도
    const snapshot = await get(roomRef);
    const room = snapshot.val() as Room | null;

    if (!room) throw new Error('방을 찾을 수 없습니다.');

    const participants = room.participants || [];
    const newParticipant: Participant = { id: participantId, name, teamIndex };

    if (room.isStarted) {
      newParticipant.roleId = getAvailableRole(room, teamIndex);
    }

    participants.push(newParticipant);
    await update(roomRef, { participants });

    return participantId;
  }
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
      // 참가자 수에 맞는 역할 가져오기
      const roles = getRolesForCount(teamParticipants.length);
      const shuffledRoles = [...roles].sort(() => Math.random() - 0.5);

      // 모든 참가자에게 역할 배정 (안전 장치 포함)
      teamParticipants.forEach((p, idx) => {
        if (idx < shuffledRoles.length) {
          p.roleId = shuffledRoles[idx];
        } else {
          // 역할이 부족한 경우 기본 역할 배정
          const fallbackRoles = [RoleType.YESMAN, RoleType.ACTIVE, RoleType.MEDIATOR, RoleType.FREELOADER];
          p.roleId = fallbackRoles[idx % fallbackRoles.length];
        }
      });
    }
  }

  await update(roomRef, {
    participants,
    isStarted: true,
    startTime: Date.now()
  });
};

// 회의 종료
export const stopMeeting = async (roomId: string) => {
  const roomRef = ref(database, `rooms/${roomId}`);
  await update(roomRef, {
    isStarted: false,
    startTime: null
  });
};

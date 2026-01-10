
export enum RoleType {
  LEADER = 'LEADER',
  ACTIVE = 'ACTIVE',
  DICTATOR = 'DICTATOR',
  MEDIATOR = 'MEDIATOR',
  BYSTANDER = 'BYSTANDER',
  DISTRACTOR = 'DISTRACTOR',
  YESMAN = 'YESMAN',
  FREELOADER = 'FREELOADER'
}

export interface RoleData {
  id: RoleType;
  title: string;
  emoji: string;
  rank: string;
  age: string;
  experience: string;
  intro: string;
  publicProfile: string;
  secretRole: string;
  mission: string;
  guides: {
    category: string;
    text: string;
  }[];
  hierarchyLevel: number;
}

export interface Participant {
  id: string;
  name: string;
  teamIndex: number; // 0-based index for teams
  roleId?: RoleType;
}

export interface Room {
  id: string;
  name: string;
  teamCount: number;
  duration: number; // in minutes
  participants: Participant[];
  isStarted: boolean;
  startTime?: number; // timestamp
  createdAt: number;
}

export interface AppState {
  rooms: Room[];
}

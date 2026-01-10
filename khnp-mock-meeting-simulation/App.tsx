
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { RoleType, Room, Participant } from './types';
import { ROLES, ADMIN_PASSWORD } from './constants';
import * as stateService from './stateService';
import { NeoButton } from './components/NeoButton';
import { RoleCard } from './components/RoleCard';
import { OrgChart } from './components/OrgChart';
import { Timer } from './components/Timer';

// AI Helper Function
const getAIFeedback = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "당신은 한국수력원자력의 조직 문화와 회의 스킬 전문가입니다. 사용자의 역할극을 돕기 위해 캐릭터의 성격과 말투를 완벽하게 분석하여 조언해주세요.",
        temperature: 0.8,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "AI 응답을 가져오는 데 실패했습니다. 다시 시도해주세요.";
  }
};

// --- Screens ---

const HomeScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-block bg-blue-600 text-white px-4 py-2 neo-border neo-shadow-sm font-black text-lg mb-4">
          KHNP 실전 모의회의
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-black leading-tight tracking-tighter">
          TENSION<br/>MEETING
        </h1>
        <p className="text-xl font-bold bg-white neo-border-sm inline-block px-4 py-2">
          발전소 주변 지역주민 상생 축제 기획
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <div className="bg-white neo-border neo-shadow p-8 flex flex-col items-center">
          <span className="text-5xl mb-4">🏢</span>
          <h2 className="text-2xl font-black mb-6">참가자 입장</h2>
          <p className="text-center text-gray-600 font-bold mb-8">배정된 과정을 선택하고<br/>팀과 역할을 확인하세요.</p>
          <NeoButton className="w-full" onClick={() => navigate('/join')}>입장하기</NeoButton>
        </div>
        <div className="bg-[#4CC9F0] neo-border neo-shadow p-8 flex flex-col items-center">
          <span className="text-5xl mb-4">🔑</span>
          <h2 className="text-2xl font-black mb-6">관리자 모드</h2>
          <p className="text-center text-gray-800 font-bold mb-8">과정을 개설하고<br/>회의 환경을 설정하세요.</p>
          <NeoButton variant="white" className="w-full" onClick={() => navigate('/admin-login')}>관리자 로그인</NeoButton>
        </div>
      </div>
    </div>
  );
};

const AdminLoginScreen = () => {
  const [pw, setPw] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem('ADMIN_AUTH', 'true');
      navigate('/admin');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white neo-border neo-shadow p-8 w-full max-w-md">
        <h2 className="text-3xl font-black mb-8 border-b-4 border-black pb-2">ADMIN LOGIN</h2>
        <div className="space-y-6">
          <div>
            <label className="block font-black mb-2">ACCESS PASSWORD</label>
            <input 
              type="password"
              className="w-full neo-border p-4 font-bold text-xl focus:bg-blue-50 outline-none"
              placeholder="••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <NeoButton className="w-full py-4 text-xl" onClick={handleLogin}>로그인</NeoButton>
          <button onClick={() => navigate('/')} className="w-full font-bold text-gray-500 hover:text-black">돌아가기</button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({ name: '', teamCount: 4, duration: 10 });
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('ADMIN_AUTH') !== 'true') navigate('/');
    const update = () => setRooms(stateService.getState().rooms);
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [navigate]);

  const handleSave = () => {
    if (!formData.name) return;
    if (editRoom) {
      stateService.updateRoom(editRoom.id, formData);
      setEditRoom(null);
    } else {
      stateService.createRoom(formData.name, formData.teamCount, formData.duration);
    }
    setFormData({ name: '', teamCount: 4, duration: 10 });
  };

  const startEdit = (room: Room) => {
    setEditRoom(room);
    setFormData({ name: room.name, teamCount: room.teamCount, duration: room.duration });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 pb-20">
      <header className="flex justify-between items-end border-b-4 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase">Admin Dashboard</h1>
          <p className="font-bold text-blue-600">한수원 모의회의 과정 및 설정 관리</p>
        </div>
        <NeoButton variant="danger" onClick={() => { localStorage.removeItem('ADMIN_AUTH'); navigate('/'); }}>로그아웃</NeoButton>
      </header>

      <section className="bg-blue-600 neo-border neo-shadow p-8 text-white">
        <h3 className="text-2xl font-black mb-6">{editRoom ? '과정 설정 수정' : '새 과정 개설'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-black mb-1">과정명</label>
            <input 
              className="w-full neo-border p-3 text-black font-bold outline-none"
              placeholder="예: 2024 상반기 신입사원 입문교육"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-black mb-1">팀 개수</label>
            <input 
              type="number"
              className="w-full neo-border p-3 text-black font-bold outline-none"
              value={formData.teamCount}
              onChange={(e) => setFormData({...formData, teamCount: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-xs font-black mb-1">회의 시간 (분)</label>
            <input 
              type="number"
              className="w-full neo-border p-3 text-black font-bold outline-none"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <NeoButton variant="white" onClick={handleSave}>{editRoom ? '수정 완료' : '과정 생성'}</NeoButton>
          {editRoom && <NeoButton variant="danger" onClick={() => { setEditRoom(null); setFormData({name:'', teamCount:4, duration:10}); }}>취소</NeoButton>}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-2xl font-black">운영 중인 과정 목록 ({rooms.length})</h3>
        <div className="grid grid-cols-1 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white neo-border neo-shadow p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b-2 border-gray-100 pb-4 mb-4 gap-4">
                <div>
                  <h4 className="text-2xl font-black text-blue-600">{room.name}</h4>
                  <div className="flex gap-4 mt-1 font-bold text-sm text-gray-500">
                    <span>👥 총 {room.participants.length}명 참여</span>
                    <span>🚩 {room.teamCount}개 팀</span>
                    <span>⏱ {room.duration}분 설정</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <NeoButton 
                    className="flex-1 md:flex-none" 
                    variant={room.isStarted ? "success" : "primary"}
                    disabled={room.isStarted || room.participants.length < 1} // 1명 이상이면 시작 가능
                    onClick={() => stateService.startMeeting(room.id)}
                  >
                    {room.isStarted ? '회의 진행 중' : '전체 회의 시작'}
                  </NeoButton>
                  <NeoButton variant="white" onClick={() => startEdit(room)}>설정 수정</NeoButton>
                  <NeoButton variant="danger" onClick={() => stateService.deleteRoom(room.id)}>삭제</NeoButton>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: room.teamCount }).map((_, i) => {
                  const teamParticipants = room.participants.filter(p => p.teamIndex === i);
                  return (
                    <div key={i} className="neo-border-sm p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-xs bg-black text-white px-2 py-0.5">{i + 1}팀</span>
                        <span className="text-xs font-bold">{teamParticipants.length}명</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {teamParticipants.map(p => (
                          <span key={p.id} className="text-[10px] font-bold bg-white neo-border-sm px-1.5 py-0.5">{p.name}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const JoinRoomScreen = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [step, setStep] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => setRooms(stateService.getState().rooms);
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleJoin = () => {
    if (!selectedRoomId || selectedTeamIndex === null || !userName) {
      alert('모든 정보를 입력해주세요.');
      return;
    }
    const participantId = stateService.joinRoom(selectedRoomId, selectedTeamIndex, userName);
    navigate(`/room/${selectedRoomId}/${participantId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white neo-border neo-shadow p-8 w-full max-w-md space-y-8">
        <h2 className="text-3xl font-black border-b-4 border-black pb-2 uppercase italic">Join</h2>
        
        {step === 1 && (
          <div className="space-y-6">
            <label className="block font-black mb-2">과정 선택</label>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {rooms.map(r => (
                <button 
                  key={r.id}
                  onClick={() => { setSelectedRoomId(r.id); setStep(2); }}
                  className="w-full text-left neo-border p-4 font-bold hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
                >
                  <p className="text-lg">{r.name}</p>
                  <p className="text-xs opacity-70">현재 {r.participants.length}명 대기 중</p>
                </button>
              ))}
              {rooms.length === 0 && <p className="text-center text-gray-500 py-4 italic font-bold">진행중인 과정이 없습니다.</p>}
            </div>
          </div>
        )}

        {step === 2 && selectedRoom && (
          <div className="space-y-6">
            <label className="block font-black mb-2">팀 선택 ({selectedRoom.name})</label>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: selectedRoom.teamCount }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => { setSelectedTeamIndex(i); setStep(3); }}
                  className="neo-border p-4 font-black text-xl hover:bg-yellow-400 transition-all hover:-translate-y-1 active:translate-y-0"
                >
                  {i + 1}팀
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="text-sm font-bold text-blue-600 underline">과정 다시 선택</button>
          </div>
        )}

        {step === 3 && selectedRoom && (
          <div className="space-y-6">
            <div className="bg-gray-100 p-4 neo-border-sm mb-4">
              <p className="font-bold text-sm">{selectedRoom.name} > {selectedTeamIndex! + 1}팀</p>
            </div>
            <label className="block font-black mb-2">성함 입력</label>
            <input 
              type="text"
              className="w-full neo-border p-4 font-bold outline-none focus:bg-yellow-50"
              placeholder="본인의 이름을 입력하세요"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            <NeoButton className="w-full py-4 text-xl" onClick={handleJoin}>회의실 입장</NeoButton>
            <button onClick={() => setStep(2)} className="w-full font-bold text-gray-500">팀 다시 선택</button>
          </div>
        )}

        {step === 1 && <button onClick={() => navigate('/')} className="w-full font-bold text-gray-500">홈으로 돌아가기</button>}
      </div>
    </div>
  );
};

const RoomScreen = () => {
  const { roomId, participantId } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [userDraft, setUserDraft] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const update = () => {
      const state = stateService.getState();
      const currentRoom = state.rooms.find(r => r.id === roomId);
      if (!currentRoom) {
        alert('과정이 종료되었습니다.');
        navigate('/');
        return;
      }
      setRoom(currentRoom);
    };
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [roomId, navigate]);

  if (!room) return null;

  const me = room.participants.find(p => p.id === participantId);
  if (!me) return null;

  const handleGetHint = async () => {
    if (!me.roleId) return;
    setAiLoading(true);
    const role = ROLES[me.roleId];
    const prompt = `나는 한수원 모의회의에서 '${role.title}' 역할을 맡았어. 주제는 '발전소 주변 지역주민 상생 축제 기획'이야. 내 캐릭터의 성격과 비밀 미션을 고려해서, 회의 오프닝에서 던질만한 강렬한 첫 마디 3가지를 한국어로 제안해줘.`;
    const result = await getAIFeedback(prompt);
    setAiResponse(result);
    setAiLoading(false);
  };

  const handleCheckMission = async () => {
    if (!me.roleId || !userDraft) return;
    setAiLoading(true);
    const role = ROLES[me.roleId];
    const prompt = `나는 '${role.title}' 역할을 수행 중이야. 내 미션은 '${role.mission}'이야. 내가 회의에서 "${userDraft}"라고 말하려고 하는데, 내 역할과 미션에 얼마나 잘 맞는지 평가해주고, 더 캐릭터의 특징(말투 등)이 살아나도록 수정 제안을 해줘.`;
    const result = await getAIFeedback(prompt);
    setAiResponse(result);
    setAiLoading(false);
  };

  if (!room.isStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
        <div className="bg-white neo-border neo-shadow p-12 text-center max-w-lg w-full">
          <div className="animate-spin text-5xl mb-6 inline-block">⏳</div>
          <h2 className="text-3xl font-black mb-4">회의 대기 중</h2>
          <div className="space-y-1 mb-8">
            <p className="font-black text-blue-600">{room.name}</p>
            <p className="font-black text-xl">{me.teamIndex + 1}팀 멤버들이 모이고 있습니다.</p>
          </div>
          <div className="bg-gray-50 neo-border-sm p-4 text-left">
            <p className="font-black mb-2">팀원 목록</p>
            <div className="flex flex-wrap gap-2">
              {room.participants.filter(p => p.teamIndex === me.teamIndex).map(p => (
                <span key={p.id} className={`px-2 py-1 text-sm font-bold neo-border-sm ${p.id === participantId ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <NeoButton variant="danger" onClick={() => navigate('/')}>나가기</NeoButton>
      </div>
    );
  }

  const myRole = me.roleId ? ROLES[me.roleId] : null;

  return (
    <div className="min-h-screen bg-[#DFE7FD] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white neo-border neo-shadow p-6 gap-4">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-black text-white px-2 py-0.5 text-xs font-black">{me.teamIndex + 1}팀</span>
              <h1 className="text-xl font-black">{room.name}</h1>
            </div>
            <p className="font-bold text-red-500">주제: 발전소 주변 지역주민 상생 축제 기획</p>
          </div>
          <Timer 
            startTime={room.startTime!} 
            durationMinutes={room.duration} 
            onEnd={() => alert('회의 시간이 종료되었습니다! 결과물을 정리해 주세요.')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-2xl font-black text-center bg-yellow-400 neo-border px-6 py-2 inline-block -rotate-1">당신의 비밀 카드</h2>
            {myRole && <RoleCard role={myRole} participantName={me.name} />}
          </div>

          <div className="space-y-6">
            <div className="bg-white neo-border neo-shadow p-6">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <span>🤖</span> AI 회의 어시스턴트
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <NeoButton variant="success" className="text-xs flex-1" onClick={handleGetHint} disabled={aiLoading}>
                    {aiLoading ? '분석 중...' : '오프닝 멘트 추천'}
                  </NeoButton>
                </div>
                
                <textarea 
                  className="w-full neo-border-sm p-3 font-bold text-sm outline-none h-24 focus:bg-blue-50"
                  placeholder="내가 회의에서 하고 싶은 말을 여기에 적어보세요..."
                  value={userDraft}
                  onChange={(e) => setUserDraft(e.target.value)}
                />
                
                <NeoButton variant="primary" className="text-xs w-full" onClick={handleCheckMission} disabled={aiLoading || !userDraft}>
                  {aiLoading ? '검토 중...' : '내 발언 미션 적합도 체크'}
                </NeoButton>

                {aiResponse && (
                  <div className="bg-blue-50 neo-border-sm p-4 text-xs font-bold leading-relaxed whitespace-pre-wrap">
                    <p className="text-blue-600 mb-2 border-b border-blue-200 pb-1">AI의 조언:</p>
                    {aiResponse}
                  </div>
                )}
              </div>
            </div>

            <OrgChart participants={room.participants.filter(p => p.teamIndex === me.teamIndex)} />
          </div>
        </div>
        
        <div className="bg-white neo-border neo-shadow p-8 mt-12 space-y-6">
          <h3 className="text-2xl font-black border-b-4 border-black pb-2 inline-block">공통 규칙</h3>
          <ul className="space-y-4">
            <li className="flex gap-4 items-start">
              <span className="bg-black text-white px-2 neo-border-sm font-black">1</span>
              <p className="font-bold">자신의 '비밀 역할'을 들키지 않으면서 미션을 수행해야 합니다.</p>
            </li>
            <li className="flex gap-4 items-start">
              <span className="bg-black text-white px-2 neo-border-sm font-black">2</span>
              <p className="font-bold">직급과 관계없이 주어진 역할에 몰입하여 발언하세요.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/admin-login" element={<AdminLoginScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/join" element={<JoinRoomScreen />} />
        <Route path="/room/:roomId/:participantId" element={<RoomScreen />} />
      </Routes>
    </HashRouter>
  );
}


import React, { useState } from 'react';
import { RoleData } from '../types';

interface RoleCardProps {
  role: RoleData;
  participantName: string;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, participantName }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const publicName = role.publicProfile.replace('[이름]', participantName);

  return (
    <div 
      className="w-full max-w-[340px] h-[580px] perspective-1000 cursor-pointer mx-auto"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden neo-border neo-shadow bg-blue-600 flex flex-col items-center justify-center p-8 text-white">
          <div className="text-7xl mb-8 animate-bounce">?</div>
          <h2 className="text-3xl font-black mb-4">나의 비밀 역할</h2>
          <p className="text-lg font-bold opacity-80">카드를 터치하세요</p>
          <div className="mt-12 bg-black text-white px-4 py-2 neo-border-sm font-bold tracking-widest">
            STRICTLY CONFIDENTIAL
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden neo-border neo-shadow bg-white rotate-y-180 flex flex-col p-4 overflow-y-auto">
          <div className="flex justify-between items-start mb-3">
            <span className="text-4xl">{role.emoji}</span>
            <div className="text-right">
              <div className="bg-black text-white px-2 py-0.5 text-[10px] font-bold neo-border-sm mb-1 uppercase tracking-tighter">Secret Intelligence</div>
              <div className="text-xs font-black uppercase text-blue-600">{role.id}</div>
            </div>
          </div>

          <h3 className="text-2xl font-black mb-1 text-black leading-tight">{role.title}</h3>
          <p className="text-xs italic text-gray-500 mb-4 font-bold leading-tight">{role.intro}</p>

          <div className="space-y-3 text-left">
            <section className="bg-blue-50 p-3 neo-border-sm">
              <h4 className="text-xs font-black text-blue-600 mb-1 border-b border-blue-200 inline-block">[공개] 프로필</h4>
              <p className="text-sm font-bold">{publicName}</p>
            </section>

            <section className="bg-yellow-50 p-3 neo-border-sm border-yellow-400">
              <h4 className="text-xs font-black text-yellow-700 mb-1 border-b border-yellow-200 inline-block">[비밀] 당신의 역할</h4>
              <p className="text-xs font-bold leading-snug">{role.secretRole}</p>
            </section>

            <section className="bg-red-50 p-3 neo-border-sm border-red-400">
              <h4 className="text-xs font-black text-red-700 mb-1 border-b border-red-200 inline-block">🔥 미션</h4>
              <p className="text-xs font-black leading-snug">{role.mission}</p>
            </section>

            <section className="bg-gray-50 p-3 neo-border-sm">
              <h4 className="text-xs font-black text-gray-700 mb-2 border-b border-gray-200 inline-block">🎤 실전 대사 가이드</h4>
              <div className="space-y-2">
                {role.guides.map((g, idx) => (
                  <div key={idx} className="text-[11px] leading-tight">
                    <span className="font-black text-blue-600 block mb-0.5">• {g.category}</span>
                    <span className="font-medium text-gray-800 italic">"{g.text}"</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 text-center">
            <p className="text-[10px] font-bold text-gray-400">내용을 확인했다면 다시 터치하여 숨기세요</p>
          </div>
        </div>

      </div>
    </div>
  );
};


import React from 'react';
import { Participant, RoleType } from '../types';
import { ROLES } from '../constants';

interface OrgChartProps {
  participants: Participant[];
  currentParticipantId?: string;
}

export const OrgChart: React.FC<OrgChartProps> = ({ participants, currentParticipantId }) => {
  // Sort participants by hierarchy level
  const sorted = [...participants].sort((a, b) => {
    const levelA = a.roleId ? ROLES[a.roleId].hierarchyLevel : 99;
    const levelB = b.roleId ? ROLES[b.roleId].hierarchyLevel : 99;
    return levelA - levelB;
  });

  // Group by levels
  const levels: Record<number, Participant[]> = {};
  sorted.forEach(p => {
    const level = p.roleId ? ROLES[p.roleId].hierarchyLevel : 99;
    if (!levels[level]) levels[level] = [];
    levels[level].push(p);
  });

  const levelKeys = Object.keys(levels).sort();

  return (
    <div className="w-full mt-8 bg-white neo-border neo-shadow p-4">
      <h3 className="text-xl font-black mb-4 text-center border-b-2 border-black pb-1 inline-block">팀 조직도</h3>
      <div className="flex flex-col items-center space-y-4">
        {levelKeys.map((levelStr, idx) => {
          const level = parseInt(levelStr);
          return (
            <div key={level} className="w-full flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-2">
                {levels[level].map(p => {
                  const role = p.roleId ? ROLES[p.roleId] : null;
                  const isMe = p.id === currentParticipantId;
                  return (
                    <div
                      key={p.id}
                      className={`neo-border-sm p-1.5 min-w-[90px] text-center ${
                        isMe
                          ? 'bg-yellow-400 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105'
                          : 'bg-blue-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]'
                      }`}
                    >
                      <div className={`text-sm font-black leading-tight ${isMe ? 'text-black' : 'text-black'}`}>
                        {p.name} {isMe && '(나)'}
                      </div>
                      <div className={`text-[10px] font-bold leading-tight ${isMe ? 'text-black' : 'text-blue-600'}`}>
                        {role?.rank || '미정'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {idx < levelKeys.length - 1 && (
                <div className="h-4 w-0.5 bg-black mt-3"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

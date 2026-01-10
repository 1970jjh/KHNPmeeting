
import React from 'react';
import { Participant, RoleType } from '../types';
import { ROLES } from '../constants';

interface OrgChartProps {
  participants: Participant[];
}

export const OrgChart: React.FC<OrgChartProps> = ({ participants }) => {
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
                  return (
                    <div key={p.id} className="bg-blue-50 neo-border-sm p-1.5 min-w-[90px] text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                      <div className="text-sm font-black text-black leading-tight">{p.name}</div>
                      <div className="text-[10px] font-bold text-blue-600 leading-tight">{role?.rank || '미정'}</div>
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

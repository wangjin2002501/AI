import React from 'react';
import { IdentificationResult, IdentificationCategory } from '../types';

interface ResultCardProps {
  result: IdentificationResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const isPerson = result.category === IdentificationCategory.PERSON;
  
  // Theme colors based on category
  const headerColor = isPerson ? 'bg-orange-500' : 'bg-primary';
  const textColor = isPerson ? 'text-orange-700' : 'text-green-800';
  const bgColor = isPerson ? 'bg-orange-50' : 'bg-green-50';

  return (
    <div className={`w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl bg-white animate-fade-in-up`}>
      <div className={`${headerColor} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">{result.name}</h2>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80 border border-white/30 px-2 py-1 rounded">
            {isPerson ? '警告' : '识别成功'}
          </span>
        </div>
        {result.scientificName && (
          <p className="mt-1 text-sm italic opacity-90">{result.scientificName}</p>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${textColor} mb-2`}>
            {isPerson ? '生物特征' : '简介'}
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {result.description}
          </p>
        </div>

        {!isPerson && result.careTips && result.careTips.length > 0 && (
          <div className={`${bgColor} p-4 rounded-xl border border-opacity-50 border-green-200`}>
            <h3 className={`text-sm font-semibold uppercase tracking-wide ${textColor} mb-3 flex items-center gap-2`}>
              <span>🌱</span> 养护建议
            </h3>
            <ul className="space-y-2">
              {result.careTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isPerson && result.funFact && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
             <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-800 mb-2 flex items-center gap-2">
              <span>💡</span> 冷知识
            </h3>
            <p className="text-gray-700 text-sm italic">
              "{result.funFact}"
            </p>
          </div>
        )}

        <button
          onClick={onReset}
          className="w-full mt-4 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          识别下一张
        </button>
      </div>
    </div>
  );
};

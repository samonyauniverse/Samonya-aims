import React from 'react';
import { LEGAL_CONTENT } from '../constants';

interface LegalModalProps {
  type: keyof typeof LEGAL_CONTENT | null;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
           <h2 className="text-xl font-bold text-gray-800">Legal Information</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-2xl">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto whitespace-pre-wrap leading-relaxed text-gray-700">
           {LEGAL_CONTENT[type].split('\n').map((line, i) => {
             if (line.startsWith('##')) return <h3 key={i} className="text-lg font-bold text-brand-blue mb-3 mt-4">{line.replace('##', '')}</h3>;
             if (line.startsWith('**')) return <p key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</p>;
             return <p key={i} className="mb-2" dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}} />;
           })}
        </div>
        <div className="p-4 border-t border-gray-100 text-right">
          <button onClick={onClose} className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
import React, { useState, useEffect } from 'react';
import { generateToolContent } from '../services/geminiService';
import { ToolConfig, SubscriptionTier } from '../types';
import { CREDIT_COSTS } from '../constants';

interface ToolLayoutProps {
  tool: ToolConfig;
  inputs: { 
    label: string; 
    name: string; 
    type: 'text' | 'textarea' | 'select' | 'file' | 'checkbox'; 
    options?: string[]; 
    placeholder?: string 
  }[];
  onBack: () => void;
  onRequestUpgrade: () => void;
  credits: number;
  onSpendCredits: (amount: number, description: string) => boolean;
  userTier: SubscriptionTier;
  clientMemory?: Record<string, string>;
  onSuccess?: (data: Record<string, string>) => void;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({ 
  tool, 
  inputs, 
  onBack, 
  onRequestUpgrade, 
  credits,
  onSpendCredits,
  userTier,
  clientMemory = {},
  onSuccess
}) => {
  // Initialize form data with client memory if matches common fields
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fileAttachment, setFileAttachment] = useState<string | undefined>(undefined);
  const [generateVisual, setGenerateVisual] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('txt');

  const isFreeTier = userTier === 'FREE';

  useEffect(() => {
    // Auto-fill form based on memory
    const newFormData = { ...formData };
    let hasUpdates = false;
    inputs.forEach(input => {
      // Map common memory keys to input names loosely
      if (input.name.toLowerCase().includes('business') && clientMemory['businessName']) {
        newFormData[input.name] = clientMemory['businessName'];
        hasUpdates = true;
      }
      if (input.name.toLowerCase().includes('industry') && clientMemory['industry']) {
        newFormData[input.name] = clientMemory['industry'];
        hasUpdates = true;
      }
      if (input.name.toLowerCase().includes('audience') && clientMemory['targetAudience']) {
        newFormData[input.name] = clientMemory['targetAudience'];
        hasUpdates = true;
      }
    });
    if (hasUpdates) {
      setFormData(prev => ({ ...prev, ...newFormData }));
    }
  }, [tool.id]);

  useEffect(() => {
    // Calculate base cost
    let cost = CREDIT_COSTS[tool.id as keyof typeof CREDIT_COSTS] || CREDIT_COSTS.DEFAULT;
    if (generateVisual) {
      cost += CREDIT_COSTS.IMAGE_GENERATION_SURCHARGE;
    }
    setEstimatedCost(cost);
  }, [tool.id, generateVisual]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    
    if (type === 'checkbox') {
      setGenerateVisual((e.target as HTMLInputElement).checked);
      return;
    }

    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFileAttachment(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credits < estimatedCost) {
      onRequestUpgrade();
      return;
    }

    const success = onSpendCredits(estimatedCost, `Generated content with ${tool.name}`);
    if (!success) return; 

    setIsGenerating(true);
    setResult(null);
    
    try {
      const generated = await generateToolContent(tool.name, formData, fileAttachment, generateVisual);
      if (onSuccess) {
        onSuccess(formData);
      }
      setResult(generated);
    } catch (error) {
      setResult("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (isFreeTier) {
      onRequestUpgrade();
      return;
    }
    
    if (!result) return;

    let contentToDownload = result;
    
    // Simulate File Formats and Structure
    if (downloadFormat === 'mp3') {
        contentToDownload = `[SAMONYA AI AUDIO SCRIPT]\n[FORMAT: MP3]\n\n${result}`;
    } else if (downloadFormat === 'pdf') {
        contentToDownload = `[SAMONYA AI BUSINESS DOCUMENT]\n\n${result}`;
    }

    // Append watermark text if strictly needed (though free tier blocked above, safe to have)
    if (isFreeTier) {
        contentToDownload += "\n\n(Watermark: Created by Samonya AIMS Market – Upgrade to remove)";
    }

    const lines = contentToDownload.split('\n');
    const textLines: string[] = [];
    
    const downloadBlob = (blob: Blob, filename: string) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };

    lines.forEach(line => {
      if (line.includes('IMAGE_BASE64:')) {
        try {
          const base64Part = line.split('IMAGE_BASE64:')[1].trim();
          const mimeMatch = base64Part.match(/data:(.*?);base64/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
          
          const byteCharacters = atob(base64Part.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          
          downloadBlob(blob, `Samonya_${tool.name.replace(/\s+/g, '_')}_Image_${Date.now()}.png`);
        } catch (e) {
          console.error("Error downloading image", e);
        }
      } else {
        textLines.push(line);
      }
    });

    const textContent = textLines.join('\n').trim();
    if (textContent.length > 0) {
      const mimeType = downloadFormat === 'json' ? 'application/json' : 'text/plain';
      const blob = new Blob([textContent], { type: mimeType });
      const ext = downloadFormat;
      downloadBlob(blob, `Samonya_${tool.name.replace(/\s+/g, '_')}_Content_${Date.now()}.${ext}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-500 dark:text-gray-400 hover:text-brand-orange transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>

        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
           <span className="text-gray-500 dark:text-gray-400 text-sm mr-2">Balance:</span>
           <span className={`font-bold ${credits < estimatedCost ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{credits} Credits</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit transition-colors duration-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white ${tool.color}`}>
              {tool.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {inputs.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    required={true}
                    value={formData[field.name] || ''}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none transition-all"
                    onChange={handleInputChange}
                  />
                ) : field.type === 'select' ? (
                  <select
                    name={field.name}
                    required={true}
                    value={formData[field.name] || ''}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Select an option</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'file' ? (
                  <input 
                    type="file"
                    name={field.name}
                    accept="image/*,audio/*,video/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none bg-gray-50"
                  />
                ) : field.type === 'checkbox' ? (
                   <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                     <input
                       type="checkbox"
                       name={field.name}
                       id={field.name}
                       onChange={handleInputChange}
                       className="w-5 h-5 text-brand-orange rounded focus:ring-brand-orange border-gray-300 dark:border-gray-500"
                     />
                     <label htmlFor={field.name} className="text-gray-700 dark:text-gray-300 font-medium cursor-pointer select-none">
                       {field.label}
                     </label>
                   </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    required={true}
                    value={formData[field.name] || ''}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
            
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">Cost for this generation:</span>
              <span className="font-bold text-gray-900 dark:text-white">{estimatedCost} Credits</span>
            </div>

            <button
              type="submit"
              disabled={isGenerating || credits < estimatedCost}
              className={`w-full py-3 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : credits < estimatedCost
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-brand-orange hover:bg-orange-700 hover:shadow-orange-500/20'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : credits < estimatedCost ? (
                `Insufficient Credits (${credits}/${estimatedCost})`
              ) : (
                "Generate Content"
              )}
            </button>
            {credits < estimatedCost && (
                <p onClick={onRequestUpgrade} className="text-center text-xs text-brand-blue dark:text-blue-400 cursor-pointer hover:underline mt-2">
                    Deposit more credits to continue
                </p>
            )}
          </form>
        </div>

        {/* Output Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 min-h-[500px] flex flex-col relative transition-colors duration-200">
           <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
             <svg className="w-5 h-5 mr-2 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
             Generated Result
           </h3>
           
           <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner overflow-y-auto whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed font-sans text-sm md:text-base">
             {result ? (
               <>
                {result.split('\n').map((line, i) => {
                 if (line.includes('IMAGE_BASE64:')) {
                    const imgSrc = line.replace('IMAGE_BASE64:', '').trim();
                    return (
                        <div key={i} className="my-6 flex flex-col items-center">
                            <img 
                                src={imgSrc} 
                                className="w-full max-w-[300px] md:max-w-[400px] rounded-lg shadow-xl border border-gray-200 dark:border-gray-600" 
                                alt="AI Generated Output" 
                            />
                            <p className="text-xs text-gray-400 mt-2">AI Generated Concept</p>
                            {isFreeTier && (
                                <p className="text-red-400 text-xs font-bold mt-1 uppercase opacity-50">Watermarked Preview</p>
                            )}
                        </div>
                    );
                 }
                 if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-brand-blue dark:text-blue-400 mt-4 mb-2">{line.replace('###', '')}</h3>;
                 if (line.startsWith('**')) return <h4 key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</h4>;
                 if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                 return <p key={i} className="mb-2">{line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').split('<b>').map((part, idx) => idx % 2 === 1 ? <b key={idx}>{part}</b> : part)}</p>;
               })}
               {isFreeTier && (
                   <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center select-none opacity-50">
                       <p className="text-gray-300 dark:text-gray-600 text-sm font-bold uppercase tracking-widest">Created by Samonya AIMS Market – Upgrade to remove watermark</p>
                   </div>
               )}
               </>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                 <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 flex items-center justify-center">
                    <span className="text-3xl">✨</span>
                 </div>
                 <p>AI Output will appear here</p>
               </div>
             )}
           </div>

           {result && (
             <div className="mt-4 flex flex-col space-y-3">
               <div className="flex space-x-3">
                  <select 
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-brand-orange outline-none"
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    disabled={isFreeTier}
                  >
                      <option value="txt">Download as .TXT (Text)</option>
                      <option value="pdf">Download as .PDF (Doc)</option>
                      <option value="mp3">Download as .MP3 (Audio)</option>
                      <option value="json">Download as .JSON (Data)</option>
                  </select>
                   <button 
                    onClick={handleDownload}
                    disabled={isFreeTier}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                      isFreeTier 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700' 
                        : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-black dark:hover:bg-gray-600'
                    }`}
                    title={isFreeTier ? "Upgrade to download high-res content" : "Download your content"}
                   >
                     {isFreeTier ? (
                       <>
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                         Locked
                       </>
                     ) : (
                       <>
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                         Download {downloadFormat.toUpperCase()}
                       </>
                     )}
                   </button>
               </div>
               {isFreeTier && (
                   <p className="text-xs text-red-500 dark:text-red-400 text-center font-semibold">Downloads are locked in Free Tier. Please upgrade to export content.</p>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
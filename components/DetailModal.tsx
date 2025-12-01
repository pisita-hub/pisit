import React, { useState, useEffect, useRef } from 'react';
import { ActivityDetail } from '../types';
import { X, CheckCircle, Music, Target, ClipboardList, Wallet, BarChart, Pencil, Save, RotateCcw, Sparkles, Share2, Bookmark, Copy, Send, Wand2 } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ActivityDetail | null;
  isLoading: boolean;
  onUpdate: (detail: ActivityDetail) => void;
  onToggleSave: (detail: ActivityDetail) => void;
  isSaved: boolean;
  onRefine: (current: ActivityDetail, instruction: string) => Promise<ActivityDetail>;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, detail, isLoading, onUpdate, onToggleSave, isSaved, onRefine }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ActivityDetail | null>(null);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  
  // Refinement State
  const [refineInput, setRefineInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (detail) {
      setFormData(detail);
      setRefineInput(''); // Clear input when opening new detail
    }
  }, [detail]);

  const handleSave = () => {
    if (formData) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (detail) {
      setFormData(detail);
    }
    setIsEditing(false);
  };

  const handleChange = (field: keyof ActivityDetail, value: any) => {
     if (!formData) return;
     setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (field: keyof ActivityDetail, value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value.split('\n') });
  };

  const handleRefineSubmit = async () => {
    if (!refineInput.trim() || !formData) return;
    
    setIsRefining(true);
    try {
        const refined = await onRefine(formData, refineInput);
        setFormData(refined);
        setRefineInput('');
        setIsEditing(true); // Automatically switch to edit mode so user sees it's modified and can save/cancel
        
        // Optional: Scroll to top to see changes
        // window.scrollTo(0,0);
    } catch (e) {
        console.error("Refinement failed", e);
        // Could show error state here
    } finally {
        setIsRefining(false);
    }
  };

  const handleShare = async () => {
    if (!formData) return;

    const shareText = `
🎵 *${formData.title}*
📝 ${formData.fullDescription}

🎯 *วัตถุประสงค์:*
${formData.objectives.map(o => `- ${o}`).join('\n')}

📋 *ขั้นตอน:*
${formData.stepByStepPlan.map((s, i) => `${i+1}. ${s}`).join('\n')}

🛠 *อุปกรณ์:*
${formData.requiredEquipment.join(', ')}

สร้างโดย: Music Connect
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: formData.title,
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-indigo-50/50">
            <div className="flex-1 mr-4">
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-6 w-3/4 bg-indigo-200/50 rounded"></div>
                        <div className="h-4 w-1/3 bg-indigo-100 rounded"></div>
                    </div>
                ) : isEditing && formData ? (
                    <div>
                        <label className="text-xs text-indigo-600 font-semibold uppercase mb-1 block">ชื่อกิจกรรม</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="text-xl font-bold text-gray-900 w-full bg-white border border-indigo-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {detail?.title}
                        </h2>
                        <span className="text-sm text-indigo-600 font-medium">แผนการจัดกิจกรรมฉบับสมบูรณ์</span>
                    </>
                )}
            </div>
            
            <div className="flex items-center gap-2">
                {!isLoading && formData && !isEditing && (
                  <>
                     <button
                        onClick={() => onToggleSave(formData)}
                        className={`p-2 rounded-full transition-colors ${
                          isSaved 
                            ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' 
                            : 'hover:bg-gray-100 text-gray-400 hover:text-indigo-600'
                        }`}
                        title={isSaved ? "บันทึกแล้ว" : "บันทึกเก็บไว้"}
                     >
                        <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                     </button>
                     
                     <button
                        onClick={handleShare}
                        className="p-2 rounded-full hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 transition-colors relative"
                        title="แชร์"
                     >
                        {showCopyFeedback ? <Copy size={20} className="text-green-600" /> : <Share2 size={20} />}
                     </button>
                  </>
                )}

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                {!isLoading && detail && (
                    !isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors"
                            title="แก้ไขข้อมูล"
                        >
                            <Pencil size={20} />
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                                title="บันทึกการแก้ไข"
                            >
                                <Save size={20} />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                                title="ยกเลิกการแก้ไข"
                            >
                                <RotateCcw size={20} />
                            </button>
                        </>
                    )
                )}
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32">
          {isLoading ? (
            <div className="animate-pulse space-y-8">
               {/* Loading Message */}
               <div className="flex items-center gap-3 justify-center py-4 text-indigo-600 bg-indigo-50 rounded-lg">
                  <Sparkles className="animate-spin" size={20} />
                  <span className="font-medium">AI กำลังวิเคราะห์และร่างข้อเสนอโครงการ...</span>
               </div>

               {/* Description Skeleton */}
               <div className="space-y-3">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                 </div>
                 <div className="h-24 w-full bg-gray-100 rounded-xl border border-gray-200"></div>
               </div>
             
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Objectives Skeleton */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                       <div className="h-6 w-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div>
                          <div className="h-4 w-full bg-gray-100 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Audience Skeleton */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                       <div className="h-6 w-40 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-32 w-full bg-gray-100 rounded-xl"></div>
                  </div>
               </div>
             
               {/* Steps Skeleton */}
               <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-40 bg-gray-200 rounded"></div>
                 </div>
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                      <div className="h-16 w-full bg-gray-100 rounded-lg border border-gray-200"></div>
                   </div>
                 ))}
               </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
                     </div>
                     <div className="space-y-3">
                        <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
                     </div>
                </div>
             </div>
          ) : formData ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Full Description */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Music className="text-indigo-500" /> รายละเอียดโดยย่อ
                </h3>
                {isEditing ? (
                    <textarea
                        value={formData.fullDescription}
                        onChange={(e) => handleChange('fullDescription', e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px] text-gray-700"
                    />
                ) : (
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {formData.fullDescription}
                    </p>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Objectives */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="text-red-500" /> วัตถุประสงค์
                    </h3>
                    {isEditing ? (
                         <div className="space-y-2">
                            <span className="text-xs text-gray-500">พิมพ์แต่ละข้อแยกบรรทัดกัน</span>
                            <textarea
                                value={formData.objectives.join('\n')}
                                onChange={(e) => handleArrayChange('objectives', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[150px] text-gray-700"
                            />
                         </div>
                    ) : (
                        <ul className="space-y-2">
                            {formData.objectives.map((obj, i) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                                    <span>{obj}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Target Audience Detail */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BarChart className="text-blue-500" /> วิเคราะห์กลุ่มเป้าหมาย
                    </h3>
                    {isEditing ? (
                         <textarea
                            value={formData.targetAudienceDetail}
                            onChange={(e) => handleChange('targetAudienceDetail', e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 min-h-[150px] text-gray-700"
                        />
                    ) : (
                        <div className="text-gray-700 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm">
                            {formData.targetAudienceDetail}
                        </div>
                    )}
                </section>
              </div>

              {/* Step by Step Plan */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="text-amber-500" /> ขั้นตอนการดำเนินงาน
                </h3>
                {isEditing ? (
                    <div className="space-y-2">
                         <span className="text-xs text-gray-500">พิมพ์แต่ละขั้นตอนแยกบรรทัดกัน</span>
                         <textarea
                            value={formData.stepByStepPlan.join('\n')}
                            onChange={(e) => handleArrayChange('stepByStepPlan', e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[200px] text-gray-700 font-mono text-sm"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.stepByStepPlan.map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex-1 text-gray-700">
                                    {step}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Equipment */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Music className="text-purple-500" /> อุปกรณ์ที่ต้องใช้
                    </h3>
                     {isEditing ? (
                         <div className="space-y-2">
                            <span className="text-xs text-gray-500">พิมพ์แต่ละรายการแยกบรรทัดกัน</span>
                            <textarea
                                value={formData.requiredEquipment.join('\n')}
                                onChange={(e) => handleArrayChange('requiredEquipment', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-gray-700"
                            />
                         </div>
                    ) : (
                        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                            {formData.requiredEquipment.map((eq, i) => (
                                <li key={i}>{eq}</li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Budget & Evaluation */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Wallet className="text-emerald-500" /> งบประมาณ
                        </h3>
                        {isEditing ? (
                             <input 
                                type="text" 
                                value={formData.budgetEstimate} 
                                onChange={(e) => handleChange('budgetEstimate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                            />
                        ) : (
                            <p className="text-gray-700 font-medium">{formData.budgetEstimate}</p>
                        )}
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <CheckCircle className="text-teal-500" /> การวัดผล
                        </h3>
                        {isEditing ? (
                            <div className="space-y-2">
                                <span className="text-xs text-gray-500">พิมพ์แต่ละข้อแยกบรรทัดกัน</span>
                                <textarea
                                    value={formData.evaluationMetrics.join('\n')}
                                    onChange={(e) => handleArrayChange('evaluationMetrics', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-gray-700"
                                />
                            </div>
                        ) : (
                            <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                                {formData.evaluationMetrics.map((em, i) => (
                                    <li key={i}>{em}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
              </div>
              
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>
          )}
        </div>

        {/* AI Refinement Bar */}
        {!isLoading && formData && (
          <div className="border-t border-gray-800 bg-slate-900 p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
                    <Wand2 size={16} /> <span>ให้ AI ช่วยปรับแก้ข้อมูล (AI Refinement)</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={refineInput}
                        onChange={(e) => setRefineInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
                        placeholder="เช่น 'ลดงบประมาณ', 'เปลี่ยนกลุ่มเป้าหมาย', 'เพิ่มกิจกรรมช่วงบ่าย'..."
                        disabled={isRefining}
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-white placeholder-slate-400 disabled:opacity-50"
                    />
                    <button
                        onClick={handleRefineSubmit}
                        disabled={isRefining || !refineInput.trim()}
                        className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRefining ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
                    </button>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;
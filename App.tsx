import React, { useState, useEffect } from 'react';
import { Music, Users, ArrowRight, Sparkles, BookOpen, Clock, Plus, Bookmark, LayoutGrid, Trash2, PenTool, Send } from 'lucide-react';
import { generateActivityIdeas, generateActivityDetail, generateCustomActivityDetail, refineActivityDetail } from './services/geminiService';
import { ActivitySummary, ActivityDetail, TargetGroup, TARGET_GROUPS, SavedActivity } from './types';
import DetailModal from './components/DetailModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'saved'>('discover');
  
  // Discover State
  const [selectedTarget, setSelectedTarget] = useState<TargetGroup | null>(null);
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom Generate State
  const [customPrompt, setCustomPrompt] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  // Saved State
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ActivityDetail | null>(null);

  // Initialize saved activities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('music-connect-saved');
    if (saved) {
      try {
        setSavedActivities(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved activities');
      }
    }
  }, []);

  const handleGenerate = async (target: TargetGroup) => {
    setSelectedTarget(target);
    setLoading(true);
    setError(null);
    setActivities([]);

    try {
      const ideas = await generateActivityIdeas(target);
      setActivities(ideas);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสร้างไอเดีย กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!selectedTarget) return;
    setLoadingMore(true);
    setError(null);

    try {
      // Pass existing titles to avoid duplicates
      const existingTitles = activities.map(a => a.title);
      const newIdeas = await generateActivityIdeas(selectedTarget, existingTitles);
      setActivities(prev => [...prev, ...newIdeas]);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลเพิ่มเติม');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) return;
    setCustomLoading(true);
    setError(null);
    setSelectedDetail(null);
    setIsModalOpen(true);
    setModalLoading(true);

    try {
        const detail = await generateCustomActivityDetail(customPrompt);
        setSelectedDetail(detail);
        setCustomPrompt(''); // Clear input after success
    } catch (err) {
        setError('เกิดข้อผิดพลาดในการสร้างแผนงาน');
        setIsModalOpen(false); // Close modal if error
    } finally {
        setCustomLoading(false);
        setModalLoading(false);
    }
  };

  const handleViewDetail = async (activity: ActivitySummary) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setSelectedDetail(null);
    
    try {
        if (!selectedTarget) throw new Error("No target selected");
        const detail = await generateActivityDetail(activity.title, selectedTarget);
        setSelectedDetail(detail);
    } catch (err) {
        // Error inside modal handled by UI state
    } finally {
        setModalLoading(false);
    }
  };

  const handleViewSavedDetail = (saved: SavedActivity) => {
    setSelectedDetail(saved);
    setIsModalOpen(true);
    setModalLoading(false);
  };

  const handleUpdateDetail = (updatedDetail: ActivityDetail) => {
    setSelectedDetail(updatedDetail);
    
    // If we are updating a saved activity, update it in storage too
    const existingIndex = savedActivities.findIndex(s => s.title === updatedDetail.title);
    if (existingIndex !== -1) {
       const updatedList = [...savedActivities];
       updatedList[existingIndex] = { ...updatedList[existingIndex], ...updatedDetail };
       setSavedActivities(updatedList);
       localStorage.setItem('music-connect-saved', JSON.stringify(updatedList));
    }
  };

  const handleRefineActivity = async (current: ActivityDetail, instruction: string) => {
     return await refineActivityDetail(current, instruction);
  };

  const handleToggleSave = (detail: ActivityDetail) => {
    const existingIndex = savedActivities.findIndex(s => s.title === detail.title);
    
    let newSavedList: SavedActivity[];
    
    if (existingIndex !== -1) {
      // Remove
      newSavedList = savedActivities.filter((_, i) => i !== existingIndex);
    } else {
      // Add
      const targetLabel = selectedTarget 
        ? TARGET_GROUPS.find(t => t.id === selectedTarget)?.label 
        : 'ปรับแต่งเอง';

      const newActivity: SavedActivity = {
        ...detail,
        id: Date.now().toString(),
        savedAt: Date.now(),
        targetGroupLabel: targetLabel
      };
      newSavedList = [newActivity, ...savedActivities];
    }

    setSavedActivities(newSavedList);
    localStorage.setItem('music-connect-saved', JSON.stringify(newSavedList));
  };
  
  const handleDeleteSaved = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const newSavedList = savedActivities.filter(a => a.id !== id);
      setSavedActivities(newSavedList);
      localStorage.setItem('music-connect-saved', JSON.stringify(newSavedList));
  }

  // Check if currently viewed detail is saved
  const isCurrentDetailSaved = selectedDetail 
    ? savedActivities.some(s => s.title === selectedDetail.title)
    : false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Music size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Music Connect</h1>
              <p className="text-xs text-gray-500">สำหรับนักศึกษาเอกดนตรีสากล</p>
            </div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button
               onClick={() => setActiveTab('discover')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 activeTab === 'discover' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
                <LayoutGrid size={16} /> <span className="hidden sm:inline">ค้นหากิจกรรม</span>
             </button>
             <button
               onClick={() => setActiveTab('saved')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                 activeTab === 'saved' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
                <Bookmark size={16} /> <span className="hidden sm:inline">ที่บันทึกไว้ ({savedActivities.length})</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {activeTab === 'discover' ? (
            <>
                {/* Hero Section */}
                <section className="text-center mb-10 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                    สร้างสรรค์กิจกรรมดนตรี <span className="text-indigo-600">เพื่อชุมชนของคุณ</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    ผู้ช่วย AI สำหรับนักศึกษาดนตรี ช่วยออกแบบกิจกรรม Community Engagement 
                    ให้เหมาะสมกับกลุ่มเป้าหมาย สร้างแรงบันดาลใจ และส่งต่อความสุขผ่านเสียงดนตรี
                </p>
                </section>

                {/* Custom Project Input */}
                <section className="mb-12 max-w-3xl mx-auto">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-indigo-100 flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <div className="absolute left-3 top-3 text-gray-400">
                                <PenTool size={20} />
                            </div>
                            <input 
                                type="text"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
                                placeholder="พิมพ์โจทย์ของคุณ เช่น 'ประกวดดนตรีสากล มัธยมศึกษา งบ 100,000 บาท'"
                                className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={handleCustomGenerate}
                            disabled={customLoading || !customPrompt.trim()}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                        >
                            {customLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <><Send size={18} /> สร้างแผนงาน</>
                            )}
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        💡 เคล็ดลับ: ระบุงบประมาณและระยะเวลาที่ต้องการเพื่อให้ได้แผนงานที่แม่นยำที่สุด
                    </p>
                </section>

                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-sm text-gray-400 font-medium">หรือเลือกกลุ่มเป้าหมาย</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Target Selection */}
                <section className="mb-12">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Users size={20} /> เลือกกลุ่มเป้าหมายชุมชน
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {TARGET_GROUPS.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => handleGenerate(group.id)}
                        className={`
                        relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                        hover:shadow-md hover:-translate-y-1
                        ${selectedTarget === group.id 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-white bg-white text-gray-600 hover:border-indigo-200'}
                        `}
                    >
                        <span className="text-3xl mb-2">{group.icon}</span>
                        <span className="font-medium text-sm text-center">{group.label}</span>
                        {selectedTarget === group.id && loading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        )}
                    </button>
                    ))}
                </div>
                </section>

                {/* Results Section */}
                {loading && activities.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-block p-4 rounded-full bg-indigo-50 mb-4 animate-bounce">
                    <Sparkles className="text-indigo-600" size={32} />
                    </div>
                    <p className="text-gray-500 text-lg">AI กำลังระดมสมองคิดกิจกรรมที่น่าสนใจ...</p>
                </div>
                )}

                {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center my-8">
                    {error}
                </div>
                )}

                {!loading && activities.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                    {activities.map((activity, index) => (
                        <div 
                        key={`${activity.id}-${index}`} 
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
                        >
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                            <span className={`
                                px-3 py-1 rounded-full text-xs font-semibold
                                ${activity.difficulty === 'Low' ? 'bg-green-100 text-green-700' : 
                                activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-red-100 text-red-700'}
                            `}>
                                ความยาก: {activity.difficulty}
                            </span>
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                <Clock size={12} /> {activity.duration}
                            </span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{activity.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activity.description}</p>
                            
                            <div className="mt-auto">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {activity.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                    #{tag}
                                </span>
                                ))}
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                    {activity.impactArea}
                                </span>
                                <button 
                                    onClick={() => handleViewDetail(activity)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 group"
                                >
                                    ดูแผนงาน <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>

                    {/* Load More Button */}
                    <div className="flex justify-center pb-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="
                        flex items-center gap-2 px-6 py-3 rounded-full 
                        bg-white border border-indigo-200 text-indigo-600 font-medium
                        hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm
                        disabled:opacity-50 disabled:cursor-not-allowed
                        "
                    >
                        {loadingMore ? (
                        <>
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            กำลังคิดเพิ่ม...
                        </>
                        ) : (
                        <>
                            <Plus size={20} />
                            หากิจกรรมเพิ่มเติม
                        </>
                        )}
                    </button>
                    </div>
                </>
                )}

                {!loading && activities.length === 0 && !selectedTarget && (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                        <p>เลือกกลุ่มเป้าหมายหรือพิมพ์โจทย์ด้านบนเพื่อเริ่มสร้างกิจกรรม</p>
                    </div>
                )}
            </>
        ) : (
            // Saved Activities Tab
            <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Bookmark className="text-indigo-600" /> แผนกิจกรรมของฉัน
                    </h2>
                </div>

                {savedActivities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedActivities.map((activity) => (
                            <div 
                                key={activity.id} 
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col cursor-pointer group"
                                onClick={() => handleViewSavedDetail(activity)}
                            >
                                <div className="p-6 flex-1 flex flex-col relative">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => handleDeleteSaved(e, activity.id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 hover:text-red-700"
                                            title="ลบ"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="mb-3">
                                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            {activity.targetGroupLabel || 'Saved'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{activity.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activity.fullDescription}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                         <span className="text-gray-400 text-xs">
                                            บันทึกเมื่อ: {new Date(activity.savedAt).toLocaleDateString('th-TH')}
                                         </span>
                                         <span className="text-indigo-600 text-sm font-medium flex items-center gap-1">
                                            ดูรายละเอียด <ArrowRight size={16} />
                                         </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <div className="inline-block p-4 rounded-full bg-gray-50 mb-4">
                            <Bookmark size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-1">ยังไม่มีกิจกรรมที่บันทึกไว้</h3>
                        <p className="text-sm">กดไอคอน Bookmark ในหน้าแผนงานเพื่อบันทึกกิจกรรมไว้ดูภายหลัง</p>
                        <button 
                            onClick={() => setActiveTab('discover')}
                            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            ค้นหากิจกรรม
                        </button>
                    </div>
                )}
            </div>
        )}

      </main>
      
      <DetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        detail={selectedDetail}
        isLoading={modalLoading}
        onUpdate={handleUpdateDetail}
        onToggleSave={handleToggleSave}
        isSaved={isCurrentDetailSaved}
        onRefine={handleRefineActivity}
      />
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { Music, Users, ArrowRight, Sparkles, BookOpen, Clock, Plus } from 'lucide-react';
import { generateActivityIdeas, generateActivityDetail } from './services/geminiService';
import { ActivitySummary, ActivityDetail, TargetGroup, TARGET_GROUPS } from './types';
import DetailModal from './components/DetailModal';

const App: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<TargetGroup | null>(null);
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ActivityDetail | null>(null);

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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Hero Section */}
        <section className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            สร้างสรรค์กิจกรรมดนตรี <span className="text-indigo-600">เพื่อชุมชนของคุณ</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            ผู้ช่วย AI สำหรับนักศึกษาดนตรี ช่วยออกแบบกิจกรรม Community Engagement 
            ให้เหมาะสมกับกลุ่มเป้าหมาย สร้างแรงบันดาลใจ และส่งต่อความสุขผ่านเสียงดนตรี
          </p>
        </section>

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
                <p>เลือกกลุ่มเป้าหมายด้านบนเพื่อเริ่มสร้างกิจกรรม</p>
             </div>
        )}
      </main>
      
      <DetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        detail={selectedDetail}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default App;
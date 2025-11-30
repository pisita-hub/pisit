import React from 'react';
import { ActivityDetail } from '../types';
import { X, CheckCircle, Clock, Music, Target, ClipboardList, Wallet, BarChart } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detail: ActivityDetail | null;
  isLoading: boolean;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, detail, isLoading }) => {
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
            <div>
                 <h2 className="text-xl sm:text-2xl font-bold text-gray-900 pr-8">
                    {isLoading ? "กำลังร่างแผนกิจกรรม..." : detail?.title}
                </h2>
                {!isLoading && <span className="text-sm text-indigo-600 font-medium">แผนการจัดกิจกรรมฉบับสมบูรณ์</span>}
            </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">AI กำลังวิเคราะห์ข้อมูลและเขียนข้อเสนอโครงการ...</p>
            </div>
          ) : detail ? (
            <div className="space-y-8">
              {/* Full Description */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Music className="text-indigo-500" /> รายละเอียดโดยย่อ
                </h3>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {detail.fullDescription}
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Objectives */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="text-red-500" /> วัตถุประสงค์
                    </h3>
                    <ul className="space-y-2">
                        {detail.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                                <span>{obj}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Target Audience Detail */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BarChart className="text-blue-500" /> วิเคราะห์กลุ่มเป้าหมาย
                    </h3>
                    <div className="text-gray-700 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm">
                        {detail.targetAudienceDetail}
                    </div>
                </section>
              </div>

              {/* Step by Step Plan */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ClipboardList className="text-amber-500" /> ขั้นตอนการดำเนินงาน
                </h3>
                <div className="space-y-4">
                    {detail.stepByStepPlan.map((step, i) => (
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
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Equipment */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Music className="text-purple-500" /> อุปกรณ์ที่ต้องใช้
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                        {detail.requiredEquipment.map((eq, i) => (
                            <li key={i}>{eq}</li>
                        ))}
                    </ul>
                </section>

                {/* Budget & Evaluation */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Wallet className="text-emerald-500" /> งบประมาณ
                        </h3>
                        <p className="text-gray-700 font-medium">{detail.budgetEstimate}</p>
                    </section>
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <CheckCircle className="text-teal-500" /> การวัดผล
                        </h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                            {detail.evaluationMetrics.map((em, i) => (
                                <li key={i}>{em}</li>
                            ))}
                        </ul>
                    </section>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center text-red-500">ไม่สามารถโหลดข้อมูลได้</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

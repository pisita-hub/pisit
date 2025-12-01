export interface ActivitySummary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: string;
  difficulty: 'Low' | 'Medium' | 'High';
  impactArea: string;
}

export interface ActivityDetail {
  title: string;
  fullDescription: string;
  objectives: string[];
  targetAudienceDetail: string;
  stepByStepPlan: string[];
  requiredEquipment: string[];
  budgetEstimate: string;
  evaluationMetrics: string[];
}

export interface SavedActivity extends ActivityDetail {
  id: string;
  savedAt: number;
  targetGroupLabel?: string;
}

export type TargetGroup = 'children' | 'elderly' | 'hospital' | 'public' | 'school' | 'online' | 'university';

export const TARGET_GROUPS: { id: TargetGroup; label: string; icon: string }[] = [
  { id: 'children', label: 'เด็กเล็ก/อนุบาล', icon: '👶' },
  { id: 'school', label: 'นักเรียนมัธยม', icon: '🎒' },
  { id: 'university', label: 'มหาวิทยาลัย', icon: '🎓' },
  { id: 'elderly', label: 'ผู้สูงอายุ', icon: '👴' },
  { id: 'hospital', label: 'ผู้ป่วยในโรงพยาบาล', icon: '🏥' },
  { id: 'public', label: 'ชุมชนทั่วไป/สวนสาธารณะ', icon: '🌳' },
  { id: 'online', label: 'ชุมชนออนไลน์', icon: '💻' },
];
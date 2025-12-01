import { GoogleGenAI, Type } from "@google/genai";
import { ActivitySummary, ActivityDetail } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Helper to get the Thai label for the target group
const getTargetLabel = (targetId: string) => {
    switch(targetId) {
        case 'children': return 'เด็กเล็กและวัยอนุบาล';
        case 'school': return 'นักเรียนมัธยมและวัยรุ่น';
        case 'university': return 'นักศึกษามหาวิทยาลัยและบุคลากรภายในสถาบัน';
        case 'elderly': return 'ผู้สูงอายุในศูนย์ดูแลหรือชุมชน';
        case 'hospital': return 'ผู้ป่วยและบุคลากรทางการแพทย์ในโรงพยาบาล';
        case 'public': return 'บุคคลทั่วไปในพื้นที่สาธารณะ';
        case 'online': return 'ผู้ใช้งานสื่อสังคมออนไลน์';
        default: return 'ชุมชนทั่วไป';
    }
};

export const generateActivityIdeas = async (targetGroup: string, existingTitles: string[] = []): Promise<ActivitySummary[]> => {
  const targetLabel = getTargetLabel(targetGroup);
  
  let avoidInstruction = "";
  if (existingTitles.length > 0) {
    avoidInstruction = `\nสำคัญมาก: กิจกรรมใหม่ที่คิดต้องไม่ซ้ำกับกิจกรรมเหล่านี้: ${existingTitles.join(", ")}`;
  }

  const prompt = `
    คุณเป็นอาจารย์ที่ปรึกษาด้านดนตรีสากลและกิจกรรมเพื่อสังคม
    ช่วยคิดกิจกรรมสร้างสรรค์เพิ่มอีก 5 กิจกรรม สำหรับ "นักศึกษาเอกดนตรีสากล" เพื่อไปจัดกิจกรรมให้แก่ "${targetLabel}"
    ${avoidInstruction}
    
    กิจกรรมต้องมีความหลากหลาย (เช่น การแสดง, การสอน, ดนตรีบำบัดเบื้องต้น, การ workshop)
    และต้องเหมาะสมกับบริบทของกลุ่มเป้าหมาย
    
    ตอบกลับเป็น JSON Array โดยมี Schema ดังนี้:
    - id: string (unique id)
    - title: string (ชื่อกิจกรรมที่น่าสนใจ)
    - description: string (คำอธิบายสั้นๆ ประมาณ 2 ประโยค)
    - tags: array of strings (เช่น "Performance", "Workshop", "Music Therapy", "Fun")
    - duration: string (ระยะเวลาที่ใช้ เช่น "2 ชั่วโมง", "ครึ่งวัน")
    - difficulty: string (ระดับความยากในการเตรียมงาน: "Low", "Medium", "High")
    - impactArea: string (ด้านที่พัฒนา เช่น "Mental Health", "Education", "Social Bond")
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              duration: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
              impactArea: { type: Type.STRING },
            },
            required: ["id", "title", "description", "tags", "duration", "difficulty", "impactArea"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ActivitySummary[];
    }
    return [];
  } catch (error) {
    console.error("Error generating activity ideas:", error);
    throw error;
  }
};

export const generateActivityDetail = async (activityTitle: string, targetGroup: string): Promise<ActivityDetail> => {
    const targetLabel = getTargetLabel(targetGroup);

    const prompt = `
      ช่วยเขียน "ข้อเสนอโครงการ" (Project Proposal) อย่างละเอียด สำหรับกิจกรรมชื่อ "${activityTitle}"
      ซึ่งจัดโดยนักศึกษาเอกดนตรีสากล เพื่อกลุ่มเป้าหมายคือ "${targetLabel}"
      
      ข้อกำหนดสำคัญ (Critical Requirements):
      1. ระยะเวลาดำเนินโครงการ (Timeline): ต้องวางแผนการดำเนินงานครอบคลุมระยะเวลา "3 เดือน" โดยให้ระบุรายละเอียดในส่วน stepByStepPlan แบ่งเป็นระยะ (เช่น เดือนที่ 1 เตรียมการ, เดือนที่ 2 ดำเนินการ, เดือนที่ 3 สรุปผล)
      2. งบประมาณ (Budget): ให้ประมาณการรายจ่ายโดยละเอียด ให้อยู่ในช่วง "20,000 - 30,000 บาท" ตามความเหมาะสมของกิจกรรม (ระบุใน budgetEstimate)
      
      ขอให้เนื้อหามีความละเอียด เป็นมืออาชีพ และนำไปใช้จริงได้
      
      ตอบกลับเป็น JSON Object ตามโครงสร้างนี้:
      - title: string (ชื่อกิจกรรม)
      - fullDescription: string (รายละเอียดกิจกรรม แบบบรรยาย 1 ย่อหน้า)
      - objectives: array of strings (วัตถุประสงค์ 3-5 ข้อ)
      - targetAudienceDetail: string (วิเคราะห์กลุ่มเป้าหมายและสิ่งที่ต้องระวัง)
      - stepByStepPlan: array of strings (ขั้นตอนการดำเนินงานละเอียด ตลอดระยะเวลา 3 เดือน)
      - requiredEquipment: array of strings (อุปกรณ์ที่ต้องใช้ ทั้งเครื่องดนตรีและอุปกรณ์เสริม)
      - budgetEstimate: string (รายละเอียดงบประมาณ แจกแจงรายการ และยอดรวมให้อยู่ในช่วง 20,000-30,000 บาท)
      - evaluationMetrics: array of strings (ตัวชี้วัดความสำเร็จ)
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        fullDescription: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetAudienceDetail: { type: Type.STRING },
                        stepByStepPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                        requiredEquipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                        budgetEstimate: { type: Type.STRING },
                        evaluationMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "fullDescription", "objectives", "stepByStepPlan", "requiredEquipment"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as ActivityDetail;
        }
        throw new Error("No text returned from API");
    } catch (error) {
        console.error("Error generating details:", error);
        throw error;
    }
}

export const generateCustomActivityDetail = async (requirements: string): Promise<ActivityDetail> => {
    const prompt = `
      คุณเป็นผู้เชี่ยวชาญด้านการเขียนโครงการดนตรี
      ช่วยร่าง "ข้อเสนอโครงการ" (Project Proposal) ฉบับสมบูรณ์ โดยยึดตามความต้องการของผู้ใช้ดังนี้:
      "${requirements}"
      
      คำสั่งสำคัญ (CRITICAL INSTRUCTIONS):
      1. หากผู้ใช้ระบุ "งบประมาณ" หรือ "ระยะเวลา" ให้ยึดตามที่ระบุอย่างเคร่งครัด (เช่น ถ้าบอกว่า 100,000 บาท ให้แจกแจงงบให้ได้ยอดประมาณนั้น)
      2. หากผู้ใช้ *ไม่ได้* ระบุ ให้ใช้เกณฑ์มาตรฐาน: ระยะเวลา 3 เดือน และ งบประมาณ 20,000-30,000 บาท
      3. ให้วิเคราะห์กลุ่มเป้าหมายจากบริบทของโจทย์
      
      ตอบกลับเป็น JSON Object ตามโครงสร้างนี้:
      - title: string (ตั้งชื่อโครงการให้เป็นทางการและน่าสนใจ)
      - fullDescription: string (รายละเอียดกิจกรรม แบบบรรยาย)
      - objectives: array of strings (วัตถุประสงค์)
      - targetAudienceDetail: string (วิเคราะห์กลุ่มเป้าหมาย)
      - stepByStepPlan: array of strings (แผนการดำเนินงานละเอียด แบ่งตามระยะเวลาที่กำหนด)
      - requiredEquipment: array of strings (อุปกรณ์ที่ต้องใช้)
      - budgetEstimate: string (รายละเอียดงบประมาณ แจกแจงรายการและยอดรวม ให้สอดคล้องกับงบที่ระบุ)
      - evaluationMetrics: array of strings (ตัวชี้วัดความสำเร็จ)
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        fullDescription: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetAudienceDetail: { type: Type.STRING },
                        stepByStepPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                        requiredEquipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                        budgetEstimate: { type: Type.STRING },
                        evaluationMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "fullDescription", "objectives", "stepByStepPlan", "requiredEquipment"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as ActivityDetail;
        }
        throw new Error("No text returned from API");
    } catch (error) {
        console.error("Error generating custom details:", error);
        throw error;
    }
}

export const refineActivityDetail = async (currentDetail: ActivityDetail, instruction: string): Promise<ActivityDetail> => {
    const prompt = `
      คุณเป็นผู้ช่วยอัจฉริยะที่ช่วยปรับปรุง "ข้อเสนอโครงการ" (Project Proposal)
      
      ข้อมูลโครงการปัจจุบัน (JSON):
      ${JSON.stringify(currentDetail)}
      
      คำสั่งแก้ไขจากผู้ใช้:
      "${instruction}"
      
      คำแนะนำ:
      - ปรับปรุงเนื้อหาให้สอดคล้องกับคำสั่งของผู้ใช้อย่างเคร่งครัด
      - รักษาโครงสร้าง JSON เดิมไว้
      - ปรับเปลี่ยนส่วนอื่นๆ ที่เกี่ยวข้องให้สมเหตุสมผลตามการเปลี่ยนแปลง (เช่น ถ้างบประมาณลดลง อุปกรณ์อาจต้องลดลงด้วย)
      
      ตอบกลับเป็น JSON Object ตามโครงสร้างนี้:
      - title: string
      - fullDescription: string
      - objectives: array of strings
      - targetAudienceDetail: string
      - stepByStepPlan: array of strings
      - requiredEquipment: array of strings
      - budgetEstimate: string
      - evaluationMetrics: array of strings
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        fullDescription: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetAudienceDetail: { type: Type.STRING },
                        stepByStepPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                        requiredEquipment: { type: Type.ARRAY, items: { type: Type.STRING } },
                        budgetEstimate: { type: Type.STRING },
                        evaluationMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "fullDescription", "objectives", "stepByStepPlan", "requiredEquipment"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as ActivityDetail;
        }
        throw new Error("No text returned from API");
    } catch (error) {
        console.error("Error refining details:", error);
        throw error;
    }
}
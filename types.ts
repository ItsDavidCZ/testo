export interface ImageAnalysis {
  sharpnessScore: number;
  lightingScore: number;
  compositionScore: number;
  suggestions: string[];
  viralPotential: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ComparisonImage {
  before: string;
  after: string;
  label: string;
}
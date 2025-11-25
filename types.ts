export enum IdentificationCategory {
  PLANT = 'PLANT',
  PERSON = 'PERSON',
  OTHER = 'OTHER'
}

export interface IdentificationResult {
  category: IdentificationCategory;
  name: string;
  scientificName?: string;
  description: string;
  careTips?: string[];
  funFact?: string;
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}

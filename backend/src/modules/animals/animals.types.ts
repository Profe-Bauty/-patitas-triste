export type AnimalSpecies = 'perro' | 'gato' | 'conejo' | 'pajaro' | 'otro';
export type AnimalGender = 'masculino' | 'femenino' | 'desconocido';
export type AnimalSize = 'pequeño' | 'mediano' | 'grande' | 'extra_grande';
export type AnimalStatus = 'rescate' | 'cuidado' | 'adoptado' | 'fallecido' | 'devuelto';

export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  breed?: string;
  estimatedAgeYears?: number;
  estimatedAgeMonths?: number;
  gender: AnimalGender;
  size: AnimalSize;
  colorDescription?: string;
  distinctiveMarks?: string;
  medicalNotes?: string;
  behavioralNotes?: string;
  entryDate: Date;
  entryReason?: string;
  status: AnimalStatus;
  photoUrl?: string;
  additionalPhotos?: string[];
  microchipId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnimalDTO {
  name: string;
  species: AnimalSpecies;
  breed?: string;
  estimatedAgeYears?: number;
  estimatedAgeMonths?: number;
  gender: AnimalGender;
  size: AnimalSize;
  colorDescription?: string;
  distinctiveMarks?: string;
  medicalNotes?: string;
  behavioralNotes?: string;
  entryDate: Date;
  entryReason?: string;
  microchipId?: string;
}

export interface UpdateAnimalDTO {
  name?: string;
  breed?: string;
  estimatedAgeYears?: number;
  estimatedAgeMonths?: number;
  gender?: AnimalGender;
  size?: AnimalSize;
  colorDescription?: string;
  distinctiveMarks?: string;
  medicalNotes?: string;
  behavioralNotes?: string;
  status?: AnimalStatus;
  microchipId?: string;
}

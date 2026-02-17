const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';

export interface RecognitionResult {
  success: boolean;
  found_in_database?: boolean;
  species?: string;
  identified_species?: string;
  species_type?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
  identified_by?: string;
  bioclip_suggestion?: string;
  message?: string;
  detected_object?: string;
  top_matches: Array<{
    species: string;
    confidence: number;
  }>;
}

export interface SpeciesSubmission {
  species_name: string;
  location: string;
  species_type: string;
  user_id?: string;
  user_email?: string;
  notes?: string;
  image?: File;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submission: {
    species_name: string;
    location: string;
    timestamp: string;
    image_saved: boolean;
  };
}

export const recognizeSpecies = async (file: File): Promise<RecognitionResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/recognize`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to recognize species');
  }

  return response.json();
};

export const submitNewSpecies = async (submission: SpeciesSubmission): Promise<SubmissionResponse> => {
  const formData = new FormData();
  formData.append('species_name', submission.species_name);
  formData.append('location', submission.location);
  formData.append('species_type', submission.species_type);
  if (submission.user_id) formData.append('user_id', submission.user_id);
  if (submission.user_email) formData.append('user_email', submission.user_email);
  if (submission.notes) formData.append('notes', submission.notes);
  if (submission.image) formData.append('file', submission.image);

  const response = await fetch(`${API_URL}/submit-new-species`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to submit species' }));
    throw new Error(errorData.detail || 'Failed to submit species');
  }

  return response.json();
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_URL}/health`);
  
  if (!response.ok) {
    throw new Error('API health check failed');
  }

  return response.json();
};

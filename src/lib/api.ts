const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';

export interface RecognitionResult {
  success: boolean;
  found_in_database?: boolean;
  species?: string;
  identified_species?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  confidence: number;
  identified_by?: string;
  message?: string;
  detected_object?: string;
  top_matches: Array<{
    species: string;
    confidence: number;
  }>;
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

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await fetch(`${API_URL}/health`);
  
  if (!response.ok) {
    throw new Error('API health check failed');
  }

  return response.json();
};

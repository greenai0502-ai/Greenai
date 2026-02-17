import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Upload, Camera, X, Sparkles, Loader2, MapPin, ExternalLink, Send } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { recognizeSpecies, RecognitionResult, submitNewSpecies } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function UploadPage() {
  const [searchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const MCC_LOCATIONS = ['QSC', 'BOTANY TANK', 'MMIP', 'CANTEEN', 'ANDERSON HALL'];

  const saveIdentification = async (recognition: RecognitionResult) => {
    console.log('saveIdentification called with:', recognition);
    console.log('Current user:', user);

    if (!user?.id) {
      console.error('User not logged in, skipping save to database');
      toast({
        title: "Not saved",
        description: "Please log in to save identifications",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to insert into database...');
      const dataToInsert = {
        user_id: user.id,
        species: recognition.species || recognition.identified_species || 'Unknown',
        confidence: recognition.confidence || 0,
        identified_by: recognition.identified_by || 'unknown',
        found_in_database: recognition.found_in_database || false,
        location: recognition.location || null,
        latitude: recognition.latitude || null,
        longitude: recognition.longitude || null,
      };

      console.log('Data to insert:', dataToInsert);
      console.log('Inserting into database using direct fetch...');

      // Skip session fetch entirely - just hardcode auth check from context
      if (!user?.id) {
        console.error('No user in context');
        toast({
          title: "Not authenticated",
          description: "Please log in again",
          variant: "destructive",
        });
        return false;
      }

      console.log('Getting session from localStorage...');
      const authStorage = localStorage.getItem('sb-zzgdtsofmffjnthpihrs-auth-token');
      if (!authStorage) {
        console.error('No auth token in localStorage');
        toast({
          title: "Not authenticated",
          description: "Please log in again",
          variant: "destructive",
        });
        return false;
      }

      const authData = JSON.parse(authStorage);
      const accessToken = authData?.access_token;
      console.log('Access token found:', !!accessToken);

      if (!accessToken) {
        console.error('No access token');
        toast({
          title: "Authentication error",
          description: "Please log in again",
          variant: "destructive",
        });
        return false;
      }

      // Use direct fetch with token from localStorage
      console.log('Sending fetch request...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/identifications`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(dataToInsert)
        }
      );

      console.log('Fetch completed!');

      console.log('Insert completed! Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error saving identification:', errorData);
        toast({
          title: "Failed to save",
          description: errorData.message || `HTTP ${response.status}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('Identification saved successfully');
      window.dispatchEvent(new CustomEvent('identification-saved'));
      toast({
        title: "Saved!",
        description: "Identification saved to your profile",
      });
      return true;

    } catch (error: any) {
      console.error('Exception saving identification:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save identification",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    console.log('Starting analysis...');
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await recognizeSpecies(selectedFile);
      console.log('API response:', response);
      setResult(response);

      if (response.success) {
        const speciesName = response.species || response.identified_species || 'Unknown';
        const confidenceText = response.confidence
          ? `${(response.confidence * 100).toFixed(1)}% confidence`
          : 'confidence unavailable';

        // Save to database
        await saveIdentification(response);

        toast({
          title: "Species Identified!",
          description: `Found: ${speciesName} (${confidenceText})`,
        });
      } else {
        toast({
          title: "Not a Mushroom",
          description: response.message || "Unable to identify species",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Recognition error:', error);
      toast({
        title: "Recognition Failed",
        description: "Failed to analyze the image. Please make sure the backend API is running.",
        variant: "destructive",
      });
    } finally {
      console.log('Analysis complete, setting isAnalyzing to false');
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setShowSubmissionForm(false);
    setSelectedLocation('');
    setSubmissionNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmitNewSpecies = async () => {
    if (!result || !selectedLocation || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please select a location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const speciesName = result.identified_species || result.species || 'Unknown';
      const speciesType = result.species_type || 'mushroom';

      console.log('Submitting new species:', {
        species_name: speciesName,
        location: selectedLocation,
        species_type: speciesType,
        user_id: user?.id,
      });

      const response = await submitNewSpecies({
        species_name: speciesName,
        location: selectedLocation,
        species_type: speciesType,
        user_id: user?.id || '',
        user_email: user?.email || '',
        notes: submissionNotes,
        image: selectedFile,
      });

      console.log('Submission successful:', response);

      toast({
        title: "✅ Successfully Added to Database!",
        description: response.message || `${speciesName} has been added to the MCC database at ${selectedLocation}`,
      });

      // Clear the form
      setShowSubmissionForm(false);
      setSelectedLocation('');
      setSubmissionNotes('');

    } catch (error: any) {
      console.error('Submission error:', error);

      // Parse error message to provide specific feedback
      let errorTitle = "Submission Failed";
      let errorDescription = error.message || "Failed to submit species information";

      if (error.message?.includes('already exists')) {
        errorTitle = "Duplicate Species";
        errorDescription = error.message;
      } else if (error.message?.includes('permission')) {
        errorTitle = "Permission Denied";
        errorDescription = "You don't have permission to add species. Please contact an administrator.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorTitle = "Connection Error";
        errorDescription = "Unable to connect to the server. Please check your internet connection.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Identify Species
          </h1>
          <p className="text-muted-foreground">
            Upload or capture a photo to identify plants, flowers & mushrooms
          </p>
        </div>

        {!selectedImage ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-2xl nature-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Upload Image</p>
                <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-6 rounded-2xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center justify-center gap-3 group"
            >
              <Camera className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-primary">Open Camera</span>
            </button>

            {/* Hidden Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden card-shadow">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full aspect-[4/3] object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analyze Button - Only show if no results */}
            {!result && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full h-14 rounded-xl nature-gradient text-primary-foreground font-semibold text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Identify Species
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={clearImage}
              className="w-full h-12 rounded-xl"
            >
              Choose Different Image
            </Button>

            {/* Error Section - Not a Plant or Mushroom */}
            {result && !result.success && (
              <div className="mt-6 p-6 rounded-2xl bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="font-semibold text-lg text-red-900 dark:text-red-100">Not a Plant or Mushroom</h3>
                </div>

                <p className="text-red-800 dark:text-red-200">
                  {result.message || "This image doesn't appear to be a plant or mushroom. Please upload a plant or mushroom image."}
                </p>

                {result.detected_object && (
                  <div className="pt-2 border-t border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Detected: <span className="font-semibold">{result.detected_object}</span>
                      {result.confidence && ` (${(result.confidence * 100).toFixed(1)}% confidence)`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Results Section */}
            {result && result.success && (
              <div className="mt-6 p-6 rounded-2xl bg-card border border-border space-y-4 animate-fade-in">
                <h3 className="font-semibold text-lg text-foreground">Recognition Results</h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="font-semibold text-foreground capitalize">{result.species_type || 'Unknown'}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Species:</span>
                    <span className="font-semibold text-foreground text-right">{result.species || result.identified_species}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <span className="font-semibold text-green-600">
                      {result.confidence ? (result.confidence * 100).toFixed(1) : 'N/A'}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Identified by:</span>
                    <span className="text-sm text-foreground">{result.identified_by}</span>
                  </div>

                  {result.bioclip_suggestion && result.bioclip_suggestion !== result.species && (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        ℹ️ Verification Note
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        AI models initially suggested "{result.bioclip_suggestion}" but after verification, confirmed it as "{result.species}"
                      </p>
                    </div>
                  )}

                  {result.found_in_database && result.location ? (
                    <>
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">Found at MCC:</span>
                        <span className="text-sm text-foreground text-right flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {result.location}
                        </span>
                      </div>

                      {result.latitude && result.longitude && (
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Coordinates:</span>
                            <span className="text-sm text-foreground font-mono">
                              {result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}
                            </span>
                          </div>

                          <a
                            href={`https://www.google.com/maps?q=${result.latitude},${result.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
                          >
                            <MapPin className="w-4 h-4" />
                            View Location on Google Maps
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Found at MCC:</span>
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Not available in MCC campus
                      </span>
                    </div>
                  )}

                  {!result.found_in_database && result.message && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        ⚠️ {result.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Add to MCC Database Button */}
                {!result.found_in_database && !showSubmissionForm && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      onClick={() => setShowSubmissionForm(true)}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Add This Species to MCC Database
                    </Button>
                  </div>
                )}

                {result.top_matches && result.top_matches.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Top Matches:</h4>
                    <div className="space-y-2">
                      {result.top_matches.slice(0, 5).map((match, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{match.species}</span>
                          <span className="text-foreground">{(match.confidence * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submission Form for Adding Species to MCC Database */}
            {showSubmissionForm && result && !result.found_in_database && (
              <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                    Add {result.species_type === 'plant' ? 'Plant' : 'Mushroom'} to MCC Database
                  </h3>
                  <button
                    onClick={() => setShowSubmissionForm(false)}
                    className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-green-700 dark:text-green-300" />
                  </button>
                </div>

                <p className="text-sm text-green-800 dark:text-green-200">
                  Help us expand our database by telling us where you found this {result.species_type || 'species'} on campus.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Species Identified: <span className="font-bold">{result.identified_species || result.species}</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Location at MCC Campus <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-green-300 dark:border-green-700 bg-white dark:bg-green-900 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      <option value="">Select a location...</option>
                      {MCC_LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="Any additional information about where you found it, when, or other observations..."
                      className="w-full px-4 py-3 rounded-lg border-2 border-green-300 dark:border-green-700 bg-white dark:bg-green-900 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSubmitNewSpecies}
                      disabled={!selectedLocation || isSubmitting}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit to Database
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowSubmissionForm(false)}
                      variant="outline"
                      disabled={isSubmitting}
                      className="h-12 px-6 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

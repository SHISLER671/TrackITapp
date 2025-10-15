'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, useAuth } from '@/components/AuthProvider';
import NavBar from '@/components/NavBar';
import ErrorMessage from '@/components/ErrorMessage';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import CameraCapture from '@/components/CameraCapture';
import AIRecommendations from '@/components/AIRecommendations';
import { CreateKegFormData, KegSize, BeerStyle } from '@/lib/types';
import { BEER_STYLES, KEG_SIZES } from '@/lib/constants';
import { getContractAddress } from '@/lib/thirdweb';

export default function NewKegPage() {
  return (
    <ProtectedRoute allowedRoles={['BREWER']}>
      <NewKegContent />
    </ProtectedRoute>
  );
}

function NewKegContent() {
  const router = useRouter();
  const { userRole } = useAuth();
  const [formData, setFormData] = useState<CreateKegFormData>({
    name: '',
    type: 'IPA',
    abv: 5.0,
    ibu: 40,
    brew_date: new Date().toISOString().split('T')[0],
    keg_size: '1/6BBL',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKeg, setCreatedKeg] = useState<{ id: string; name: string } | null>(null);
  const [pastKegNames, setPastKegNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);
  const [showPresets, setShowPresets] = useState(false);

  // Load past keg names and defaults on mount
  React.useEffect(() => {
    loadPastKegs();
    loadDefaults();
    initializeVoiceRecognition();
    loadDraft();
    loadPresets();
  }, []);

  // Auto-save draft every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, notes, photos]);

  // Auto-save when form data changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [formData, notes, photos]);

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNotes(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  };

  const startRecording = () => {
    if (recognition) {
      setIsRecording(true);
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const takePhoto = () => {
    setShowCamera(true);
  };

  const capturePhoto = (imageData: string) => {
    setPhotos(prev => [...prev, imageData]);
    setShowCamera(false);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const saveDraft = () => {
    const draft = {
      formData,
      notes,
      photos,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('kegDraft', JSON.stringify(draft));
  };

  const loadDraft = () => {
    const saved = localStorage.getItem('kegDraft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        const draftAge = new Date().getTime() - new Date(draft.timestamp).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (draftAge < maxAge && draft.formData.name) {
          setFormData(draft.formData);
          setNotes(draft.notes || '');
          setPhotos(draft.photos || []);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('kegDraft');
    setFormData({
      name: '',
      type: 'IPA',
      abv: 5.0,
      ibu: 40,
      brew_date: new Date().toISOString().split('T')[0],
      keg_size: '1/6BBL',
    });
    setNotes('');
    setPhotos([]);
  };

  const loadPresets = () => {
    const saved = localStorage.getItem('kegPresets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    }
  };

  const savePreset = () => {
    if (!formData.name.trim()) {
      alert('Please enter a keg name before saving as preset');
      return;
    }

    const presetName = prompt('Enter a name for this preset:');
    if (!presetName) return;

    const preset = {
      id: Date.now().toString(),
      name: presetName,
      formData: { ...formData },
      notes,
      timestamp: new Date().toISOString(),
    };

    const newPresets = [...presets, preset];
    setPresets(newPresets);
    localStorage.setItem('kegPresets', JSON.stringify(newPresets));
    alert(`Preset "${presetName}" saved successfully!`);
  };

  const loadPreset = (preset: any) => {
    setFormData(preset.formData);
    setNotes(preset.notes || '');
    setPhotos([]); // Don't load photos from presets
    setShowPresets(false);
  };

  const deletePreset = (presetId: string) => {
    if (confirm('Delete this preset?')) {
      const newPresets = presets.filter(p => p.id !== presetId);
      setPresets(newPresets);
      localStorage.setItem('kegPresets', JSON.stringify(newPresets));
    }
  };

  const loadPastKegs = async () => {
    try {
      const response = await fetch('/api/kegs');
      if (response.ok) {
        const data = await response.json();
        const uniqueNames = [...new Set(data.kegs?.map((k: any) => k.name) || [])] as string[];
        setPastKegNames(uniqueNames);
      }
    } catch (error) {
      console.error('Failed to load past kegs:', error);
    }
  };

  const loadDefaults = () => {
    // Try to load from localStorage
    const saved = localStorage.getItem('lastKegForm');
    if (saved) {
      try {
        const lastForm = JSON.parse(saved);
        setFormData({
          ...formData,
          type: lastForm.type || 'IPA',
          abv: lastForm.abv || 5.0,
          ibu: lastForm.ibu || 40,
          keg_size: lastForm.keg_size || '1/6BBL',
        });
      } catch (error) {
        console.error('Failed to load defaults:', error);
      }
    }
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    
    if (value.length > 0) {
      const filtered = pastKegNames.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name: string) => {
    setFormData({ ...formData, name });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kegs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          brewery_id: userRole?.brewery_id,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create keg');
      }

      setCreatedKeg({ id: data.keg.id, name: data.keg.name });
      
      // Save form data as defaults for next time
      localStorage.setItem('lastKegForm', JSON.stringify({
        type: formData.type,
        abv: formData.abv,
        ibu: formData.ibu,
        keg_size: formData.keg_size,
      }));
      
      // Clear draft since keg was successfully created
      clearDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create keg');
    } finally {
      setLoading(false);
    }
  };

  if (createdKeg) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Keg Created Successfully!
            </h1>
            <p className="text-gray-600 mb-8">
              Your keg <span className="font-semibold">{createdKeg.name}</span> has been created.
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                QR Code
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Download and print this QR code to attach to your physical keg
              </p>
              <QRCodeDisplay
                contractAddress={getContractAddress()}
                tokenId={createdKeg.id}
                kegName={createdKeg.name}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/kegs/${createdKeg.id}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Keg Details
              </button>
              <button
                onClick={() => {
                  setCreatedKeg(null);
                  setFormData({
                    name: '',
                    type: 'IPA',
                    abv: 5.0,
                    ibu: 40,
                    brew_date: new Date().toISOString().split('T')[0],
                    keg_size: '1/6BBL',
                  });
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Create Another Keg
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Keg</h1>
              <p className="text-gray-600 mt-2">
                Enter the details of your new keg. A QR code will be generated for tracking.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={clearDraft}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear Draft
              </button>
              <button
                onClick={savePreset}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Save as Preset
              </button>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-sm text-green-600 hover:text-green-700 underline"
              >
                Load Preset ({presets.length})
              </button>
            </div>
          </div>
        </div>

        {/* Presets Dropdown */}
        {showPresets && presets.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Saved Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <div key={preset.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{preset.name}</div>
                      <div className="text-sm text-gray-600">{preset.formData.name}</div>
                      <div className="text-xs text-gray-500">
                        {preset.formData.type} • {preset.formData.abv}% ABV
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => loadPreset(preset)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <AIRecommendations
          onApply={(params) => {
            setFormData(prev => ({ ...prev, ...params }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

            {/* Beer Name with Auto-suggest */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (formData.name.length > 0) {
                    const filtered = pastKegNames.filter(name =>
                      name.toLowerCase().includes(formData.name.toLowerCase())
                    );
                    setFilteredSuggestions(filtered);
                    setShowSuggestions(filtered.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                required
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hazy IPA"
              />
              
              {/* Auto-suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuggestions.slice(0, 5).map((name, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(name)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    >
                      <div className="font-medium text-gray-900">{name}</div>
                      <div className="text-sm text-gray-500">From past kegs</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Beer Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beer Style *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as BeerStyle })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {BEER_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* ABV and IBU with sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ABV (%) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.1"
                    value={formData.abv}
                    onChange={(e) => setFormData({ ...formData, abv: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="text-lg font-bold text-blue-600 min-w-[4rem] text-center">
                    {formData.abv.toFixed(1)}%
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className={formData.abv >= 5 && formData.abv <= 8 ? 'text-green-600 font-medium' : ''}>
                    Standard: 5-8%
                  </span>
                  <span>20%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBU *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={formData.ibu}
                    onChange={(e) => setFormData({ ...formData, ibu: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <div className="text-lg font-bold text-blue-600 min-w-[3rem] text-center">
                    {formData.ibu}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className={formData.ibu >= 20 && formData.ibu <= 60 ? 'text-green-600 font-medium' : ''}>
                    Standard: 20-60
                  </span>
                  <span>120</span>
                </div>
              </div>
            </div>

            {/* Brew Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brew Date *
              </label>
              <input
                type="date"
                value={formData.brew_date}
                onChange={(e) => setFormData({ ...formData, brew_date: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Keg Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keg Size *
              </label>
              <select
                value={formData.keg_size}
                onChange={(e) => setFormData({ ...formData, keg_size: e.target.value as KegSize })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {KEG_SIZES.map((kegSize) => (
                  <option key={kegSize.size} value={kegSize.size}>
                    {kegSize.size} - {kegSize.name} ({kegSize.expected_pints} pints) - {kegSize.description}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Expected pints will be automatically calculated based on keg size
              </p>
            </div>

            {/* Voice Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brewing Notes (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isRecording 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="mr-2">🔴</span>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🎤</span>
                      Voice Note
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setNotes('')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this brew, ingredients, process, or anything else..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isRecording && (
                <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <span className="animate-pulse">🔴</span>
                  Recording... Speak now
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Optional)
              </label>
              <div className="flex gap-2 mb-4">
                <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                  <span className="mr-2">📁</span>
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={takePhoto}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span className="mr-2">📷</span>
                  Take Photo
                </button>
              </div>
              
              {/* Photo Gallery */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Keg photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Keg...' : 'Create Keg'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={capturePhoto}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

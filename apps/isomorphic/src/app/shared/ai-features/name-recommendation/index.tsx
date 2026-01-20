'use client';

import { useState, useEffect } from 'react';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { Button, Text, Title, Loader, Badge } from 'rizzui';
import cn from '@core/utils/class-names';
import { 
  PiSparkle, 
  PiUploadSimple, 
  PiCopy, 
  PiCheck,
  PiMagicWand
} from 'react-icons/pi';

import { getNameRecommendation } from '@/kedaimaster-api/productsApi';
import { toast } from 'react-hot-toast';

const pageHeader = {
  title: 'Name Recommendation',
  breadcrumb: [
    { href: routes.dashboard.main, name: 'Dashboard' },
    { href: routes.dashboard.products, name: 'Produk' },
    { name: 'Name Recommendation' },
  ],
};

export default function NameRecommendationPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('name-rec-image');
    }
    return null;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('name-rec-show-results') === 'true';
    }
    return false;
  });
  const [recommendations, setRecommendations] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('name-rec-results');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectedName, setSelectedName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('name-rec-selected-name');
    }
    return null;
  });
  const [copiedName, setCopiedName] = useState<string | null>(null);
  
  // Persist state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedImage) localStorage.setItem('name-rec-image', selectedImage);
      else localStorage.removeItem('name-rec-image');
    }
  }, [selectedImage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('name-rec-results', JSON.stringify(recommendations));
    }
  }, [recommendations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('name-rec-show-results', String(showResults));
    }
  }, [showResults]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedName) localStorage.setItem('name-rec-selected-name', selectedName);
      else localStorage.removeItem('name-rec-selected-name');
    }
  }, [selectedName]);

  const handleCopyName = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        setShowResults(false);
        setRecommendations([]);
        setSelectedName(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('name-rec-results');
          localStorage.removeItem('name-rec-show-results');
          localStorage.removeItem('name-rec-selected-name');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error('Harap unggah gambar terlebih dahulu');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await getNameRecommendation({ image: selectedImage });
      
      if (Array.isArray(result)) {
        setRecommendations(result);
        setShowResults(true);
        toast.success('Nama berhasil dibuat!');
      } else {
        const names = (result as any)?.recommendations || (result as any)?.data || result;
        if (Array.isArray(names)) {
          setRecommendations(names);
          setShowResults(true);
          toast.success('Nama berhasil dibuat!');
        } else {
          throw new Error('Invalid response from AI');
        }
      }
    } catch (error: any) {
      console.error('API Error:', error);
      toast.error(error.message || 'Gagal membuat nama. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectName = (name: string) => {
    setSelectedName(name);
  };

  return (
    <div className="@container flex flex-col pb-8">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Panel - Upload */}
        <div className="flex w-full lg:w-[380px] xl:w-[400px] flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-100">
            <Title as="h3" className="text-sm lg:text-base font-semibold text-gray-900">
              Gambar Produk
            </Title>
            <Text className="text-[11px] lg:text-sm text-gray-500 mt-1">
              Unggah gambar untuk mendapatkan rekomendasi nama
            </Text>
          </div>

          <div className="p-4 lg:p-6">
            <label
              htmlFor="image-upload"
              className={cn(
                'group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-all duration-200',
                selectedImage
                  ? 'border-gray-300 bg-gray-50 p-3 lg:p-4'
                  : 'border-gray-300 bg-gray-50 py-8 lg:py-12 hover:border-gray-400 hover:bg-gray-100'
              )}
            >
              {selectedImage ? (
                <div className="w-full text-center">
                  <div className="relative mx-auto mb-3 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                    <img
                      src={selectedImage}
                      alt="Uploaded"
                      className="aspect-square w-full max-w-[300px] mx-auto object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Text className="text-sm font-medium text-white">
                        Ganti Gambar
                      </Text>
                    </div>
                  </div>
                  <Text className="text-xs font-medium text-gray-500">
                    Klik untuk mengganti
                  </Text>
                </div>
              ) : (
                <>
                  <div className="mb-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-gray-200">
                    <PiUploadSimple className="h-6 w-6 text-gray-600" />
                  </div>
                  <Text className="font-medium text-gray-900">
                    Klik untuk unggah
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (max. 5MB)
                  </Text>
                </>
              )}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            <Button
              onClick={handleGenerate}
              disabled={!selectedImage || isGenerating}
              className="mt-4 lg:mt-6 w-full rounded-lg bg-gray-900 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {isGenerating ? (
                <>
                  <Loader variant="spinner" className="me-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Memproses...
                </>
              ) : (
                <>
                  <PiSparkle className="me-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Rekomendasikan Nama
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Results (Flexible) */}
        <div className="flex w-full flex-1 flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
            <div>
              <Title as="h3" className="text-sm lg:text-base font-semibold text-gray-900">
                Rekomendasi
              </Title>
              <Text className="text-[11px] lg:text-sm text-gray-500 mt-1">
                {showResults ? 'Pilih nama untuk menyalin' : 'Hasil akan muncul di sini'}
              </Text>
            </div>
            {showResults && (
              <Badge variant="flat" color="success" className="bg-green-50 text-green-700 text-[10px] lg:text-xs">
                {recommendations.length} Berhasil
              </Badge>
            )}
          </div>

          <div className="p-4 lg:p-6 space-y-3">
            {!showResults ? (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center p-8">
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <PiMagicWand className="h-8 w-8 text-gray-400" />
                </div>
                <Text className="text-sm font-medium text-gray-900">
                  Belum ada rekomendasi
                </Text>
                <Text className="mt-1 max-w-xs text-xs text-gray-500">
                  Unggah gambar produk untuk melihat saran nama dari AI.
                </Text>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map((name, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectName(name)}
                    className={cn(
                      'group flex cursor-pointer items-start justify-between rounded-lg border p-3 lg:p-4 transition-all duration-200',
                      selectedName === name
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-3 lg:gap-4">
                      <span className={cn(
                        "flex h-7 w-7 lg:h-8 lg:w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] lg:text-xs font-medium mt-0.5",
                         selectedName === name ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {index + 1}
                      </span>
                      <Text className={cn(
                        "text-sm lg:text-base font-medium break-words leading-relaxed",
                        selectedName === name ? "text-gray-900" : "text-gray-700"
                      )}>
                        {name}
                      </Text>
                    </div>
                    
                    <div className="flex flex-shrink-0 items-center gap-1.5 lg:gap-2 ms-2 mt-0.5">
                      {selectedName === name && (
                         <Badge variant="flat" className="bg-gray-900 text-white text-[9px] lg:text-xs px-1.5 lg:px-2">
                           Terpilih
                         </Badge>
                      )}
                      <button
                        onClick={(e) => handleCopyName(name, e)}
                        className={cn(
                          'rounded-md p-1.5 lg:p-2 transition-colors',
                          copiedName === name
                            ? 'bg-green-50 text-green-600'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                        )}
                        title="Copy to clipboard"
                      >
                        {copiedName === name ? (
                          <PiCheck className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        ) : (
                          <PiCopy className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

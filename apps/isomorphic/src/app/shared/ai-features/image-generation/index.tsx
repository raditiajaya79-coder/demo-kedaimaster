'use client';

import { useState, useRef, useEffect } from 'react';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { Button, Text, Title, Loader, Badge, Switch, Textarea } from 'rizzui';
import cn from '@core/utils/class-names';
import { 
  PiSparkle, 
  PiRobot, 
  PiUser, 
  PiDownloadSimple,
  PiImageSquare,
  PiTrash,
  PiMagicWand
} from 'react-icons/pi';
import { generateImage } from '@/kedaimaster-api/productsApi';
import { toast } from 'react-hot-toast';

const pageHeader = {
  title: 'Image Generation',
  breadcrumb: [
    { href: routes.dashboard.main, name: 'Dashboard' },
    { href: routes.dashboard.products, name: 'Produk' },
    { name: 'Image Generation' },
  ],
};

const dummyImages = [
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600',
  'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  imageBinaryData?: string;
  timestamp: Date;
}

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('image-gen-prompt') || '';
    }
    return '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('image-gen-messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
        }
      }
    }
    return [
      {
        role: 'assistant',
        content: 'Halo! Saya asisten AI Bynari Anda. Unggah foto produk atau tulis deskripsi gambar yang Anda inginkan, dan saya akan mewujudkannya untuk Anda.',
        timestamp: new Date(),
      },
    ];
  });
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('image-gen-image');
    }
    return null;
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reconstruct File object if imagePreview exists but selectedImage doesn't
  useEffect(() => {
    if (imagePreview && !selectedImage) {
      try {
        const arr = imagePreview.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        setSelectedImage(new File([u8arr], 'persisted.jpg', { type: mime }));
      } catch (e) {
        console.error('Failed to reconstruct file:', e);
      }
    }
  }, [imagePreview]);

  // Persist state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('image-gen-messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('image-gen-prompt', prompt);
    }
  }, [prompt]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (imagePreview) localStorage.setItem('image-gen-image', imagePreview);
      else localStorage.removeItem('image-gen-image');
    }
  }, [imagePreview]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !selectedImage) {
        toast.error('Harap masukkan deskripsi atau unggah gambar');
        return;
    }

    const userMessage: Message = { 
      role: 'user', 
      content: prompt || 'Perindah gambar ini',
      image: imagePreview || undefined,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentPrompt = prompt;
    setPrompt('');
    handleRemoveImage();
    setIsGenerating(true);

    try {
        let result;
        result = await generateImage({
            prompt: currentPrompt || 'Perindah gambar ini',
            photo: selectedImage || undefined
        });

        let imageUrl: string;
        if (result instanceof Blob) {
            imageUrl = URL.createObjectURL(result);
        } else if (typeof result === 'object' && result !== null) {
            // @ts-ignore
            imageUrl = result.imageUrl || result.url || dummyImages[0];
        } else if (typeof result === 'string') {
            imageUrl = result;
        } else {
            imageUrl = dummyImages[0];
        }

        const assistantMessage: Message = {
            role: 'assistant',
            content: 'Berikut adalah hasil gambar yang Anda minta:',
            image: imageUrl, 
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
        console.error('Generation failed:', error);
        toast.error(error.message || 'Gagal memproses gambar');
        setMessages((prev) => [...prev, {
            role: 'assistant',
            content: 'Maaf, saya mengalami kendala saat memproses permintaan Anda.',
            timestamp: new Date()
        }]);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Halo! Saya asisten AI Bynari Anda. Unggah foto produk atau tulis deskripsi gambar yang Anda inginkan, dan saya akan mewujudkannya untuk Anda.',
        timestamp: new Date(),
      },
    ]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('image-gen-messages');
    }
  };

  const handleDownloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `bynari-gen-${prompt.substring(0, 15).replace(/[^a-zA-Z0-9]/g, '-')}.jpg`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="@container flex flex-col h-full lg:h-[calc(100vh-8rem)]">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-2 lg:mt-0 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearChat} 
            className="rounded-md border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 h-8 lg:h-9 px-2.5 lg:px-3 text-[10px] lg:text-xs font-medium"
          >
            <PiTrash className="h-3.5 w-3.5 lg:h-4 lg:w-4 me-1 lg:me-1.5" />
            Hapus Chat
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-1 gap-4 lg:gap-6 overflow-hidden pb-4">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8 scroll-smooth">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3 lg:gap-4 max-w-[95%] lg:max-w-[80%]',
                  message.role === 'user' ? 'ml-auto flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-8 w-8 lg:h-9 lg:w-9 flex-shrink-0 items-center justify-center rounded-full shadow-sm border',
                    message.role === 'user'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200'
                  )}
                >
                  {message.role === 'user' ? (
                    <PiUser className="h-4 w-4" />
                  ) : (
                    <PiRobot className="h-5 w-5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  {message.content && (
                  <div
                    className={cn(
                      'rounded-[18px] lg:rounded-[20px] px-3.5 py-2.5 lg:px-6 lg:py-4 text-sm lg:text-[15px] shadow-sm transition-all duration-200',
                      message.role === 'user'
                        ? 'bg-gray-900 text-white rounded-tr-sm shadow-gray-900/10'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                    )}
                  >
                    <Text className={cn('leading-relaxed font-medium', message.role === 'user' ? 'text-white/95' : 'text-gray-700')}>
                      {message.content}
                    </Text>
                  </div>
                  )}
                  
                  {message.image && (
                    <div className="group relative mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-all hover:shadow-md">
                      <img
                        src={message.image}
                        alt="Generated"
                        className="w-full h-auto object-cover max-h-[500px]"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex flex-wrap justify-end gap-2 lg:gap-3">
                          <Button 
                            size="sm" 
                            variant="solid"
                            className="bg-white text-gray-900 hover:bg-gray-100 h-8 lg:h-9 px-3 lg:px-4 text-[10px] lg:text-xs font-medium"
                            onClick={() => handleDownloadImage(message.image!, message.content)}
                          >
                            <PiDownloadSimple className="me-1.5 lg:me-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            Unduh
                          </Button>
                          <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 h-8 lg:h-9 px-3 lg:px-4 text-[10px] lg:text-xs font-medium">
                            <PiMagicWand className="me-1.5 lg:me-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            Gunakan
                          </Button>
                      </div>
                    </div>
                  )}
                  <Text className="text-[10px] text-gray-400 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm">
                  <PiRobot className="h-5 w-5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-200 px-4 py-3 lg:px-6 lg:py-4 shadow-sm">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Loader variant="spinner" className="h-4 w-4 lg:h-5 lg:w-5 text-gray-900" />
                    <Text className="text-xs lg:text-sm font-medium text-gray-600">Sedang memproses gambar Anda...</Text>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white p-3 lg:p-4 border-t border-gray-100">
            <div className="relative mx-auto max-w-4xl space-y-3">
              <div className="relative flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 transition-all focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900/5">
                <Textarea
                  placeholder="Tulis deskripsi gambar yang Anda inginkan..."
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  className="min-h-[60px] lg:min-h-[80px] w-full border-none bg-transparent p-0 text-sm lg:text-[15px] focus:ring-0 resize-none"
                  disabled={isGenerating}
                />
                
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200/50">
                  <div className="flex items-center gap-2">
                    {!selectedImage ? (
                      <>
                        <input
                          type="file"
                          id="image-upload-area"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                          disabled={isGenerating}
                        />
                        <label
                          htmlFor="image-upload-area"
                          className="flex items-center gap-2 cursor-pointer rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
                        >
                          <PiImageSquare className="h-4 w-4" />
                          Unggah Foto
                        </label>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 p-1 pr-2 shadow-sm">
                        <img src={imagePreview!} alt="Preview" className="h-6 w-6 rounded object-cover" />
                        <span className="text-[10px] font-medium text-gray-600 truncate max-w-[100px]">{selectedImage.name}</span>
                        <button 
                          onClick={handleRemoveImage}
                          className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                        >
                          <PiTrash className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!prompt.trim() && !selectedImage)}
                    className="bg-gray-900 text-white hover:bg-gray-800 px-4 lg:px-5 h-8 lg:h-9 text-[11px] lg:text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader variant="spinner" className="me-1.5 lg:me-2 h-3 w-3 lg:h-3.5 lg:w-3.5" />
                        <span className="hidden sm:inline">Memproses...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <PiSparkle className="me-1.5 lg:me-2 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                        Perindah
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium text-gray-400 px-1">
                <PiSparkle className="h-3 w-3" />
                <span>Didukung AI • JPG, PNG hingga 10MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

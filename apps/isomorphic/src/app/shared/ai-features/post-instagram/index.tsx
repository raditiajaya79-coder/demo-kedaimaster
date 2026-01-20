'use client';

import { useState, useEffect } from 'react';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import { Button, Text, Title, Loader, Textarea, Input, Popover } from 'rizzui';
import cn from '@core/utils/class-names';
import { getUserProfile, connectInstagram, fetchCurrentUser, saveUserProfile } from '@/kedaimaster-api/authApi';
import { postToInstagram, generateCaption } from '@/kedaimaster-api/productsApi';
import { toast } from 'react-hot-toast';
import { 
  PiInstagramLogo, 
  PiCopy, 
  PiCheck, 
  PiArrowClockwise,
  PiHeart,
  PiChatCircle,
  PiPaperPlaneTilt,
  PiBookmarkSimple,
  PiDotsThreeBold,
  PiMagicWand,
  PiShareNetwork,
  PiUploadSimple,
  PiTag,
  PiWarningCircle,
  PiPencilSimple,
  PiTrash
} from 'react-icons/pi';

const pageHeader = {
  title: 'Post Instagram',
  breadcrumb: [
    { href: routes.dashboard.main, name: 'Dashboard' },
    { href: routes.dashboard.products, name: 'Produk' },
    { name: 'Post Instagram' },
  ],
};

const dummyCaptions = [];

export default function PostInstagramPage() {
  const [editedCaption, setEditedCaption] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('post-ig-caption') || '';
    }
    return '';
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('post-ig-image');
    }
    return null;
  });
  
  const [isPosting, setIsPosting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [igUserName, setIgUserName] = useState<string | null>(null);
  const [isDisconnectPopoverOpen, setIsDisconnectPopoverOpen] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Check connection status on mount
  useEffect(() => {
    const init = async () => {
      try {
        const profile = await fetchCurrentUser();
        saveUserProfile(profile);
        
        // Check if user manually disconnected
        const isManualDisconnected = localStorage.getItem('ig_manual_disconnected') === 'true';
        
        if (profile?.igBusinessId && !isManualDisconnected) {
          setIsConnected(true);
          setIgUserName(profile.igUserName || null);
        } else {
          setIsConnected(false);
          setIgUserName(null);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, []);

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
        const savedName = localStorage.getItem('post-ig-image-name') || 'image.jpg';
        setSelectedImage(new File([u8arr], savedName, { type: mime }));
      } catch (e) {
        console.error('Failed to reconstruct file:', e);
      }
    }
  }, [imagePreview]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('post-ig-caption', editedCaption);
    }
  }, [editedCaption]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (imagePreview) {
        localStorage.setItem('post-ig-image', imagePreview);
      } else {
        localStorage.removeItem('post-ig-image');
      }
    }
  }, [imagePreview]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      if (typeof window !== 'undefined') {
        localStorage.setItem('post-ig-image-name', file.name);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // No longer triggering AI caption automatically
      // User will click "Gunakan AI" if they want it
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(editedCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateCaption = async () => {
      if (!selectedImage) {
        toast.error('Harap unggah gambar terlebih dahulu');
        return;
      }

      setIsGeneratingCaption(true);
      try {
        const result = (await generateCaption({ image: selectedImage })) as any;
        if (result?.caption) {
          setEditedCaption(result.caption);
        }
        if (result?.imageUrl) {
          setImagePreview(result.imageUrl);
        }
        toast.success('Caption berhasil diperbarui!');
      } catch (error: any) {
        console.error('Caption Regeneration Error:', error);
        toast.error('Gagal memperbarui caption');
      } finally {
        setIsGeneratingCaption(false);
      }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const profile = getUserProfile();
      if (profile?.id) {
        // Open popup immediately to avoid blocker, then load URL
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          '', 
          'InstagramConnect', 
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
        );

        if (popup) {
            const url = await connectInstagram(profile.id);
            if (url) {
                popup.location.href = url;
                
                // Optional: Monitor popup closure to refresh status
                const timer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(timer);
                        setIsConnecting(false);
                        // Refresh profile to check if connected
                        // Refresh profile to check if connected
                         fetchCurrentUser().then((updatedProfile) => {
                            saveUserProfile(updatedProfile);
                            if (updatedProfile?.igBusinessId) {
                                setIsConnected(true);
                                setIgUserName(updatedProfile.igUserName || null);
                                localStorage.removeItem('ig_manual_disconnected');
                                toast.success('Instagram berhasil terhubung!');
                            }
                        });
                    }
                }, 1000);
            } else {
                popup.close();
                setIsConnecting(false);
                toast.error('Gagal mendapatkan URL koneksi');
            }
        } else {
             setIsConnecting(false);
             toast.error('Popup terblokir. Harap izinkan popup untuk situs ini.');
        }

      } else {
        toast.error('ID Pengguna tidak ditemukan. Silakan login kembali.');
        setIsConnecting(false);
      }
    } catch (error) {
      toast.error('Gagal menghubungkan ke Instagram');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsDisconnectPopoverOpen(true);
  };

  const confirmDisconnect = () => {
    setIsConnected(false);
    setIsPosted(false);
    setIsDisconnectPopoverOpen(false);
    // Persist disconnection locally
    localStorage.setItem('ig_manual_disconnected', 'true');
    toast.success('Koneksi Instagram diputuskan');
  };

  const handlePost = async () => {
    if (!isConnected) {
      toast.error('Harap hubungkan akun Instagram Anda terlebih dahulu');
      return;
    }
    if (!selectedImage) {
      toast.error('Harap unggah gambar');
      return;
    }
    if (!editedCaption) {
      toast.error('Harap masukkan caption');
      return;
    }

    const profile = getUserProfile();
    if (!profile?.igBusinessId) {
      toast.error('Instagram Business ID tidak ditemukan. Harap hubungkan kembali Instagram Anda.');
      return;
    }

    setIsPosting(true);
    try {
      await postToInstagram({
        id: profile.igBusinessId,
        caption: editedCaption,
        image: selectedImage
      });
      setIsPosted(true);
      toast.success('Berhasil diposting ke Instagram!');
    } catch (error: any) {
      console.error('Post Error Details:', error);
      const errorMsg = error.errorMessages ? JSON.stringify(error.errorMessages) : (error.message || 'Gagal memposting ke Instagram');
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="@container flex flex-col h-full lg:h-[calc(100vh-8rem)]">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

      <div className="flex flex-1 flex-col lg:flex-row gap-6 overflow-hidden pb-4">
        {/* Left Column: Editor (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Connection Card */}
          <div className={cn(
            "relative overflow-hidden rounded-xl border p-4 lg:p-6 shadow-sm transition-all duration-300",
            isConnected ? "border-green-100 bg-green-50/30" : "border-gray-200 bg-white"
          )}>
            <div className={cn(
              "flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 ease-in-out",
              isInitialLoading && "blur-[4px] pointer-events-none opacity-40"
            )}>
              <div className="flex items-center gap-3 lg:gap-4">
                <div className={cn(
                  "flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg shadow-sm border",
                  isConnected ? "bg-green-500 text-white border-green-600" : "bg-white text-gray-900 border-gray-200"
                )}>
                  <PiInstagramLogo className="h-5 w-5 lg:h-7 lg:w-7" />
                </div>
                <div>
                  <Title as="h3" className="text-xs lg:text-base font-semibold text-gray-900">
                    {isConnected ? "Instagram Terhubung" : "Hubungkan Instagram"}
                  </Title>
                  <Text className="text-[10px] lg:text-sm text-gray-500">
                    {isConnected ? (igUserName ? `Terhubung sebagai @${igUserName}` : "Siap untuk posting") : "Hubungkan akun Anda"}
                  </Text>
                </div>
              </div>
              {isConnected && !isConnecting ? (
                <Popover
                  isOpen={isDisconnectPopoverOpen}
                  setIsOpen={setIsDisconnectPopoverOpen}
                  placement="bottom-end"
                  shadow="sm"
                >
                  <Popover.Trigger>
                    <Button
                      variant="outline"
                      className="min-w-[100px] lg:min-w-[140px] h-9 lg:h-10 rounded-lg font-medium text-xs lg:text-sm transition-all duration-300"
                    >
                      Putuskan
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="z-[9999] p-2.5 lg:p-4 rounded-xl bg-white border border-gray-200 shadow-xl w-[190px] sm:w-auto sm:max-w-[280px]">
                    <div className="text-left">
                      <Title as="h6" className="mb-1 text-[11px] lg:text-sm font-bold text-gray-900">
                        Putuskan Koneksi?
                      </Title>
                      <Text className="mb-2.5 lg:mb-4 text-[9px] lg:text-xs text-gray-500 leading-tight lg:leading-relaxed">
                        Anda perlu menghubungkan kembali akun Anda untuk posting nanti.
                      </Text>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsDisconnectPopoverOpen(false)}
                          className="flex-1 h-6 lg:h-8 rounded-md text-[9px] lg:text-[11px] font-semibold px-0"
                        >
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={confirmDisconnect}
                          className="flex-1 h-6 lg:h-8 rounded-md bg-red-600 text-white hover:bg-red-700 text-[9px] lg:text-[11px] font-semibold px-0"
                        >
                          Putuskan
                        </Button>
                      </div>
                    </div>
                  </Popover.Content>
                </Popover>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  variant="solid"
                  className={cn(
                    "min-w-[100px] lg:min-w-[140px] h-9 lg:h-10 rounded-lg font-medium text-xs lg:text-sm transition-all duration-300 bg-gray-900 text-white hover:bg-gray-800",
                    isConnecting && "opacity-80"
                  )}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <Loader variant="spinner" className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      <span>Menghubungkan...</span>
                    </div>
                  ) : (
                    "Hubungkan"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Product & Image Input */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 lg:p-6 shadow-sm space-y-6">


            <div>
              <Title as="h3" className="mb-3 lg:mb-4 text-sm lg:text-base font-semibold text-gray-900 flex items-center gap-2">
                <PiUploadSimple className="h-4 w-4 lg:h-5 lg:w-5" />
                Unggah Gambar
              </Title>
              
              <label
                htmlFor="image-upload"
                className={cn(
                  'group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed transition-all duration-200',
                  imagePreview
                    ? 'border-gray-300 bg-gray-50 p-4'
                    : 'border-gray-300 bg-gray-50 py-10 hover:border-gray-400 hover:bg-gray-100'
                )}
              >
                {imagePreview ? (
                  <div className="w-full text-center">
                    <div className="relative mx-auto mb-3 overflow-hidden rounded-lg border border-gray-200 shadow-sm max-w-[200px]">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="aspect-square w-full object-cover"
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
                      Klik untuk unggah gambar
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500">
                      JPG, PNG (max. 5MB)
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
            </div>
          </div>

          {/* Caption Editor Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 lg:p-6 shadow-sm">
            <div className="mb-3 lg:mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Title as="h3" className="text-sm lg:text-base font-semibold text-gray-900">
                  Caption
                </Title>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => {
                    setEditedCaption('');
                    toast.success('Siap menulis manual');
                  }}
                  className="text-gray-500 hover:bg-gray-100 h-8 text-[10px] lg:text-xs px-2"
                >
                  <PiPencilSimple className="me-1 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  Manual
                </Button>
                <Button
                  variant="solid"
                  size="sm"
                  onClick={handleRegenerateCaption}
                  disabled={isGeneratingCaption || !selectedImage}
                  className="bg-gray-900 text-white hover:bg-gray-800 h-8 text-[10px] lg:text-xs px-3 rounded-lg shadow-sm"
                >
                  {isGeneratingCaption ? (
                    <>
                      <Loader variant="spinner" className="me-1.5 h-3 w-3 lg:h-3.5 lg:w-3.5" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <PiMagicWand className="me-1.5 h-3.5 w-3.5 lg:h-4 lg:w-4" />
                      Gunakan AI
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <Textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="min-h-[200px] rounded-xl border-gray-300 focus:border-gray-900 focus:ring-gray-900/10 text-sm leading-relaxed"
                placeholder="Tulis caption Anda di sini..."
                disabled={isGeneratingCaption}
              />
              {isGeneratingCaption && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-xl z-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader variant="spinner" className="h-8 w-8 text-gray-900" />
                    <Text className="text-xs font-medium text-gray-600">Menyusun caption terbaik...</Text>
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCaption}
                  className="h-8 rounded-lg bg-white/80 backdrop-blur-sm border-gray-200"
                >
                  {copied ? <PiCheck className="h-4 w-4 text-green-600" /> : <PiCopy className="h-4 w-4" />}
                  <span className="ml-1 text-[11px]">{copied ? 'Tersalin' : 'Salin'}</span>
                </Button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
              <span>{editedCaption.length} karakter</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pb-6">
            <Button
              onClick={handlePost}
              disabled={isPosting || isPosted || !isConnected}
              className={cn(
                'flex-1 h-11 lg:h-12 rounded-xl text-sm lg:text-base font-semibold shadow-sm transition-all',
                isPosted 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : !isConnected
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
              )}
            >
              {isPosting ? (
                <>
                  <Loader variant="spinner" className="me-2 h-5 w-5" />
                  Memposting...
                </>
              ) : isPosted ? (
                <>
                  <PiCheck className="me-2 h-5 w-5" />
                  Berhasil Diposting
                </>
              ) : !isConnected ? (
                <>
                  <PiInstagramLogo className="me-2 h-5 w-5 opacity-50" />
                  Hubungkan untuk Posting
                </>
              ) : (
                <>
                  <PiInstagramLogo className="me-2 h-5 w-5" />
                  Posting ke Instagram
                </>
              )}
            </Button>
            
            {isPosted && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsPosted(false);
                  setEditedCaption('');
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('post-ig-caption');
                    localStorage.removeItem('post-ig-image');
                  }
                }}
                className="h-12 rounded-xl border-gray-200 px-8 font-semibold hover:bg-gray-50"
              >
                Buat Postingan Baru
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Preview (Fixed width) */}
        <div className="w-full lg:w-[380px] xl:w-[400px]">
          <div className="sticky top-0 pb-6 lg:pb-0">
            <div className="mb-4 flex items-center justify-between px-2">
              <Title as="h3" className="text-[10px] lg:text-sm font-bold text-gray-500 uppercase tracking-wider">
                Pratinjau Langsung
              </Title>
              <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* iPhone 11/12 Frame (Notch Style) */}
            <div className="relative mx-auto h-[640px] lg:h-[720px] w-[310px] lg:w-[350px] rounded-[40px] lg:rounded-[45px] border-[10px] lg:border-[12px] border-gray-900 bg-white shadow-2xl">
              {/* Notch */}
              <div className="absolute left-1/2 top-0 z-20 h-[28px] w-[160px] -translate-x-1/2 rounded-b-[18px] bg-gray-900">
                {/* Speaker */}
                <div className="absolute left-1/2 top-[6px] h-[4px] w-[40px] -translate-x-1/2 rounded-full bg-[#222]" />
                {/* Camera */}
                <div className="absolute right-[35px] top-[6px] h-[6px] w-[6px] rounded-full bg-[#111]" />
              </div>

              {/* Side Buttons */}
              <div className="absolute -left-[14px] top-[100px] h-[26px] w-[3px] rounded-l-sm bg-gray-800" /> {/* Mute */}
              <div className="absolute -left-[14px] top-[140px] h-[45px] w-[3px] rounded-l-sm bg-gray-800" /> {/* Vol Up */}
              <div className="absolute -left-[14px] top-[195px] h-[45px] w-[3px] rounded-l-sm bg-gray-800" /> {/* Vol Down */}
              <div className="absolute -right-[14px] top-[140px] h-[70px] w-[3px] rounded-r-sm bg-gray-800" /> {/* Power */}

              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-[32px] z-10 flex justify-between items-center px-6 text-[11px] font-semibold text-black">
                  <span className="pl-2">9:41</span>
                  <div className="flex gap-1.5 items-center -mr-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-black" /> {/* Signal */}
                      <div className="h-2.5 w-2.5 rounded-full bg-black" /> {/* WiFi */}
                      <div className="h-3 w-5 rounded-[4px] border border-black bg-black" /> {/* Battery */}
                  </div>
              </div>

              {/* Content Area (Scrollable) */}
              <div className="h-full w-full overflow-y-auto pt-10 pb-8 scrollbar-hide rounded-[32px] bg-white">
                  {/* IG Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
                        <div className="h-full w-full rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          <div className="h-full w-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">KM</div>
                        </div>
                      </div>
                      <div>
                        <Text className="text-xs font-bold text-gray-900">{igUserName || 'kedaimaster'}</Text>
                        <Text className="text-[10px] text-gray-500 leading-none">Jakarta, Indonesia</Text>
                      </div>
                    </div>
                    <PiDotsThreeBold className="h-5 w-5 text-gray-700" />
                  </div>

                  {/* IG Image */}
                  <div className="aspect-square bg-gray-100 relative group flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Post"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <PiInstagramLogo className="h-12 w-12 mb-2 opacity-20" />
                        <Text className="text-xs">Belum ada gambar terpilih</Text>
                      </div>
                    )}
                    
                    {isPosted && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-500">
                        <div className="scale-110 rounded-2xl bg-white p-6 text-center shadow-2xl animate-in zoom-in duration-300">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <PiCheck className="h-10 w-10 text-green-600" />
                          </div>
                          <Text className="font-bold text-gray-900">Postingan Tayang!</Text>
                          <Text className="text-xs text-gray-500 mt-1">Cek feed Anda</Text>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* IG Actions */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <PiHeart className="h-6 w-6 text-gray-800" />
                        <PiChatCircle className="h-6 w-6 text-gray-800" />
                        <PiPaperPlaneTilt className="h-6 w-6 text-gray-800" />
                      </div>
                      <PiBookmarkSimple className="h-6 w-6 text-gray-800" />
                    </div>
                    <Text className="text-xs font-bold text-gray-900 mb-1">1.482 suka</Text>
                    
                    {/* IG Caption */}
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold text-gray-900 mr-1">{igUserName || 'kedaimaster'}</span>
                      <span className="text-gray-800 whitespace-pre-line">
                        {editedCaption.length > 150 ? editedCaption.substring(0, 150) + '...' : editedCaption}
                      </span>
                      {editedCaption.length > 150 && (
                        <span className="text-gray-400 ml-1 cursor-pointer">selengkapnya</span>
                      )}
                    </div>
                    <Text className="text-[9px] text-gray-400 mt-2 uppercase tracking-tighter">Baru saja</Text>
                  </div>
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-[6px] left-1/2 h-[4px] w-[120px] -translate-x-1/2 rounded-[2px] bg-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

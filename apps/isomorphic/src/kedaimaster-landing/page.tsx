interface AuthModalProps {
  show: boolean;
  onClose: (loginSuccess?: boolean) => void;
  initialMode: 'login' | 'register';
}

interface PricingModalProps {
  show: boolean;
  onClose: () => void;
  packageType: string;
}

import React, { useState, useEffect } from "react";

import {
  Store,
  PlayCircle,
  FileBarChart2,
  Boxes,
  QrCode,
  ChevronLeft,
  MoreVertical,
  ArrowRight,
  Bot,
  TrendingUp,
  Megaphone,
  BrainCircuit,
  Cloud,
  Building2,
  Check,
  CheckCircle2,
  MessageCircle
} from 'lucide-react';
import "./page.css";


import { useNavigate } from "react-router-dom";
// Impor AuthModal yang sudah dipisah
// Impor fungsi API
import { getTokens, clearTokens } from "@/kedaimaster-api/authApi";
import authApiHandlers, { Profile } from "@/kedaimaster-api-handlers/authApiHandlers";
import PricingModal from "./PricingModal"; // Import the PricingModal component


const link = document.createElement("link");
link.rel = "stylesheet";
link.href =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(link);
// Mengimpor fungsi otentikasi dari file API (mock)
import { authenticate, registerUser } from '@/kedaimaster-api/authApi';

interface UserData extends Profile { }


// --- Komponen Modal Otentikasi ---
const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, initialMode }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMessage('');
    setEmail('');
    setPassword('');
    setName('');
    setPasswordConfirm('');
  }, [show, initialMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const user = await authenticate({ email, password });
      console.log('Login berhasil:', user);
      setSuccessMessage('Login berhasil!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Email atau password salah.');
      console.error('Login gagal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      if (password !== passwordConfirm) {
        throw new Error('Password dan konfirmasi password tidak cocok.');
      }
      const newUser = await registerUser({ email, password, passwordConfirm, role: 'user' });
      console.log('Registrasi berhasil:', newUser);
      setSuccessMessage('Registrasi berhasil! Silakan login.');
      setMode('login'); // Ganti mode ke login setelah berhasil registrasi
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan registrasi.');
      console.error('Registrasi gagal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  const isLoginMode = mode === 'login';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={() => onClose()}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isLoginMode ? 'Masuk' : 'Daftar Akun Baru'}</h2>
          <button onClick={() => onClose()} className="text-slate-500 hover:text-slate-800 text-2xl">&times;</button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}
        {successMessage && <div className="bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-md mb-4" role="alert">{successMessage}</div>}

        <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
          {!isLoginMode && (
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
                Nama Lengkap
              </label>
              <input
                className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="name"
                type="text"
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isLoginMode && (
              <div className="mb-6">
                <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="passwordConfirm">
                  Konfirmasi Password
                </label>
                <input
                  className="shadow-sm appearance-none border rounded-md w-full py-2 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="passwordConfirm"
                  type="password"
                  placeholder="******************"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between flex-col">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-slate-400"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : (isLoginMode ? 'Masuk' : 'Daftar')}
            </button>
            <button
              type="button"
              onClick={() => setMode(isLoginMode ? 'register' : 'login')}
              className="inline-block align-baseline font-bold text-sm text-emerald-600 hover:text-emerald-800 mt-4"
            >
              {isLoginMode ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default function LandingPage() {

  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // State baru untuk status otentikasi
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Mulai dengan loading
  const [userData, setUserData] = useState<UserData | null>(null);

  // Cek token saat komponen dimuat
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsAuthLoading(true);
      const { accessToken } = getTokens();

      if (!accessToken) {
        console.log("Tidak ada token, pengguna logout.");
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        setUserData(null);
        return;
      }

      try {
        // Coba ambil profil pengguna untuk memvalidasi token
        console.log("Token ditemukan, memvalidasi...");
        const profile = await authApiHandlers.getProfileData(); // Menggunakan fungsi getProfileData dari authApiHandlers
        if (!profile) throw { status: 401, message: "Token tidak valid" };
        console.log("Token valid, pengguna login:", profile);
        setIsAuthenticated(true);
        setUserData(profile);
      } catch (error: any) {
        console.error("Gagal memvalidasi token:", error.message);
        if (error.status === 401 || error.status === 403) {
          console.log("Token tidak valid atau expired, membersihkan token.");
          clearTokens(); // Hapus token yang tidak valid
        }
        setIsAuthenticated(false);
        setUserData(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // [] berarti hanya berjalan sekali saat mount

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    }
  }, []);

  const openPricingModal = (packageType: string) => {
    setSelectedPackage(packageType);
    setShowPricingModal(true);
  };

  const closePricingModal = () => {
    setShowPricingModal(false);
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = (loginSuccess?: boolean) => {
    setShowAuthModal(false);
    // Jika login sukses, kita refresh status auth
    if (loginSuccess) {
      setIsAuthLoading(true);
      authApiHandlers.getProfileData()
        .then((profile: Profile | null) => {
          if (profile) {
            setIsAuthenticated(true);
            setUserData(profile);
          }
        })
        .catch((err: any) => console.error("Gagal fetch profil setelah login", err))
        .finally(() => setIsAuthLoading(false));
    }
  };

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUserData(null);
    console.log("Pengguna telah logout.");
  };
  return (
    <div className="antialiased overflow-x-hidden border-t-[12px] border-[#00A651] font-inter">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex gap-2 items-center">
          <div className="w-10 h-10 bg-[#FFEA28] rounded-full flex items-center justify-center text-black border-2 border-black">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
            KEDAIMASTER
          </span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#fitur" className="hover:text-[#FFEA28] transition text-sm font-semibold text-white drop-shadow-md">
            Fitur
          </a>
          <a href="#ai" className="hover:text-[#FFEA28] transition text-sm font-semibold text-white drop-shadow-md">
            AI Tech
          </a>
          <a href="#kelebihan" className="text-sm font-semibold text-white hover:text-[#FFEA28] transition drop-shadow-md">
            Kelebihan
          </a>
        </div>
        <div className="flex gap-4 items-center">
          {/* <a onClick={() => openAuthModal('login')}
            className="hidden md:block text-sm font-semibold text-white hover:text-[#FFEA28] transition drop-shadow-md">
            Masuk
          </a> */}
          <a
            onClick={() => openAuthModal('login')} className="hover:bg-[#222] transition transform hover:-translate-y-0.5 text-sm font-bold text-white bg-black border-white border-2 rounded-full pt-2.5 pr-5 pb-2.5 pl-5 shadow-[4px_4px_0px_0px_rgba(255,234,40,1)]"
          >
            Masuk
          </a>
        </div>
      </nav>

      {/* Hero Section (Green) */}
      <header className="md:pt-40 md:pb-32 overflow-hidden bg-[#00A651] pt-40 pr-6 pb-32 pl-6 relative">
        {/* Decorative elements */}
        <div className="overflow-hidden pointer-events-none md:opacity-100 opacity-20 w-full h-full absolute top-0 left-0">
          {/* Left Image: Chef/Barista */}
          <img
            src="https://images.unsplash.com/photo-1542181961-9590d0c79dab?auto=format&fit=crop&q=80&w=400"
            className="md:w-48 md:h-48 bg-center w-32 h-32 object-cover border-[#FFEA28] border-4 rounded-full absolute top-20 left-[-30px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-12deg]"
            alt="Barista Siapkan Kopi"
            width="400"
            height="400"
            loading="eager"
          />
          {/* Right Image: Customer */}
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=400"
            className="md:right-20 md:w-56 md:h-56 w-40 h-40 object-cover border-black border-4 rounded-full absolute top-32 right-[-20px] shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[15deg]"
            alt="Pelanggan Senang di Kafe"
            width="400"
            height="400"
            loading="eager"
          />

          {/* Floating Pills */}
          <div className="md:left-1/4 transform text-sm font-bold text-black bg-[#FFEA28] border-black border-2 rounded-full pt-2 pr-5 pb-2 pl-5 absolute bottom-10 left-10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-6">
            Smart Cafe ☕
          </div>

          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            {/* Bubble 1 */}
            <div
              className="md:left-[10%] animate-bounce absolute top-[12%] left-[5%]"
              style={{ animationDuration: '4s', animationDelay: '0s' }}
            >
              <div className="transform md:text-sm hover:scale-110 transition cursor-pointer pointer-events-auto text-xs font-bold text-white bg-black border-white border-2 rounded-full pt-2 pr-5 pb-2 pl-5 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] -rotate-6">
                Order Cepat 🚀
              </div>
            </div>

            {/* Bubble 2 */}
            <div
              className="md:right-[20%] animate-bounce absolute top-[20%] right-[5%]"
              style={{ animationDuration: '5s', animationDelay: '1.5s' }}
            >
              <div className="transform rotate-12 text-xs md:text-sm font-bold text-black bg-[#FFEA28] border-black border-2 rounded-full pt-2 pr-5 pb-2 pl-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition cursor-pointer pointer-events-auto">
                Scan QR 📱
              </div>
            </div>

            {/* Bubble 3 */}
            <div
              className="md:left-[8%] animate-bounce absolute bottom-[40%] left-[2%]"
              style={{ animationDuration: '6s', animationDelay: '2.5s' }}
            >
              <div className="transform md:text-sm hover:scale-110 transition cursor-pointer text-xs font-bold text-white bg-black pointer-events-auto border-white border-2 rounded-full pt-2 pr-5 pb-2 pl-5 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] rotate-3">
                Laporan Realtime 📊
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 text-center max-w-4xl mr-auto ml-auto relative">
          <h1 className="md:text-8xl leading-[0.9] text-5xl font-black text-white tracking-tight font-instrument-serif mb-8 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            Manajemen Kafe<br />Era Baru.
          </h1>
          <p className="md:text-2xl leading-relaxed text-lg font-medium text-white font-manrope max-w-2xl mr-auto mb-10 ml-auto drop-shadow-md">
            Tempat inovasi bertemu efisiensi. Ubah operasi tradisional menjadi
            pengalaman cerdas, lancar, dan profesional dengan bantuan AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="#contact"
              className="sm:w-auto hover:bg-[#ffe144] transition transform hover:-translate-y-1 text-lg font-bold text-black bg-[#FFEA28] w-full border-black border-2 rounded-full pt-4 pr-8 pb-4 pl-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Mulai Sekarang
            </a>
            <button className="sm:w-auto hover:bg-neutral-100 transition flex gap-2 text-lg font-semibold text-black bg-white w-full border-black border-2 rounded-full pt-4 pr-8 pb-4 pl-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] items-center justify-center">
              <PlayCircle className="w-5 h-5" />
              Lihat Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex gap-4 text-white mt-12 gap-x-4 gap-y-4 items-center justify-center">
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
                className="w-10 h-10 rounded-full border-2 border-black object-cover"
                alt="Pengguna 1"
                width="100"
                height="100"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
                className="w-10 h-10 rounded-full border-2 border-black object-cover"
                alt="Pengguna 2"
                width="100"
                height="100"
              />
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100"
                className="w-10 h-10 rounded-full border-2 border-black object-cover"
                alt="Pengguna 3"
                width="100"
                height="100"
              />
            </div>
            <div className="text-sm font-bold tracking-wide">
              Dipercaya 500+ bisnis F&B
            </div>
          </div>
        </div>
      </header>

      {/* Value Prop / Features (Yellow) */}
      <section id="fitur" className="overflow-hidden bg-[#FFEA28] border-black border-t-2 pt-24 pr-6 pb-24 pl-6 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-black mb-8 leading-none">
              Solusi Cerdas <br />Bisnis Anda.
            </h2>

            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-[#FFEA28] flex items-center justify-center flex-shrink-0 mt-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <FileBarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      1. Laporan & Analisis Otomatis
                    </h3>
                    <p className="text-black/80 font-medium leading-relaxed">
                      Semua data bisnis diolah otomatis oleh AI. Hasil cepat,
                      akurat, dan efisien tanpa repot. Tingkatkan profit langsung!
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-[#FFEA28] flex items-center justify-center flex-shrink-0 mt-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      2. Manajemen Stok & Bahan
                    </h3>
                    <p className="text-black/80 font-medium leading-relaxed">
                      Pastikan ketersediaan barang selalu tepat waktu. Tanpa
                      kelebihan, tanpa kekurangan, semua otomatis terkontrol.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-black text-[#FFEA28] flex items-center justify-center flex-shrink-0 mt-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">
                      3. Pesan Langsung di Meja
                    </h3>
                    <p className="text-black/80 font-medium leading-relaxed">
                      Pelanggan pesan via scan QR. Tanpa tunggu pelayan, lihat menu,
                      promo, dan pesan instan. Cepat & nyaman.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-[#333] transition shadow-[4px_4px_0px_0px_rgba(0,166,81,1)]">
                Lihat Fitur Lainnya
              </button>
            </div>
          </div>

          <div className="order-1 md:order-2 relative flex justify-center">
            {/* Phone Mockup */}
            <div className="h-full relative">
              {/* App UI Simulation */}
              <img className="relative z-[7]" src="/clientt.png" alt="" />
              <div
                style={{
                  color: "white",
                  transform: "rotateX(49deg) rotateY(18deg) rotateZ(-19deg)",
                  position: "absolute",
                  width: "58.5%",
                  height: "132.5%",
                  top: "-18%",
                  right: "18.5%",
                }}
                className='z-[6] shadow-[-87px_84px_38px_0px_#00000042]'
              >
                <img src={'https://i.ibb.co.com/FkVjVKTh/browser.webp'} />
                {/* Layar Depan */}
                <div
                  style={{
                    width: "100%",
                    height: "calc(100% - 29.36px)",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0% 0% 15% 15%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    className="main-screen-content"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      animation: "scrollBottom 20s infinite",
                      position: "absolute",
                      backgroundColor: "white",
                    }}
                  >
                    <img
                      src="https://i.ibb.co.com/Y46TWzNM/header.webp"
                      alt="Header"
                      style={{ width: "100%" }}
                    />
                    <div
                      className="player"
                      style={{ position: "relative" }}
                    >
                      <img
                        src="https://i.ibb.co.com/BKqsKwD4/player.webp"
                        alt="Player 1"
                        style={{
                          width: "100%",
                          animation: "playerUnexpandedOpacity 20s infinite",
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/yBxzS3HY/player2.webp"
                        alt="Player 2"
                        style={{
                          width: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          animation: "player2ExpandedOpacity 20s infinite",
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/YFX6JXdv/player3.webp"
                        alt="Player 3"
                        style={{
                          width: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          animation: "player3ExpandedOpacity 20s infinite",
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/cX7Ksgrk/player4.webp"
                        alt="Player 4"
                        style={{
                          width: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          animation: "player4ExpandedOpacity 20s infinite",
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/N2kXXjH0/player5.webp"
                        alt="Player 5"
                        style={{
                          width: "100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          animation: "player5ExpandedOpacity 20s infinite",
                        }}
                      />
                      <div
                        style={{
                          animation: "playerSearch 20s infinite",
                          position: "absolute",
                          top: "230%",
                          left: 0,
                          width: "100%",
                          zIndex: 5,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <img
                          src="https://i.ibb.co.com/S7ynkfMD/search.webp"
                          alt="Search"
                          style={{
                            width: "70%",
                            height: "70%",
                            objectFit: "contain",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            animation: "playerSearchText 20s infinite",
                            width: "30%",
                            height: "80%",
                            backgroundColor: "white",
                          }}
                        ></div>
                      </div>
                      <img
                        src="https://i.ibb.co.com/PzVyhX2N/music1.webp"
                        alt="Music 1"
                        style={{
                          width: "114%",
                          maxWidth: "114%",
                          animation: "musicExpanded 20s infinite",
                          position: "absolute",
                          top: "309%",
                          left: "-7%",
                          zIndex: 5,
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/DDf1v7Sh/music3.webp"
                        alt="Music 2"
                        style={{

                          width: "114%",
                          maxWidth: "114%",
                          animation: "music2Expanded 20s infinite",
                          position: "absolute",
                          top: "406%",
                          left: "-7%",
                          zIndex: 5,
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/Z6T9pWnn/music2.webp"
                        alt="Music 3"
                        style={{

                          width: "114%",
                          maxWidth: "114%",
                          animation: "musicExpanded 20s infinite",
                          position: "absolute",
                          top: "504%",
                          left: "-7%",
                          zIndex: 5,
                        }}
                      />
                      <img
                        src="https://i.ibb.co.com/bgFH7B2S/music4.webp"
                        alt="Music 4"
                        style={{

                          width: "114%",
                          maxWidth: "114%",
                          animation: "musicExpanded 20s infinite",
                          position: "absolute",
                          top: "607%",
                          left: "-7%",
                          zIndex: 5,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          width: "7%",
                          height: "150%",
                          backgroundColor: "#f0f2f5",
                          right: "-3%",
                          top: "376%",
                          animation: "musicExpanded 20s infinite",
                          zIndex: 5,
                        }}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          width: "90%",
                          height: "180%",
                          backgroundColor: "white",
                          top: "425%",
                          animation: "musicExpanded 20s infinite",
                          zIndex: 4,
                        }}
                      ></div>
                    </div>
                    <div style={{ animation: "bodyDown 20s infinite" }}>
                      <img
                        src="https://i.ibb.co.com/h1BP8Kpg/menu.webp"
                        alt="Body"
                        style={{ width: "100%" }}
                      />
                      <div
                        style={{
                          position: "relative",
                          top: "-66.1%",
                          left: "68%",
                          width: "25%",
                          animation:
                            "escappucinoscaleAnimation 20s infinite",
                        }}
                      >
                        <img
                          src="https://i.ibb.co.com/XrzSDsPr/pesan.webp"
                          alt="Escappucino"
                          style={{
                            width: "100%",
                            position: "absolute",
                            animation:
                              "escappucinochildOpacityAnimation 20s infinite",
                          }}
                        />
                        <img
                          src="https://i.ibb.co.com/PGSwW4wx/pesan1.webp"
                          alt="Escappucino 1"
                          style={{
                            width: "100%",
                            position: "absolute",
                            animation:
                              "escappucinochildOpacityAnimation2 20s infinite",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          position: "relative",
                          top: "-33.3%",
                          left: "68%",
                          width: "25%",
                          animation:
                            "chickenkatsuscaleAnimation 20s infinite",
                        }}
                      >
                        <img
                          src="https://i.ibb.co.com/XrzSDsPr/pesan.webp"
                          alt="Chicken Katsu"
                          style={{
                            width: "100%",
                            position: "absolute",
                            animation:
                              "chickenkatsuchildOpacityAnimation 20s infinite",
                          }}
                        />
                        <img
                          src="https://i.ibb.co.com/PGSwW4wx/pesan1.webp"
                          alt="Chicken Katsu 1"
                          style={{
                            width: "100%",
                            position: "absolute",
                            animation:
                              "chickenkatsuchildOpacityAnimation2 20s infinite",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: "85%",
                      top: "84%",
                      animation: "cartbuttonscaleAnimation 20s infinite",
                    }}
                  >
                    <img
                      src="https://i.ibb.co.com/WWCyFFy0/cart-1.webp"
                      alt="Cart Button"
                      style={{
                        width: "100%",
                        position: "absolute",
                        animation:
                          "cartbuttonchildOpacityAnimation 20s infinite",
                      }}
                    />
                    <img
                      src="https://i.ibb.co.com/dsNM19TJ/cart-2.webp"
                      alt="Cart 2"
                      style={{
                        width: "100%",
                        animation:
                          "cartbuttonchildOpacityAnimation2 20s infinite",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      left: "100%",
                      animation: "cartslideinAnimation 20s infinite",
                    }}
                  >
                    <img
                      src="https://i.ibb.co.com/v6dyq37g/cart.webp"
                      alt="Cart"
                      style={{ width: "100%", height: "100%" }}
                    />
                    <img
                      src="https://i.ibb.co.com/Mxrjc9Dc/checkout.png"
                      alt="Checkout"
                      style={{
                        width: "100%",
                        position: "absolute",
                        top: "85.7%",
                        left: 0,
                        animation:
                          "checkoutbuttonscaleAnimation 20s infinite",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      animation: "transactionAnimation 20s infinite",
                      backgroundColor: "#0000006b",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src="https://i.ibb.co.com/1p7pnnD/transaction.png"
                      alt="Transaction"
                      style={{
                        width: "80%",
                        animation:
                          "transactionElementAnimation 20s infinite",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img className="relative z-[5]" src="/tenanttt.png" alt="" />
              <div
                style={{
                  color: "white",
                  transform: "rotateX(57deg) rotateY(-20deg) rotateZ(28deg)",
                  position: "absolute",
                  width: "51%",
                  height: "121%",
                  top: "1%",
                  right: "1%",
                  transformOrigin: "right top",
                }}
                className='shadow-[71px_84px_38px_0px_#00000042]'
              >

                <img style={{
                  borderRadius: "26% 26% 0% 0%",
                }} src={'https://i.ibb.co.com/FkVjVKTh/browser.webp'} />
                {/* Layar Belakang */}
                <div
                  style={{
                    width: "100%",
                    height: "calc(100% - 22.36px)",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0% 0% 15% 15%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  className='z-[4]'
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      animation: "reportScrollBottom 15s infinite",
                    }}
                  >
                    <img
                      src="https://i.ibb.co.com/vvqDfRQ8/Dashboard.webp"
                      alt="Second Main"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section (Black) */}
      <div id="ai" className="text-[#FFEA28] bg-black border-black border-t-2 relative">
        {/* Top Wave SVG */}
        <svg
          className="absolute top-0 w-full h-16 md:h-32 -mt-1 transform rotate-180"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#FFEA28"
            fillOpacity="1"
            d="M0,96L80,112C160,128,320,160,480,160C640,160,800,128,960,112C1120,96,1280,96,1360,96L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>

        <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5">
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-[#00A651] leading-none mb-6">
                Power of<br />
                Artificial<br />
                Intelligence.
              </h2>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFEA28] text-black rounded-full font-bold hover:bg-white transition border-2 border-transparent hover:border-[#FFEA28]"
              >
                Cobain AI
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="md:col-span-7 flex flex-col justify-center">
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                KEDAIMASTER bukan sekadar aplikasi kasir. Ini adalah asisten bisnis
                cerdas Anda. Dengan teknologi AI terdepan, kami membantu Anda
                memprediksi tren, melayani pelanggan, dan mengelola stok secara
                otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="pb-32 px-6">
          <div className="max-w-6xl mr-auto ml-auto">
            <div className="text-center mb-16">
              <span className="bg-[#222] text-[#FFEA28] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider border border-[#333]">
                Fitur Unggulan AI
              </span>
              <h3 className="text-4xl md:text-5xl font-bold text-white mt-4">
                Kecerdasan Buatan
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 gap-x-6 gap-y-6">
              {/* AI Asisten Pelanggan */}
              <div className="group hover:bg-[#222] transition duration-300 overflow-hidden cursor-pointer hover:border-[#FFEA28] bg-[#1a1a1a] border-neutral-800 border-2 rounded-3xl pt-8 pr-8 pb-8 pl-8 relative">
                <div className="mb-6">
                  <Bot className="w-24 h-24 text-[#FFEA28]" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  AI Asisten Pelanggan
                </h4>
                <p className="text-neutral-400 text-sm mb-6">
                  Layanan pelanggan 24 jam via chat & suara. Responsif dan personal.
                </p>
                <span className="text-[#FFEA28] text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Lebih Lanjut <ArrowRight className="w-4 h-4" />
                </span>
              </div>

              {/* AI Prediksi Inventaris */}
              <div className="group relative bg-[#1a1a1a] rounded-3xl p-8 hover:bg-[#222] transition duration-300 overflow-hidden cursor-pointer border-2 border-neutral-800 hover:border-[#00A651]">
                <div className="mb-6">
                  <TrendingUp className="w-24 h-24 text-[#00A651]" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  AI Prediksi Inventaris
                </h4>
                <p className="text-neutral-400 text-sm mb-6">
                  Kelola stok cerdas. Estimasi produk laku dan waktu restock
                  otomatis.
                </p>
                <span className="text-[#00A651] text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Lebih Lanjut <ArrowRight className="w-4 h-4" />
                </span>
              </div>

              {/* AI Agen Pemasaran */}
              <div className="group relative bg-[#1a1a1a] rounded-3xl p-8 hover:bg-[#222] transition duration-300 overflow-hidden cursor-pointer border-2 border-neutral-800 hover:border-[#FFEA28]">
                <div className="mb-6">
                  <Megaphone className="w-24 h-24 text-[#FFEA28]" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  AI Agen Pemasaran
                </h4>
                <p className="text-neutral-400 text-sm mb-6">
                  Buat konten visual & caption otomatis. Posting langsung ke sosmed.
                </p>
                <span className="text-[#FFEA28] text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Lebih Lanjut <ArrowRight className="w-4 h-4" />
                </span>
              </div>

              {/* AI Penasihat Bisnis */}
              <div className="group relative bg-[#1a1a1a] rounded-3xl p-8 hover:bg-[#222] transition duration-300 overflow-hidden cursor-pointer border-2 border-neutral-800 hover:border-[#00A651]">
                <div className="mb-6">
                  <BrainCircuit className="w-24 h-24 text-[#00A651]" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  AI Penasihat Bisnis
                </h4>
                <p className="text-neutral-400 text-sm mb-6">
                  Konsultan digital pribadi. Analisis dan strategi berbasis data
                  real-time.
                </p>
                <span className="text-[#00A651] text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Lebih Lanjut <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kelebihan Section (White) */}
      <section id="kelebihan" className="bg-white py-24 px-6 border-t-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-black leading-none mb-6 md:mb-0 drop-shadow-[3px_3px_0px_rgba(0,166,81,1)]">
              Kelebihan<br />KEDAIMASTER.
            </h2>
            <button className="px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-[#333] transition shadow-[4px_4px_0px_0px_rgba(0,166,81,1)]">
              Lihat Semua
            </button>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card (Green) */}
            <div className="md:col-span-2 bg-[#00A651] rounded-[2rem] p-8 md:p-12 relative overflow-hidden min-h-[400px] flex flex-col justify-end border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {/* Placeholder image */}
              <div className="absolute inset-0 bg-[#008f45]"></div>
              <div className="relative z-10">
                <span className="bg-[#FFEA28] text-black text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block border border-black">
                  All-in-One
                </span>
                <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-md">
                  "Sistem Terpadu dari hulu ke hilir."
                </h3>
                <p className="text-white font-medium text-lg">
                  Kasir, Pesanan, Laporan dalam satu platform.
                </p>
              </div>
            </div>

            {/* Small Card 1 (Black) */}
            <div className="bg-black rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div>
                <span className="bg-[#00A651] text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block">
                  Cloud
                </span>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Aman & Berbasis Cloud
                </h3>
                <p className="text-neutral-400 text-sm">
                  Akses data kapan saja, dari mana saja.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <Cloud className="w-20 h-20 text-[#FFEA28]" />
              </div>
            </div>

            {/* Small Card 2 (Yellow) */}
            <div className="bg-[#FFEA28] rounded-[2rem] p-8 text-black flex flex-col justify-between border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="">
                <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 inline-block">
                  UX Design
                </span>
                <h3 className="text-2xl font-bold text-black mb-2">Desain Simpel</h3>
              </div>
              <div className="mt-4">
                <p className="font-bold text-lg mb-4">
                  Mudah digunakan oleh kasir maupun pelanggan.
                </p>
              </div>
            </div>

            {/* Medium Card (White/Bordered) */}
            <div className="md:col-span-2 bg-[#f4f4f4] rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-black mb-4">
                  Multi-Cabang & Multi-Tenant
                </h3>
                <p className="text-black/70 text-lg mb-6">
                  Kelola banyak outlet sekaligus dari satu dashboard tanpa repot.
                  Cocok untuk franchise dan food court.
                </p>
              </div>
              <div className="w-full md:w-1/3">
                <div className="bg-white p-6 rounded-2xl border-2 border-black text-black text-center shadow-md">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-[#00A651]" />
                  <p className="font-bold">Scale Up Bisnis!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Black) */}

      <section id="pricing" className="bg-black py-24 px-6 border-t-2 border-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-[#FFEA28] text-black px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider border border-white">
              Investasi Cerdas
            </span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mt-6 leading-none">
              Pilih Paket<br />Yang Sesuai.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch">

            {/* Starter Pack (The Entry Level) */}
            <div className="bg-white rounded-[2rem] p-6 flex flex-col relative group hover:-translate-y-2 transition duration-300 border-2 border-transparent hover:border-[#FFEA28]">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Starter Pack
                </span>
                <h3 className="text-2xl font-black text-black mt-2">
                  Rp 450k<span className="text-sm font-medium text-neutral-500">/bln</span>
                </h3>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm font-bold text-black">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  POS Web Apps & Kasir
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Manajemen Menu & Stok
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Order via QR Code
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Integrasi QRIS & Printer
                </li>
              </ul>
              <a
                href="https://wa.me/6281318894994?text=Saya%20tertarik%20Starter%20Pack"
                className="w-full block py-3 rounded-xl border-2 border-black font-bold text-center hover:bg-black hover:text-white transition"
              >
                Pilih Paket
              </a>
            </div>

            {/* Basic Pack (Now 699k) */}
            <div className="bg-white rounded-[2rem] p-6 flex flex-col relative group hover:-translate-y-2 transition duration-300 border-2 border-transparent hover:border-[#FFEA28]">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Basic Pack
                </span>
                <h3 className="text-2xl font-black text-black mt-2">
                  Rp 699k<span className="text-sm font-medium text-neutral-500">/bln</span>
                </h3>
              </div>
              <p className="text-[10px] font-bold text-neutral-400 mb-4 uppercase tracking-tighter">Termasuk semua fitur Starter +</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm font-bold text-black">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Xallira Customer Assistant
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  AI Chat (Order via Web)
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Rekomendasi Menu by AI
                </li>
                <li className="flex items-start gap-2 text-sm font-bold text-[#00A651]">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Kedaimaster Music Player
                </li>
              </ul>
              <a
                href="https://wa.me/6281318894994?text=Saya%20tertarik%20Basic%20Pack"
                className="w-full block py-3 rounded-xl border-2 border-black font-bold text-center hover:bg-black hover:text-white transition"
              >
                Pilih Paket
              </a>
            </div>

            {/* Professional Pack */}
            <div className="bg-white rounded-[2rem] p-6 flex flex-col relative group hover:-translate-y-2 transition duration-300 border-2 border-transparent hover:border-[#FFEA28]">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00A651]">
                  Professional Pack
                </span>
                <h3 className="text-2xl font-black text-black mt-2">
                  Rp 1.7jt<span className="text-sm font-medium text-neutral-500">/bln</span>
                </h3>
              </div>
              <p className="text-[10px] font-bold text-neutral-400 mb-4 uppercase tracking-tighter">Termasuk semua fitur Basic +</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm font-bold text-black">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Xallira Business Advisor
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Xallira Marketing (AI Foto)
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Upload Instagram by AI
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Check className="w-4 h-4 text-[#00A651] mt-0.5 flex-shrink-0" />
                  Integrasi WhatsApp AI
                </li>
              </ul>
              <a
                href="https://wa.me/6281318894994?text=Saya%20tertarik%20Professional%20Pack"
                className="w-full block py-3 rounded-xl border-2 border-black font-bold text-center hover:bg-black hover:text-white transition"
              >
                Pilih Paket
              </a>
            </div>

            {/* Bisnis Pack (Highlighted) */}
            <div className="bg-[#00A651] rounded-[2rem] p-6 flex flex-col relative transform lg:-translate-y-4 shadow-[8px_8px_0px_0px_rgba(255,234,40,1)] border-2 border-[#FFEA28]">
              <div className="absolute top-0 right-0 bg-[#FFEA28] text-black text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-[1.8rem]">
                BEST VALUE
              </div>
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFEA28]">
                  Bisnis Pack
                </span>
                <h3 className="text-3xl font-black text-white mt-2">
                  Rp 2.5jt<span className="text-sm font-medium text-white/70">/bln</span>
                </h3>
              </div>
              <p className="text-[10px] font-bold text-white/50 mb-4 uppercase tracking-tighter">Termasuk semua fitur Professional +</p>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  AI Voice & Picture Support
                </li>
                <li className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Integrasi IG DM & Telegram
                </li>
                <li className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Loyalty Program & Blast
                </li>
                <li className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Analisis Kompetitor by AI
                </li>
                <li className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Video Promosi Sinematik AI
                </li>
              </ul>
              <a
                href="https://wa.me/6281318894994?text=Saya%20tertarik%20Bisnis%20Pack"
                className="w-full block py-3 rounded-xl bg-[#FFEA28] text-black font-bold text-center hover:bg-white transition shadow-md"
              >
                Pilih Paket
              </a>
            </div>

            {/* Enterprise Pack */}
            <div className="bg-[#1a1a1a] rounded-[2rem] p-6 flex flex-col relative border-2 border-neutral-700">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Enterprise Pack
                </span>
                <h3 className="text-2xl font-black text-white mt-2">Custom</h3>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm font-bold text-white">
                  <Check className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Semua Fitur + Kustomisasi
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <Check className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Virtual AI Avatar
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <Check className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Dedicated Support
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-400">
                  <Check className="w-4 h-4 text-[#FFEA28] mt-0.5 flex-shrink-0" />
                  Setup Multi-Cabang Kompleks
                </li>
              </ul>
              <a
                href="https://wa.me/6281318894994?text=Saya%20tertarik%20Enterprise"
                className="w-full block py-3 rounded-xl border-2 border-white text-white font-bold text-center hover:bg-white hover:text-black transition"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Wave Divider for Footer */}
      <div className="relative h-16 md:h-24 bg-black overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full text-[#00A651] fill-current"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
        >
          <path
            fillOpacity="1"
            d="M0,224L80,213.3C160,203,320,181,480,181.3C640,181,800,203,960,224C1120,245,1280,267,1360,277.3L1440,288L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Footer / Contact (Green) */}
      <footer id="contact" className="bg-[#00A651] pt-12 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.85]">
            Siap untuk <br />Upgrade?
          </h2>
          <p className="text-xl font-medium text-white/90 mb-10 max-w-xl mx-auto">
            Hubungi kami sekarang untuk demo dan penawaran spesial.
          </p>

          {/* Contact Box */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black max-w-lg mx-auto transform -rotate-2 hover:rotate-0 transition duration-300">
            <div className="text-left space-y-6">
              <div>
                <h4 className="text-sm font-bold text-black uppercase tracking-widest mb-2">
                  WhatsApp / Telp
                </h4>
                <p className="text-xl font-black text-[#00A651]">0813 1889 4994</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-black uppercase tracking-widest mb-2">
                  Email
                </h4>
                <p className="text-xl font-medium text-black">
                  marketing@kediritechnopark.com
                </p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-black uppercase tracking-widest mb-2">
                  Website
                </h4>
                <p className="text-xl font-medium text-black">kedaimaster.com</p>
              </div>

              <a
                href="https://wa.me/6281318894994"
                target="_blank"
                className="block w-full py-4 bg-black text-white text-lg font-bold rounded-xl hover:bg-[#333] transition shadow-md mt-4 text-center flex items-center justify-center gap-2"
              >
                Chat WhatsApp <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-left text-white font-medium text-sm">
            <div>
              <h5 className="font-bold mb-4 uppercase tracking-wider text-xs border-b-2 border-white/20 pb-2">
                Produk
              </h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#FFEA28]">Web Kasir</a></li>
                <li>
                  <a href="#" className="hover:text-[#FFEA28]">Dashboard Owner</a>
                </li>
                <li><a href="#" className="hover:text-[#FFEA28]">AI Features</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 uppercase tracking-wider text-xs border-b-2 border-white/20 pb-2">
                Perusahaan
              </h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#FFEA28]">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-[#FFEA28]">Karir</a></li>
                <li><a href="#" className="hover:text-[#FFEA28]">Kontak</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 uppercase tracking-wider text-xs border-b-2 border-white/20 pb-2">
                Support
              </h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#FFEA28]">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-[#FFEA28]">Tutorial</a></li>
                <li><a href="#" className="hover:text-[#FFEA28]">Status Server</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 uppercase tracking-wider text-xs border-b-2 border-white/20 pb-2">
                Legal
              </h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-[#FFEA28]">Privasi</a></li>
                <li>
                  <a href="#" className="hover:text-[#FFEA28]">Syarat & Ketentuan</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-white/20 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-white/60">
            <div className="flex gap-4 mb-4 md:mb-0">
              <span>Kediri Technopark</span>
            </div>
            <div>© 2026 KEDAIMASTER. All rights reserved.</div>
          </div>
        </div>
      </footer>

      <PricingModal
        show={showPricingModal}
        onClose={closePricingModal}
        packageType={selectedPackage}
      />

      <AuthModal
        show={showAuthModal}
        onClose={closeAuthModal}
        initialMode={authMode as 'login' | 'register'}
      />
    </div>
  );
}

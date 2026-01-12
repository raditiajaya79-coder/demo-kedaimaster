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
import "./page.css";
import { useNavigate  } from "react-router-dom";
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

interface UserData extends Profile {}

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



// --- Komponen Halaman Utama ---
const KedaiMasterPage = () => {
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
        if(!profile) throw { status: 401, message: "Token tidak valid" };
        console.log("Token valid, pengguna login:", profile);
        setIsAuthenticated(true);
        setUserData(profile);
        window.location.href = "/dashboard"; // Redirect ke dashboard setelah validasi sukses
        
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

  // Render tombol di header berdasarkan status otentikasi
  const renderAuthButton = () => {
    if (isAuthLoading) {
      return (
        <span className="text-slate-700 text-sm px-4 py-2">Memeriksa...</span>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-4">
           <span className="text-sm text-slate-600 hidden md:block">
             Halo, {userData?.name || userData?.email || 'Pengguna'}!
           </span>
           <button
             onClick={handleLogout}
             className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
           >
             Logout
           </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => openAuthModal('login')}
        className="bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors text-sm"
      >
        Masuk
      </button>
    );
  };


  return (
    <div className="bg-slate-50 text-slate-800 font-inter">
      {/* Header */}
      <header className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/kedaimaster.jpg"
              alt="Logo The Horee Cafe"
              className="w-10 h-10 rounded-full"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/40x40/10b981/white?text=K"; }}
            />
            <span className="text-xl font-bold tracking-tight">
              Kedai Master
            </span>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors text-sm"
          >
            Masuk
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="hero-gradient relative overflow-hidden">
          <div className="container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center">
            {/* Teks */}
            <div className="md:w-1/2 w-full text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Satu platform untuk
                <div className="h-[3rem] md:h-[4.5rem] overflow-hidden inline-block align-middle w-full md:w-auto">
                  <div className="text-emerald-600 swiper-up">
                    <div className="h-[3rem] md:h-[4.5rem] flex items-center justify-center md:justify-start whitespace-nowrap">
                      pemesanan dari meja
                    </div>
                    <div className="h-[3rem] md:h-[4.5rem] flex items-center justify-center md:justify-start whitespace-nowrap">
                      pengelolaan keuangan
                    </div>
                    <div className="h-[3rem] md:h-[4.5rem] flex items-center justify-center md:justify-start whitespace-nowrap">
                      request suasana musik
                    </div>
                    <div className="h-[3rem] md:h-[4.5rem] flex items-center justify-center md:justify-start whitespace-nowrap">
                      manajemen stok
                    </div>
                    <div className="h-[3rem] md:h-[4.5rem] flex items-center justify-center md:justify-start whitespace-nowrap">
                      analisa pelanggan
                    </div>
                    {/* Repeat first item for a smooth loop */}
                    <div className="h-[3rem] md:h-[4.5rem] flex items-center justify-center md:justify-start whitespace-nowrap">
                      pemesanan dari meja
                    </div>
                  </div>
                </div>
              </h1>
              <p className="mt-4 text-slate-600 text-lg">
                Solusi modern untuk menikmati hidangan di cafe. Lebih cepat,
                mudah, dan bebas antri.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="#"
                  className="bg-white brand-green-border border font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Lihat Menu
                </a>
                <button
                  onClick={() => openAuthModal('register')}
                  className="bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Daftar Sekarang
                </button>
              </div>
            </div>

            {/* Gambar Mockup 3D */}
            <div className="md:w-1/2 w-full mt-12 md:mt-0 flex justify-center items-center">
              <div
                style={{
                  height: "320px",
                  width: "200px",
                  perspective: "800px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    transform: "rotateX(-20deg) rotateY(25deg) rotateZ(-5deg)",
                  }}
                >
                  <div
                    style={{
                      width: "188px",
                      height: "328px",
                      margin: "10px",
                    }}
                  >
                    {/* Layar Depan */}
                    <div
                      style={{
                        width: "122px",
                        height: "264px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        overflow: "hidden",
                        position: "relative",
                        zIndex: 11,
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
                          src="https://i.ibb.co.com/F4VK6KHs/header.jpg"
                          alt="Header"
                          style={{ width: "100%" }}
                        />
                        <div
                          className="player"
                          style={{ position: "relative" }}
                        >
                          <img
                            src="https://i.ibb.co.com/6cGq6byM/player1.jpg"
                            alt="Player 1"
                            style={{
                              width: "100%",
                              animation: "playerUnexpandedOpacity 20s infinite",
                            }}
                          />
                          <img
                            src="https://i.ibb.co.com/0VDjJdXV/player2.jpg"
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
                            src="https://i.ibb.co.com/8D3mSp4g/player3.jpg"
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
                            src="https://i.ibb.co.com/tw7KkmZ1/player4.jpg"
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
                            src="https://i.ibb.co.com/9k4PHW5W/player5.jpg"
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
                              top: "177%",
                              left: 0,
                              width: "100%",
                              zIndex: 6,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <img
                              src="https://i.ibb.co.com/TBYM6htX/search.jpg"
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
                                backgroundColor: "#f3efe6",
                              }}
                            ></div>
                          </div>
                          <img
                            src="https://i.ibb.co.com/cSqD0LKR/music1.jpg"
                            alt="Music 1"
                            style={{
                              width: "100%",
                              animation: "musicExpanded 20s infinite",
                              position: "absolute",
                              top: "235%",
                              left: 0,
                              zIndex: 6,
                            }}
                          />
                          <img
                            src="https://i.ibb.co.com/Q737mTn5/music2.jpg"
                            alt="Music 2"
                            style={{
                              width: "100%",
                              animation: "music2Expanded 20s infinite",
                              position: "absolute",
                              top: "329%",
                              left: 0,
                              zIndex: 6,
                            }}
                          />
                          <img
                            src="https://i.ibb.co.com/Rk4tQW6M/music3.jpg"
                            alt="Music 3"
                            style={{
                              width: "100%",
                              animation: "musicExpanded 20s infinite",
                              position: "absolute",
                              top: "428%",
                              left: 0,
                              zIndex: 6,
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              width: "5%",
                              height: "150%",
                              backgroundColor: "white",
                              right: "-2%",
                              top: "318%",
                              animation: "musicExpanded 20s infinite",
                              zIndex: 6,
                            }}
                          ></div>
                          <div
                            style={{
                              position: "absolute",
                              width: "90%",
                              height: "180%",
                              backgroundColor: "white",
                              top: "296%",
                              animation: "musicExpanded 20s infinite",
                              zIndex: 5,
                            }}
                          ></div>
                        </div>
                        <div style={{ animation: "bodyDown 20s infinite" }}>
                          <img
                            src="https://i.ibb.co.com/4z5zdsS/body.jpg"
                            alt="Body"
                            style={{ width: "100%" }}
                          />
                          <div
                            style={{
                              position: "relative",
                              top: "-67.7%",
                              width: "100%",
                              animation:
                                "escappucinoscaleAnimation 20s infinite",
                            }}
                          >
                            <img
                              src="https://i.ibb.co.com/yFvrPX8z/pesan.png"
                              alt="Escappucino"
                              style={{
                                width: "100%",
                                position: "absolute",
                                animation:
                                  "escappucinochildOpacityAnimation 20s infinite",
                              }}
                            />
                            <img
                              src="https://i.ibb.co.com/rRwPHtY7/pesan-1.png"
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
                              top: "-26%",
                              width: "100%",
                              animation:
                                "chickenkatsuscaleAnimation 20s infinite",
                            }}
                          >
                            <img
                              src="https://i.ibb.co.com/yFvrPX8z/pesan.png"
                              alt="Chicken Katsu"
                              style={{
                                width: "100%",
                                position: "absolute",
                                animation:
                                  "chickenkatsuchildOpacityAnimation 20s infinite",
                              }}
                            />
                            <img
                              src="https://i.ibb.co.com/rRwPHtY7/pesan-1.png"
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
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            top: "86%",
                            animation: "cartbuttonscaleAnimation 20s infinite",
                          }}
                        >
                          <img
                          src="https://i.ibb.co.com/zVrfGjZw/New-Project.png"
                            alt="Cart Button"
                            style={{
                              width: "100%",
                              position: "absolute",
                              animation:
                                "cartbuttonchildOpacityAnimation 20s infinite",
                            }}
                          />
                          <img
                          src="https://i.ibb.co.com/Y7wbjGDz/cart-2.png"
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
                          src="https://i.ibb.co.com/F4Hb7Tqg/cart.jpg"
                            alt="Cart"
                            style={{ width: "100%", height: "100%" }}
                          />
                          <img
                          src="https://i.ibb.co.com/Mxrjc9Dc/checkout.png"
                            alt="Checkout"
                            style={{
                              width: "100%",
                              position: "absolute",
                              top: "90.7%",
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
                    {/* Layar Belakang */}
                    <div
                      style={{
                        width: "122px",
                        height: "264px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                        overflow: "hidden",
                        position: "relative",
                        left: "38%",
                        top: "-62%",
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          animation: "reportScrollBottom 5s infinite",
                        }}
                      >
                        <img
                          src="https://i.ibb.co.com/LDw21htp/New-Project.jpg"
                          alt="Second Main"
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fitur Unggulan */}
        <section id="features" className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Fitur Unggulan Kami
              </h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                Platform Point of Sale terdepan untuk kebutuhan operasional kafe
                & restoran masa kini—fleksibel, interaktif, dan efisien.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Fitur 1 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">AI Asisten Pelanggan</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan AI Asisten Pelanggan dari Kedai Master, layanan Anda
                  jadi lebih cepat, responsif, dan personal otomatis melayani
                  pelanggan 24 jam melalui chat maupun suara. Hasilnya, kepuasan
                  meningkat, loyalitas tumbuh, dan bisnis Anda makin unggul!
                </p>
              </div>
              {/* Fitur 2 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  AI Prediksi Inventaris
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan AI Inventory Prediction dari Kedai Master, Anda bisa
                  mengelola stok dengan cerdas tanpa takut kehabisan atau
                  kelebihan barang. Berkat analisis data dan machine learning,
                  sistem ini memperkirakan produk yang paling laku, waktu
                  terbaik restock, dan jumlah idealnya secara otomatis!
                </p>
              </div>
              {/* Fitur 3 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">AI Agen Pemasaran</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan AI Marketing Agent dari Kedai Master, promosi bisnis
                  jadi lebih mudah dan efisien! Sistem AI ini secara otomatis
                  membuat konten visual, caption, hingga video pendek, lalu
                  mempostingnya langsung ke media sosial Anda. Strategi
                  pemasaran jadi cepat, konsisten, dan selalu menarik perhatian
                  pelanggan!
                </p>
              </div>
              {/* Fitur 4 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">AI Penasihat Bisnis</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan AI Penasihat Bisnis dari Kedai Master, Anda memiliki
                  konsultan digital pribadi yang siap memberi analisis, saran,
                  dan strategi otomatis berbasis data. Ambil keputusan lebih
                  cepat, akurat, dan cerdas dengan insight real-time dari
                  kecerdasan buatan yang selalu siap membantu kapan pun Anda
                  butuh!
                </p>
              </div>
              {/* Fitur 5 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  Laporan & Analisis Otomatis
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan Laporan & Analisis Otomatis dari Kedai Master, semua
                  data bisnis diolah otomatis oleh AI, memberi Anda hasil cepat,
                  akurat, dan efisien tanpa repot, tanpa salah, langsung bantu
                  tingkatkan profit!
                </p>
              </div>
              {/* Fitur 6 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  Manajemen Stok & Bahan
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Manajemen Stok & Bahan dari Kedai Master memastikan
                  ketersediaan barang selalu tepat waktu dan sesuai kebutuhan
                  tanpa kelebihan, tanpa kekurangan, semuanya otomatis
                  terkontrol!
                </p>
              </div>
              {/* Fitur 6 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  Manajemen Tenant & Kasir
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan Tenant & Kasir Manajemen dari Kedai Master, semua data,
                  kontrak, tagihan, hingga penjualan setiap tenant terhubung
                  otomatis dalam satu sistem. Satu dashboard utama untuk kontrol
                  penuh bisnis Anda real-time, transparan, dan efisien!
                </p>
              </div>
              {/* Fitur 6 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  Pembayaran QRIS Terintegras
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan Integrated QRIS Payment dari Kedai Master, setiap
                  transaksi langsung tercatat otomatis di sistem kasir, laporan
                  keuangan, dan dashboard bisnis tanpa input manual. Pembayaran
                  jadi lebih cepat, akurat, dan efisien bebas pajak, langsung
                  masuk ke rekening Anda secara real-time!
                </p>
              </div>
              {/* Fitur 6 */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  Ciptakan Momen Tak Terlupakan
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Dengan Ciptakan Momen Tak Terlupakan dari Kedai Master, setiap
                  interaksi pelanggan diubah menjadi pengalaman emosional yang
                  berkesan. Bukan sekadar layanan, tapi kenangan positif yang
                  membuat mereka ingin kembali lagi dan merekomendasikan bisnis
                  Anda ke orang lain!
                </p>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg">
                  Pesan Langsung di Meja
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Kedai Master ini memudahkan pengunjung kafe untuk memesan
                  langsung dari meja hanya dengan scan QR. Tanpa perlu menunggu
                  pelayan, pelanggan bisa melihat menu, memilih makanan atau
                  minuman, memanfaatkan promo, dan langsung melakukan pemesanan
                  secara instan. Semua transaksi tercatat otomatis di sistem
                  kasir, menjadikan pengalaman makan lebih cepat, nyaman, dan
                  efisien bagi pelanggan maupun pihak kafe!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="hero-gradient py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Paket Harga Sesuai Kebutuhan Anda
              </h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                Pilih paket yang paling cocok untuk mengembangkan bisnis kuliner
                Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto ">
              {/* starter Pack */}
              <div className="pricing-card bg-white rounded-xl shadow-md flex flex-col">
                <h3 className="pack-title">Starter Pack</h3>
                <ul className="justlist">
                  <li>Manajemen menu & kategori</li>
                  <li>Dashboard penjualan, stok, dan transaksi</li>
                  <li>Pengguna tak terbatas (pemilik, kasir)</li>
                  <li>Pembayaran Digital (QRIS)</li>
                  <li>Integrasi kasir & printer</li>
                  <li>Pemesanan dari setiap meja via QR</li>
                  <li>Request musik pelanggan</li>
                </ul>

                <div className="pack-price-container">
                  <div className="pack-old-price">
                    Rp 899.000 <span className="small-bulan">/month</span>
                  </div>
                  <div className="pack-price">
                    Rp 699.000 <span className="small-bulan">/month</span>
                  </div>
                  <button
                    className="select-btn"
                    onClick={() => openPricingModal("starter")}
                  >
                    Choose Plan
                  </button>
                </div>
              </div>

              {/* profesional Pack */}
              <div className="pricing-card bg-white p-8 rounded-xl shadow-md flex flex-col">
                <h3 className="pack-title">Professional Pack</h3>
                <ul className="justlist">
                  <li>Semua fitur Starter</li>

                  <li>
                    <strong>Mayagen Cs → AI Customer Assistant :</strong>
                    <div className="sub-features">
                      <ul className="sub-features-list">
                        <li>
                          <span className="highlight">AI Chat :</span> Interaksi
                          langsung dengan pelanggan (tanya menu, promo, diskon)
                        </li>
                        <li>
                          <span className="highlight">Channel :</span> Web app
                          dan WhatsApp
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li>
                    <strong>Mayagen Marketing → AI Marketing Agent :</strong>
                    <div className="sub-features">
                      <ul className="sub-features-list">
                        <li>Foto produk by AI</li>
                        <li>Upload Instagram By AI</li>
                        <li>Rekomendasi nama produk or menu By AI</li>
                      </ul>
                    </div>
                  </li>

                  <li>
                    <strong>
                      Mayagen Business Coach → AI Business Advisor
                    </strong>
                    <div className="sub-features">
                      <span className="highlight">Analisis bisnis By AI :</span>
                      <ul className="sub-features-list">
                        <li>Insight performa product/menu</li>
                        <li>Prediksi tren bisnis (transaksi,stok)</li>
                        <li>Bisnis Problem Detection + rekomendasi</li>
                      </ul>
                    </div>
                  </li>
                </ul>

                <div className="pack-price-container">
                  <div className="pack-old-price">
                    Rp 1.999.000 <span className="small-bulan">/month</span>
                  </div>
                  <div className="pack-price">
                    Rp 1.700.000 <span className="small-bulan">/month</span>
                  </div>
                  <button
                    className="select-btn"
                    onClick={() => openPricingModal("professional")}
                  >
                    Choose Plan
                  </button>
                </div>
              </div>

              {/* Bisnis Pack */}
              <div className="pricing-card bg-white p-8 rounded-xl shadow-md flex flex-col">
                <h3 className="pack-title">Bisnis Pack</h3>
                <ul className="justlist">
                  <li>Semua fitur paket Professional pack</li>

                  <li>
                    <strong>
                      Mayagen Cs Advance → AI Customer Assistant :
                    </strong>
                    <div className="sub-features">
                      <ul className="sub-features-list">
                        <li>Pesan langsung lewat AI chat</li>
                        <li>Voice + Picture</li>
                        <li>
                          <span className="highlight">Channel :</span>Instagram
                          DM, Instagram Message reply dan Telegram
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li>
                    <strong>
                      Mayagen Marketing Advance → AI Marketing Agent
                    </strong>
                    <div className="sub-features">
                      <ul className="sub-features-list">
                        <li>
                          Foto to cinematic video untuk promosi produk by AI
                        </li>
                        <li>Balas komentar pelanggan di sosmed by AI</li>
                      </ul>
                    </div>
                  </li>

                  <li>
                    <strong>
                      Mayagen Business Coach Advance → AI Business Advisor
                    </strong>
                    <div className="sub-features">
                      <span className="highlight">Analisis bisnis by AI :</span>
                      <ul className="sub-features-list">
                        <li>Saran berdasarkan review & data operasional</li>
                        <li>competitor Analisis By AI</li>
                        <li>
                          program loyalitas pelanggan (poin & reward digital)
                        </li>
                        <li>
                          Notifikasi transaksi otomatis ke pelanggan (Nada
                          dering)
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>

                <div className="pack-price-container">
                  <div className="pack-old-price">
                    Rp 2.799.000 <span className="small-bulan">/month</span>
                  </div>
                  <div className="pack-price">
                    Rp 2.500.000 <span className="small-bulan">/month</span>
                  </div>
                  <button
                    className="select-btn"
                    onClick={() => openPricingModal("business")}
                  >
                    Choose Plan
                  </button>
                </div>
              </div>

              {/* Enterprise Pack */}
              <div className="pricing-card bg-white p-8 rounded-xl shadow-md flex flex-col">
                <h3 className="pack-title">Enterprise Pack</h3>
                <ul className="justlist">
                  <li>All Fitur + custom as requested</li>
                  <li>Virtual AI Avatar</li>
                </ul>

                <div className="pack-price-container">
                  <div className="pack-price">Price</div>
                  <a
                    href="https://wa.me/6281318894994"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="select-btn"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-gradient">
          <div className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-bold text-slate-800">
              Siap Tingkatkan Bisnis Anda?
            </h2>
            <button
              onClick={() => openAuthModal('register')}
              className="mt-6 inline-block bg-emerald-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all duration-300"
            >
              Coba KedaiMaster Sekarang
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#253142] text-white">
        <div className="container mx-auto pl-3 pr-5 md:px-20 pt-12 pb-6">
          {/* Grid responsif — 1 kolom di HP, 3 kolom di desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-20 text-left">
            {/* ABOUT SECTION */}
            <div>
              <h3 className="text-white font-bold mb-3 text-lg">
                About Our Company
              </h3>

              <img
                src="logo-white.png"
                alt="Kediri Technopark Logo"
                className="my-2 rounded-lg"
                style={{ width: "120px", height: "auto" }}
              />

              <p className="text-sm text-gray-400 leading-relaxed">
                Kediri Technopark adalah pusat pengembangan inovasi digital dan
                aplikasi untuk masyarakat dan pelaku usaha.
              </p>

              {/* SOCIAL MEDIA ICONS */}
              <div className="mt-4 flex space-x-5">
                <a
                  href="https://instagram.com/kediri.technopark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-white hover:text-pink-600 hover:-translate-y-1 transition-all duration-300"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://linkedin.com/company/kediri-technopark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-white hover:text-blue-500 hover:-translate-y-1 transition-all duration-300"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  href="https://www.facebook.com/kediritechnopark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl text-white hover:text-blue-700 hover:-translate-y-1 transition-all duration-300"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              </div>
            </div>

            {/* CONTACT SECTION */}
            <div className="text-gray-300">
              <h3 className="text-white font-bold mb-3 text-lg">Contact Us</h3>

              <ul className="space-y-3 text-sm">
                <li className="flex items-start leading-relaxed text-gray-400">
                  <i className="fas fa-map-marker-alt w-4 mr-2 mt-0.5 text-white flex-shrink-0"></i>
                  <span>
                    Sunan Giri GG. I No. 11, Rejomulyo, Kediri, Jawa Timur 64129
                  </span>
                </li>

                <li className="flex items-center">
                  <i className="fas fa-phone w-4 mr-2 text-white"></i>
                  <a
                    href="tel:+6281318894994"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    0813 1889 4994
                  </a>
                </li>

                <li className="flex items-center">
                  <i className="fas fa-envelope w-4 mr-2 text-white"></i>
                  <a
                    href="mailto:marketing@kediritechnopark.com"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    marketing@kediritechnopark.com
                  </a>
                </li>

                <li className="flex items-center">
                  <i className="fas fa-globe w-4 mr-2 text-white"></i>
                  <a
                    href="https://kediritechnopark.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                  >
                    www.KEDIRITECHNOPARK.com
                  </a>
                </li>
              </ul>
            </div>

            {/* THIRD COLUMN */}
            <div>
              <h3 className="text-white font-bold mb-3 text-lg">
                Kedai Master
              </h3>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                Platform digital untuk pemesanan yang modern dan efisien.
              </p>
            </div>
          </div>

          {/* FOOTER BOTTOM TEXT */}
          <div className="text-center mt-10 ">
            <p className="text-sm text-gray-400 opacity-70">
              &copy; 2025 Kediri Technopark. All Rights Reserved.
            </p>
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
};

export default KedaiMasterPage;

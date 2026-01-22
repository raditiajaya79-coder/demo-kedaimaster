// src/utils/authApi.js

const API_BASE_URL = 'https://scrawlier-linwood-parolable.ngrok-free.dev';
// const API_BASE_URL = 'https://demo-kedaimaster-api.lab.kediritechnopark.com';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_PROFILE_KEY = 'userProfile';

/**
 * Ambil token dari localStorage
 */
export function getTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

/**
 * Simpan token baru ke localStorage
 */
function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Hapus token dan profil (misalnya saat logout)
 */
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}

/**
 * Simpan profil user ke localStorage
 */
export function saveUserProfile(profile) {
  if (profile) localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

/**
 * Ambil profil user dari localStorage
 */
export function getUserProfile() {
  const profile = localStorage.getItem(USER_PROFILE_KEY);
  return profile ? JSON.parse(profile) : null;
}

/**
 * Fungsi utama pemanggil API
 */
export async function apiRequest(endpoint, method = 'POST', data = {}, retry = true, options = {}) {
  const { accessToken } = getTokens();

  try {
    const headers = {};

    // ❌ Jangan pakai Authorization di endpoint login/register/refresh
    const noAuthEndpoints = ['/authenticate', '/register', '/refreshToken'];
    const requiresAuth = !noAuthEndpoints.includes(endpoint);

    if (accessToken && requiresAuth) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Bypass ngrok browser warning
    headers['ngrok-skip-browser-warning'] = 'true';

    // Hanya set Content-Type jika bukan FormData
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      method,
      headers,
    };

    if (method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = isFormData ? data : JSON.stringify(data);
    }

    console.log(`[API Request] ${method} ${API_BASE_URL}${endpoint}`, {
        headers,
        isFormData,
        body: isFormData ? 'FormData' : data
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
    
    if (options.responseType === 'blob') {
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            }
            return response.blob();
        }
    }
    
    const text = await response.text();
    let result;
    try {
      result = text ? JSON.parse(text) : {};
    } catch (e) {
      result = text;
    }

    if (response.ok) return result;

    if (retry && (response.status === 401 || response.status === 403)) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return apiRequest(endpoint, method, data, false);
      }
      else {
        clearTokens();
        window.location.href = '/';
      }
    }

    const err = {
      status: response.status,
      message: result.message || 'API Error',
      description: result.description || '',
      errorMessages: result.errorMessages || {},
    };
    throw err;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}


/**
 * Coba refresh token
 *
 * ✅ RESPONSE 200 OK
 * Contoh respons sukses (refresh token berhasil):
 * {
 *   "accessToken": "string",
 *   "refreshToken": "string"
 * }
 */
async function tryRefreshToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const result = await response.json();
    saveTokens(result); // pastikan API kirim accessToken dan refreshToken
    return true;
  } catch (err) {
    console.error('Token refresh failed:', err);
    clearTokens();
    return false;
  }
}

/**
 * API publik
 */

/**
 * Register user baru
 *
 * @param {Object} data - Data registrasi
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.passwordConfirm
 * @param {string} data.role
 *
 * ✅ RESPONSE 201 Created
 * {
 *   "id": "string",
 *   "email": "string",
 *   "role": "Sistem Administrator",
 *   "createdBy": "string",
 *   "createdOn": "2025-10-23T09:06:15.655Z",
 *   "updatedBy": "string",
 *   "updatedOn": "2025-10-23T09:06:15.655Z"
 * }
 */
export async function registerUser({ email, password, passwordConfirm, role }) {
  return apiRequest('/register', 'POST', { email, password, passwordConfirm, role });
}

/**
 * GET: Ambil data user yang sedang login
 */
export async function fetchCurrentUser() {
  return apiRequest('/api/v1/users/me', 'GET');
}

/**
 * Autentikasi pengguna (login)
 *
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.password
 *
 * ✅ RESPONSE 200 OK
 */
export async function authenticate({ email, password }) {
  const result = await apiRequest('/authenticate', 'POST', { email, password });
  saveTokens(result); // simpan token setelah login
  
  // Ambil profil user lengkap dan simpan
  try {
    const userProfile = await fetchCurrentUser();
    saveUserProfile(userProfile);
  } catch (error) {
    console.error('Failed to fetch user profile after login:', error);
  }
  
  return result;
}

/**
 * Refresh token secara manual
 *
 * ✅ RESPONSE 200 OK
 * {
 *   "accessToken": "string",
 *   "refreshToken": "string"
 * }
 */
export async function refreshTokenManually() {
  const { refreshToken } = getTokens();
  if (!refreshToken) throw new Error('No refresh token found');
  return apiRequest('/refreshToken', 'POST', { refreshToken });
}

import { jwtDecode } from 'jwt-decode'; // Make sure to install jwt-decode: npm install jwt-decode

export function getProfile() {
  const { accessToken } = getTokens();
  if (!accessToken) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(accessToken);
    console.log(decodedToken)
    // Assuming the JWT payload has 'userId', 'email', and 'role'
    return {
      id: decodedToken.userId,
      email: decodedToken.email,
      name: decodedToken.sub, // Using 'sub' as name for now, adjust as needed
      role: decodedToken.role,
    };
  } catch (error) {
    console.error('Failed to decode access token:', error);
    return null;
  }
}

export function logOut() {
  clearTokens();
  window.location.href = '/';
}

/**
 * Connect to Instagram
 * Redirects user to the backend connection endpoint
 */
export async function connectInstagram(userId) {
  if (!userId) {
    console.error('User ID is required for Instagram connection');
    return null;
  }
  
  const { accessToken } = getTokens();
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'ngrok-skip-browser-warning': 'true'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/post/instagram/auth?userId=${userId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      console.error('Instagram auth error:', response.status, response.statusText);
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const json = await response.json();
      return json.url || (typeof json === 'string' ? json : null);
    } else {
      // Assume it's a plain text URL
      const text = await response.text();
      // Basic validation to check if it looks like a URL
      if (text && (text.startsWith('http') || text.startsWith('/'))) {
        return text;
      }
      return null;
    }
  } catch (error) {
    console.error('Failed to initiate Instagram connection:', error);
    throw error;
  }
}

import { backendDomain } from '@/lib/network';

// Types
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  walletAddress: string;
  role?: 'admin' | 'issuer' | 'manager' | 'user';
}

export interface LoginData {
  email?: string;
  password?: string;
  walletAddress?: string;
  preferredRole?: 'admin' | 'issuer' | 'manager' | 'user';
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: ('admin' | 'issuer' | 'manager' | 'user')[];
  primaryRole: 'admin' | 'issuer' | 'manager' | 'user';
  walletAddress: string;
  isVerified: boolean;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  fullName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  preferences?: {
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    currency?: string;
    language?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    currentRole: 'admin' | 'issuer' | 'manager' | 'user';
    availableRoles: ('admin' | 'issuer' | 'manager' | 'user')[];
    dashboardRoute: string;
    hasMultipleRoles?: boolean;
  };
}

export interface WalletVerificationResponse {
  success: boolean;
  data: {
    walletExists: boolean;
    availableRoles: ('admin' | 'issuer' | 'manager' | 'user')[];
    userInfo?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface RoleSwitchResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    currentRole: 'admin' | 'issuer' | 'manager' | 'user';
    availableRoles: ('admin' | 'issuer' | 'manager' | 'user')[];
    dashboardRoute: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Base API configuration
export const API_BASE_URL = `${backendDomain}/auth`;

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Auth API functions
export const authApi = {
  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await handleResponse<AuthResponse>(response);
      
      // Store token in localStorage
      if (result.success && result.data.token) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('currentRole', result.data.currentRole);
        localStorage.setItem('availableRoles', JSON.stringify(result.data.availableRoles));
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const result = await handleResponse<AuthResponse>(response);
      
      // Store token in localStorage
      if (result.success && result.data.token) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('currentRole', result.data.currentRole);
        localStorage.setItem('availableRoles', JSON.stringify(result.data.availableRoles));
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updateData: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const result = await handleResponse<{ success: boolean; data: { user: User } }>(response);
      
      // Update stored user data
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Verify wallet address
  verifyWallet: async (walletAddress: string): Promise<WalletVerificationResponse> => {
    try {
      console.log('🔍 authApi.verifyWallet - Backend format address:', {
        walletAddress,
        length: walletAddress?.length,
        isBackendFormat: /^0x[a-fA-F0-9]{40}$/.test(walletAddress)
      });

      const requestBody = { walletAddress };
      
      const response = await fetch(`${API_BASE_URL}/verify-wallet`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      return await handleResponse<WalletVerificationResponse>(response);
    } catch (error) {
      console.error('Verify wallet error:', error);
      throw error;
    }
  },

  // Switch user role
  switchRole: async (newRole: 'admin' | 'issuer' | 'manager' | 'user'): Promise<RoleSwitchResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/switch-role`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newRole }),
      });

      const result = await handleResponse<RoleSwitchResponse>(response);
      
      // Update stored token and user data
      if (result.success && result.data.token) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('currentRole', result.data.currentRole);
      }
      
      return result;
    } catch (error) {
      console.error('Switch role error:', error);
      throw error;
    }
  },

  // Get user roles
  getUserRoles: async (): Promise<{ success: boolean; data: { availableRoles: any[]; currentRole: string; hasMultipleRoles: boolean } }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get user roles error:', error);
      throw error;
    }
  },
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const result = await handleResponse<{ success: boolean; message: string }>(response);
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentRole');
      localStorage.removeItem('availableRoles');
      
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentRole');
      localStorage.removeItem('availableRoles');
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const hasTokenAndUser = !!(token && user);
    
    console.log('Authentication check:', {
      hasToken: !!token,
      hasUser: !!user,
      isAuthenticated: hasTokenAndUser
    });
    
    return hasTokenAndUser;
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Clear auth data
  clearAuthData: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('availableRoles');
  },

  // Get current role
  getCurrentRole: (): string | null => {
    return localStorage.getItem('currentRole');
  },

  // Get available roles
  getAvailableRoles: (): string[] => {
    try {
      const rolesStr = localStorage.getItem('availableRoles');
      return rolesStr ? JSON.parse(rolesStr) : [];
    } catch (error) {
      console.error('Error parsing available roles:', error);
      return [];
    }
  },

  // Admin create user (issuer/manager)
  createUser: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/create-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      return await handleResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Ping backend to keep it alive
  ping: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Ping error:', error);
      throw error;
    }
  }
};

// Export individual functions for convenience
export const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  verifyWallet,
  switchRole,
  getUserRoles,
  createUser,
  isAuthenticated,
  getCurrentUser,
  getToken,
  clearAuthData,
  getCurrentRole,
  getAvailableRoles,
  healthCheck,
  ping
} = authApi;

export default authApi;
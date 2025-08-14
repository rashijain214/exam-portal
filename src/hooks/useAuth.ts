import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock authentication hook
export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // In production, validate token with backend
      const mockUser: User = {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'student'
      };
      setUser(mockUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Mock login - in production, call actual API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'teacher@example.com') {
      const teacherUser: User = {
        _id: '2',
        name: 'Jane Smith',
        email: 'teacher@example.com',
        role: 'teacher'
      };
      setUser(teacherUser);
      localStorage.setItem('authToken', 'mock-teacher-token');
    } else {
      const studentUser: User = {
        _id: '1',
        name: 'John Doe',
        email: email,
        role: 'student'
      };
      setUser(studentUser);
      localStorage.setItem('authToken', 'mock-student-token');
    }
    
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return { user, login, logout, loading };
};

export { AuthContext };
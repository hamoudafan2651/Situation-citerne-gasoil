import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// User type definition
export interface User {
  id: string;
  jobCardNumber: string; // 4 digits
  name: string;
  icon: string; // Icon identifier
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (jobCardNumber: string, passcode: string) => Promise<boolean>;
  register: (jobCardNumber: string, passcode: string, name: string, icon: string) => Promise<boolean>;
  logout: () => void;
  users: User[]; // List of all registered users (for icon selection/display)
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [location, setLocation] = useLocation();

  // Load users and current session from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('scg_users_list');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    const storedSession = localStorage.getItem('scg_current_user');
    if (storedSession) {
      setUser(JSON.parse(storedSession));
    }
  }, []);

  const login = async (jobCardNumber: string, passcode: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const storedUsersStr = localStorage.getItem('scg_users_db');
    const usersDb = storedUsersStr ? JSON.parse(storedUsersStr) : {};
    
    const userRecord = usersDb[jobCardNumber];
    
    if (userRecord && userRecord.passcode === passcode) {
      const userData: User = {
        id: userRecord.id,
        jobCardNumber: userRecord.jobCardNumber,
        name: userRecord.name,
        icon: userRecord.icon,
        createdAt: userRecord.createdAt
      };
      
      setUser(userData);
      localStorage.setItem('scg_current_user', JSON.stringify(userData));
      return true;
    }
    
    return false;
  };

  const register = async (jobCardNumber: string, passcode: string, name: string, icon: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const storedUsersStr = localStorage.getItem('scg_users_db');
    const usersDb = storedUsersStr ? JSON.parse(storedUsersStr) : {};
    
    if (usersDb[jobCardNumber]) {
      return false; // User already exists
    }
    
    const newUser = {
      id: crypto.randomUUID(),
      jobCardNumber,
      passcode,
      name,
      icon,
      createdAt: new Date().toISOString()
    };
    
    // Save to DB (including sensitive data like passcode)
    usersDb[jobCardNumber] = newUser;
    localStorage.setItem('scg_users_db', JSON.stringify(usersDb));
    
    // Update public user list (excluding sensitive data)
    const publicUser: User = {
      id: newUser.id,
      jobCardNumber: newUser.jobCardNumber,
      name: newUser.name,
      icon: newUser.icon,
      createdAt: newUser.createdAt
    };
    
    const updatedUsers = [...users, publicUser];
    setUsers(updatedUsers);
    localStorage.setItem('scg_users_list', JSON.stringify(updatedUsers));
    
    // Auto login after register
    setUser(publicUser);
    localStorage.setItem('scg_current_user', JSON.stringify(publicUser));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scg_current_user');
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      users 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

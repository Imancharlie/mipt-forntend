import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Theme = 'blue' | 'green' | 'purple' | 'orange' | 'red';
type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, theme: initialTheme = 'orange' }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme as Theme);
  const [colorMode, setColorMode] = useState<ColorMode>('light');

  // Apply dark mode classes to document
  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode]);

  const value = {
    theme,
    setTheme,
    colorMode,
    setColorMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 
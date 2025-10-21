import { useEffect, useState } from 'react';
import { useTheme, useAppStore } from '../store/useAppStore';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

const lightTheme: ThemeConfig = {
  name: 'Light',
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6'
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
};

const darkTheme: ThemeConfig = {
  name: 'Dark',
  colors: {
    primary: '#60A5FA',
    secondary: '#A78BFA',
    accent: '#FBBF24',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
    info: '#60A5FA'
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
  }
};

export const useThemeManager = () => {
  const theme = useTheme();
  const setTheme = useAppStore(state => state.setTheme);
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light');

  // Résoudre le thème automatique
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = () => {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      };
      
      updateTheme();
      mediaQuery.addEventListener('change', updateTheme);
      
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // Appliquer le thème au DOM
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
    
    // Appliquer les variables CSS
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(currentTheme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });
    
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Appliquer la classe de thème
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Mettre à jour la meta tag pour le thème
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', currentTheme.colors.primary);
    }
  }, [resolvedTheme]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const getCurrentThemeConfig = (): ThemeConfig => {
    return resolvedTheme === 'dark' ? darkTheme : lightTheme;
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    getCurrentThemeConfig,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isAuto: theme === 'auto'
  };
};

// Hook pour accéder aux couleurs du thème actuel
export const useThemeColors = () => {
  const { getCurrentThemeConfig } = useThemeManager();
  return getCurrentThemeConfig().colors;
};

// Hook pour accéder aux espacements du thème actuel
export const useThemeSpacing = () => {
  const { getCurrentThemeConfig } = useThemeManager();
  return getCurrentThemeConfig().spacing;
};

// Hook pour accéder aux bordures du thème actuel
export const useThemeBorderRadius = () => {
  const { getCurrentThemeConfig } = useThemeManager();
  return getCurrentThemeConfig().borderRadius;
};

// Hook pour accéder aux ombres du thème actuel
export const useThemeShadows = () => {
  const { getCurrentThemeConfig } = useThemeManager();
  return getCurrentThemeConfig().shadows;
};

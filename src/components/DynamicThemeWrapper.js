'use client';

import { Theme } from '@radix-ui/themes';
import { useTheme } from '../contexts/ThemeContext';

export default function DynamicThemeWrapper({ children }) {
    const { themeSettings, isLoading, getCurrentTheme } = useTheme();

    // Show a minimal loading state while theme initializes
    if (isLoading) {
        return (
            <Theme appearance="light" accentColor="blue" radius="medium">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontFamily: 'var(--font-geist-sans)'
                }}>
                    <div>Loading...</div>
                </div>
            </Theme>
        );
    }

    // Default to light theme if no settings available
    const appearance = getCurrentTheme() || 'light';
    const accentColor = themeSettings?.accentColor || 'blue';

    // Map our font sizes to Radix UI scaling
    const getScaling = (fontSize) => {
        switch (fontSize) {
            case 'small': return '90%';
            case 'large': return '110%';
            case 'medium':
            default: return '100%';
        }
    };

    const scaling = getScaling(themeSettings?.fontSize);

    return (
        <Theme
            appearance={appearance}
            accentColor={accentColor}
            radius="medium"
            scaling={scaling}
        >
            {children}
        </Theme>
    );
}
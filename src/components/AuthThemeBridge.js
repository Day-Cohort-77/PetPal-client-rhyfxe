'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// This component bridges AuthContext and ThemeContext
export default function AuthThemeBridge({ children }) {
    const { user } = useAuth();
    const { setUser, currentUser, handleLogout } = useTheme();
    const previousUser = useRef(currentUser);

    // Update theme context when auth user changes
    useEffect(() => {
        const prevUser = previousUser.current;

        if (user !== currentUser) {
            setUser(user);
        }

        // If user was logged in before and now is null (logout), reset theme
        if (prevUser && !user) {
            console.log('User logged out, resetting theme to default');
            handleLogout(prevUser.id);
        }

        // Update the previous user reference
        previousUser.current = user;
    }, [user, currentUser, setUser, handleLogout]);

    return children;
}
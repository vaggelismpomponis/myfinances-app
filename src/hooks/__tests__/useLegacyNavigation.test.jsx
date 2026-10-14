import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useLegacyNavigation } from '../useLegacyNavigation';

describe('useLegacyNavigation', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('resolves activeTab correctly for /settings/categories and navigates to it', () => {
        const wrapper = ({ children }) => (
            <MemoryRouter initialEntries={['/settings']}>
                {children}
            </MemoryRouter>
        );

        const { result } = renderHook(() => useLegacyNavigation(), { wrapper });

        expect(result.current.activeTab).toBe('profile');

        act(() => {
            result.current.setActiveTab('categories');
        });

        expect(result.current.activeTab).toBe('categories');
        expect(localStorage.getItem('lastActiveTab')).toBe('categories');
    });

    it('resolves activeTab as categories when pathname is /settings/categories', () => {
        const wrapper = ({ children }) => (
            <MemoryRouter initialEntries={['/settings/categories']}>
                {children}
            </MemoryRouter>
        );

        const { result } = renderHook(() => useLegacyNavigation(), { wrapper });

        expect(result.current.activeTab).toBe('categories');
    });
});

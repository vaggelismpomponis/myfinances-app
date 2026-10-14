import { describe, it, expect } from 'vitest';
import { mergeNotifications } from '../NotificationContext';

describe('NotificationContext - mergeNotifications', () => {
    it('returns empty array when both inputs are empty or invalid', () => {
        expect(mergeNotifications([], [])).toEqual([]);
        expect(mergeNotifications(null, undefined)).toEqual([]);
    });

    it('merges disjoint notification lists and sorts by timestamp descending', () => {
        const listA = [
            { id: '1', message: 'Test 1', timestamp: '2026-10-14T10:00:00Z', read: false },
            { id: '3', message: 'Test 3', timestamp: '2026-10-14T12:00:00Z', read: false },
        ];
        const listB = [
            { id: '2', message: 'Test 2', timestamp: '2026-10-14T11:00:00Z', read: false },
        ];

        const merged = mergeNotifications(listA, listB);
        expect(merged).toHaveLength(3);
        expect(merged.map(m => m.id)).toEqual(['3', '2', '1']);
    });

    it('preserves read: true when a notification is marked read on either device', () => {
        const devicePhone = [
            { id: 'n1', message: 'Expense added', timestamp: '2026-10-14T10:00:00Z', read: true }
        ];
        const devicePC = [
            { id: 'n1', message: 'Expense added', timestamp: '2026-10-14T10:00:00Z', read: false }
        ];

        const merged = mergeNotifications(devicePhone, devicePC);
        expect(merged).toHaveLength(1);
        expect(merged[0].read).toBe(true);
    });

    it('merges notification metadata without losing details', () => {
        const listA = [
            { id: 'n2', message: 'Edited', timestamp: '2026-10-14T10:00:00Z', read: false, metadata: { amount: 20 } }
        ];
        const listB = [
            { id: 'n2', message: 'Edited', timestamp: '2026-10-14T10:05:00Z', read: true, metadata: { category: 'Coffee' } }
        ];

        const merged = mergeNotifications(listA, listB);
        expect(merged).toHaveLength(1);
        expect(merged[0].read).toBe(true);
        expect(merged[0].metadata).toEqual({ amount: 20, category: 'Coffee' });
    });

    it('enforces maximum 50 notifications limit', () => {
        const largeList = Array.from({ length: 60 }, (_, i) => ({
            id: `id_${i}`,
            message: `Msg ${i}`,
            timestamp: new Date(Date.now() + i * 1000).toISOString(),
            read: false
        }));

        const merged = mergeNotifications(largeList, []);
        expect(merged).toHaveLength(50);
        // Newest should be preserved at the top
        expect(merged[0].id).toBe('id_59');
    });
});

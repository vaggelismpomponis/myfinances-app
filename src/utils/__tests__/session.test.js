import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackSession } from '../session';
import { supabase } from '../../supabase';

describe('trackSession Utility', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock fetch response for IP info
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ip: '1.2.3.4',
        city: 'Athens',
        country_code: 'GR'
      })
    });
  });

  it('does nothing if no user is provided', async () => {
    await trackSession(null);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('creates a new session if no session ID exists in localStorage', async () => {
    supabase.from().single.mockResolvedValue({
      data: { id: 'new-session-id' },
      error: null
    });

    await trackSession(mockUser);

    expect(supabase.from).toHaveBeenCalledWith('sessions');
    expect(supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-123',
      ip: '1.2.3.4',
      location: 'Athens, GR'
    }));
    expect(localStorage.setItem).toHaveBeenCalledWith('myfinances_session_id', 'new-session-id');
  });

  it('updates existing session if session ID exists in localStorage', async () => {
    localStorage.setItem('myfinances_session_id', 'existing-session-id');
    
    supabase.from().eq.mockResolvedValue({ error: null });

    await trackSession(mockUser);

    expect(supabase.from().update).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-123'
    }));
    expect(supabase.from().eq).toHaveBeenCalledWith('id', 'existing-session-id');
  });

  it('attempts to create new session if update fails (session deleted)', async () => {
    localStorage.setItem('myfinances_session_id', 'deleted-session-id');
    
    // Fail update (eq is the terminal part of update chain)
    supabase.from().eq.mockResolvedValue({ error: { message: 'Not found' } });
    
    // Succeed insert (single is the terminal part of insert chain)
    supabase.from().single.mockResolvedValue({
      data: { id: 'brand-new-id' },
      error: null
    });

    await trackSession(mockUser);

    expect(supabase.from().update).toHaveBeenCalled();
    expect(supabase.from().insert).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith('myfinances_session_id', 'brand-new-id');
  });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';

// Import the module under test. This file asserts behavior of the request helper.
import * as api from './api';

// `apiRequest` is not exported; we test behavior indirectly via exported APIs.

describe('api service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches X-CSRF-Token on state-changing requests and includes credentials', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      // Login returns csrf_token in response body.
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf_token: 'csrf123', user: { id: 1 } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      // A follow-up state-changing call should attach the CSRF header.
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    await api.authAPI.login('a@b.com', 'pw');
    await api.blocklistAPI.blockIP('1.2.3.4', 'reason');

    const blockPostCall = fetchMock.mock.calls[1];
    const [, init] = blockPostCall;
    expect(init?.credentials).toBe('include');

    const headers = init?.headers as Record<string, string>;
    expect(headers['X-CSRF-Token']).toBe('csrf123');
  });

  it('does not send Authorization Bearer on reports upload in cookie mode', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      // CSRF token fetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrf_token: 'csrf123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
      // upload response
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

    const file = new File([new Blob(['x'], { type: 'application/pdf' })], 'r.pdf', {
      type: 'application/pdf',
    });

    await api.reportsAPI.upload(file);

    const uploadCall = fetchMock.mock.calls[1];
    const [, init] = uploadCall;
    const headers = (init?.headers || {}) as Record<string, string>;

    expect(Object.keys(headers)).not.toContain('Authorization');
    expect(headers['X-CSRF-Token']).toBe('csrf123');
    expect(init?.credentials).toBe('include');
  });
});

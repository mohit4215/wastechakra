import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useApi — manual trigger hook
 * Returns { data, loading, error, execute }
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        if (mountedRef.current) {
          setData(result);
        }
        return { data: result, error: null };
      } catch (err) {
        const message = friendlyError(err);
        if (mountedRef.current) {
          setError(message);
        }
        return { data: null, error: message };
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [apiFn]
  );

  return { data, loading, error, execute };
}

/**
 * useAutoApi — auto-executes on mount and when deps change
 * Returns { data, loading, error, refetch }
 */
export function useAutoApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(friendlyError(err));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

function friendlyError(err) {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  if (err.response) {
    const status = err.response.status;
    if (status === 401) return 'Session expired. Please log in again.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 500) return 'Server error. Please try again later.';
    const msg = err.response?.data?.detail || err.response?.data?.message;
    if (msg) return msg;
    return `Request failed (${status}).`;
  }
  if (err.message === 'Network Error') return 'Network error. Check your connection.';
  return err.message || 'Something went wrong. Please try again.';
}

export default useApi;

import { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";

let cachedAdmin = null;
let cachedPromise = null;

export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(cachedAdmin === true);

  useEffect(() => {
    if (cachedAdmin !== null) {
      setIsAdmin(cachedAdmin === true);
      return;
    }
    if (!cachedPromise) {
      cachedPromise = base44.auth.me().then(u => {
        cachedAdmin = u?.role === 'admin';
        return cachedAdmin;
      }).catch(() => {
        cachedAdmin = false;
        return false;
      });
    }
    cachedPromise.then(val => setIsAdmin(val));
  }, []);

  return isAdmin;
}
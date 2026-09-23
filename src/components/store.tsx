'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialState, isUserState, storageKey } from '@/lib/user-state';
import type { Stage, UserState } from '@/lib/types';
const Context = createContext<null | {
  state: UserState;
  ready: boolean;
  warning: string;
  update: (fn: (s: UserState) => UserState) => void;
  setStage: (id: string, stage: Stage | undefined) => void;
}>(null);
export function Store({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(initialState);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (isUserState(value)) setState(value);
        else setWarning('Saved data could not be read. Export a backup before resetting.');
      }
    } catch {
      setWarning('Browser storage unavailable. Changes will only last for this session.');
    }
    setReady(true);
  }, []);
  function update(fn: (s: UserState) => UserState) {
    setState((s) => {
      const next = fn(s);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        setWarning('Changes could not be saved. Export a backup from Settings.');
      }
      return next;
    });
  }
  function setStage(id: string, stage: Stage | undefined) {
    update((s) => {
      const next = { ...s.stages };
      if (stage) next[id] = stage;
      else delete next[id];
      return {
        ...s,
        stages: next,
        events: [
          {
            id: crypto.randomUUID(),
            propertyId: id,
            at: new Date().toISOString(),
            kind: 'stage',
            text: stage ? `Moved to ${stage}` : 'Removed from watchlist',
          },
          ...s.events,
        ],
      };
    });
  }
  return (
    <Context.Provider value={{ state, ready, warning, update, setStage }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Store missing');
  return ctx;
}

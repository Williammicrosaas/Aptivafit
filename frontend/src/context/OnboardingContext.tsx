import React, { createContext, useContext, useState, useCallback } from 'react';

export type OnboardingState = {
  gender?: string;
  goal?: string;
  experience?: string;
  current_frequency?: string;
  location?: string;
  injuries: string[];
  muscle_focus: string[];
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  target_weight_kg?: number;
  duration_pref?: string;
  setup_mode?: string;
  organization?: string;
  days_per_week?: number;
  units?: 'kg' | 'lb';
};

const initial: OnboardingState = {
  injuries: [],
  muscle_focus: [],
  age: 28,
  height_cm: 175,
  weight_kg: 75,
  target_weight_kg: 72,
  days_per_week: 3,
  units: 'kg',
};

type Ctx = {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  reset: () => void;
};

const OnboardingCtx = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initial);
  const update = useCallback((patch: Partial<OnboardingState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);
  const reset = useCallback(() => setState(initial), []);
  return (
    <OnboardingCtx.Provider value={{ state, update, reset }}>
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const c = useContext(OnboardingCtx);
  if (!c) throw new Error('useOnboarding must be used within OnboardingProvider');
  return c;
}

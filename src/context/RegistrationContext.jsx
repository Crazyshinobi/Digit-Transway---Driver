import React, { createContext, useContext } from 'react';
import { useRegistrationLogic } from '../hooks/useRegistrationLogic';

const RegistrationContext = createContext(null);

export const RegistrationProvider = ({ children, route, navigation }) => {
  const logic = useRegistrationLogic({ route, navigation });

  return (
    <RegistrationContext.Provider value={logic}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistrationContext = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error(
      'useRegistrationContext must be used within a RegistrationProvider',
    );
  }
  return context;
};

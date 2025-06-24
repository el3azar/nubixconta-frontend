import { createContext, useContext, useState } from "react";
import { Outlet } from "react-router-dom";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);

  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
     <Outlet />
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);

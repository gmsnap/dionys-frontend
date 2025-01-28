import React, { createContext, useState, useContext } from 'react';

interface HeaderContextType {
    isOverlayOpen: boolean;
    setIsOverlayOpen: (isOpen: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const useHeaderContext = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error("useHeaderContext must be used within a HeaderProvider");
    }
    return context;
};

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    return (
        <HeaderContext.Provider value={{ isOverlayOpen, setIsOverlayOpen }}>
            {children}
        </HeaderContext.Provider>
    );
};

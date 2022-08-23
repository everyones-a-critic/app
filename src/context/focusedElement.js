import React from 'react';

export const FocusedElementContext = React.createContext({
    focusedElement: null,
    setFocusedElement: () => {}
});
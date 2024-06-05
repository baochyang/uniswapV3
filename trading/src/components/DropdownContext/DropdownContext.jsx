
import React from "react"

// dropdown context for open state
export const DropdownContext = React.createContext({
  // Only expressions, functions or classes are allowed 
  // as the `default` export. (5:15)
    open: false,
    setOpen: () => {},
  });
import React from "react"

import { DropdownContext } from "../DropdownContext/DropdownContext"

// dropdown button for triggering open
export function DropdownButton({ children, ...props }) {
    const { open, setOpen } = React.useContext(DropdownContext); // get the context
    
    // to open and close the dropdown
    function toggleOpen() {
      setOpen(!open);
    };

    
    
    return (
      <button onClick={toggleOpen} className="dropdown_button">
        { children }
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={15} height={15} strokeWidth={4} stroke="currentColor" className={`ml-2 ${open ? "rotate-180" : "rotate-0"}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    )
  };
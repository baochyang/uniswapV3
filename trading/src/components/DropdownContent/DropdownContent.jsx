import React from "react"

import { DropdownContext } from "../DropdownContext/DropdownContext"

// dropdown content for displaying dropdown
export function DropdownContent({ children }) {
    const { open } = React.useContext(DropdownContext); // get the context
    
    return (
      <div className={`${ open ? "dropdown_content_open" : "dropdown_content_close"}`}>
        { children }
      </div>
    );
  };
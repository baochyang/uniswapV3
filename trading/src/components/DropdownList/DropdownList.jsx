import React from "react"

import { DropdownContext } from "../DropdownContext/DropdownContext"

// dropdown list for dropdown menus
export function DropdownList({ children, ...props }) {
    const { setOpen } = React.useContext(DropdownContext); // get the context
    
    return (
      <ul onClick={() => setOpen(false)} className="dropdown_list" {...props}>
        { children }  
      </ul>
    );
  };


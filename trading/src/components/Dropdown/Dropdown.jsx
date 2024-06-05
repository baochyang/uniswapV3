
import React from "react"

import { DropdownContext } from "../DropdownContext/DropdownContext"

// dropdown component for wrapping and providing context
export function Dropdown({ children, ...props }) {
  const [open, setOpen] = React.useState(false);

  ////////////////////////////////

  const dropdownRef = React.useRef(null);

  ////////////////////////////////
  // click listeners for closing dropdown
  React.useEffect(() => {
    // show no dropdown
    // function close() {
    //   setOpen(false);
    // };

    // close the dropdown if click outside
    function close(e) {
      if (!dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    // add or remove event listener
    if (open) {
      window.addEventListener("click", close);
    }
    // cleanup
    return function removeListener() {
      window.removeEventListener("click", close);
    }
  }, [open]); // only run if open state changes
  ////////////////////////////////


  return (
     <DropdownContext.Provider value={{ open, setOpen }}>
       {/* <div className="dropdown_context">{children}</div> */}
       <div ref={dropdownRef} className="dropdown_context">{children}</div>
     </DropdownContext.Provider>
  );


};
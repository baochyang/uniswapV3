

// import { Link } from "react-router-dom";

  // dropdown items for dropdown menus
export function DropdownItem({ children, ...props }) {
    return (
      <li>
        {/* <Link className="dropdown_item" {...props}>{ children }</Link>  */}

        {/* The above example assumes you are using React Router, and 
        your dropdown menu will usually be the Link component. You 
        could also use a button element or whatever your usual menu item will be. */}

        {/* <button className="dropdown_item" {...props}>{ children }</button> */}
        <span className="dropdown_item" {...props}>{ children }</span>
      </li>
    );
  };
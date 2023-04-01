import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Nav from "react-bootstrap/Nav";
import {
  toggleViewPeople,
  toggleViewPkg,
  toggleViewPlace,
  toggleViewTime,
  toggleViewViolations,
} from "../store/viewSlice";

export default function ViewSettings() {
  const dispatch = useDispatch();
  const [active, setActive] = useState(false);
  const { viewPkg, viewTime, viewPeople, viewPlace, viewViolations } =
    useSelector((state) => state.view);

  return (
    <>
      <Nav.Link
        className={active ? "dark" : ""}
        onClick={() => setActive(!active)}
      >
        <i className="fa fa-eye" />
      </Nav.Link>
      {active && (
        <>
          <Nav.Link
            className={viewPkg ? "dark" : ""}
            onClick={() => dispatch(toggleViewPkg())}
          >
            Balíček
          </Nav.Link>
          <Nav.Link
            className={viewTime ? "dark" : ""}
            onClick={() => dispatch(toggleViewTime())}
          >
            Čas
          </Nav.Link>
          <Nav.Link
            className={viewPeople ? "dark" : ""}
            onClick={() => dispatch(toggleViewPeople())}
          >
            Lidi
          </Nav.Link>
          <Nav.Link
            className={viewPlace ? "dark" : ""}
            onClick={() => dispatch(toggleViewPlace())}
          >
            Místo
          </Nav.Link>
          <Nav.Link
            className={viewViolations ? "dark" : ""}
            onClick={() => dispatch(toggleViewViolations())}
          >
            Porušení pravidel
          </Nav.Link>
        </>
      )}
    </>
  );
}

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
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
      <Nav.Item>
        <Nav.Link
          as={Button}
          variant={active ? "dark" : "light"}
          onClick={() => setActive(!active)}
        >
          <i className="fa fa-eye" />
        </Nav.Link>
      </Nav.Item>
      {active && (
        <>
          <Nav.Item>
            <Nav.Link
              as={Button}
              variant={viewPkg ? "dark" : "light"}
              onClick={() => dispatch(toggleViewPkg())}
            >
              Balíček
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Button}
              variant={viewTime ? "dark" : "light"}
              onClick={() => dispatch(toggleViewTime())}
            >
              Čas
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Button}
              variant={viewPeople ? "dark" : "light"}
              onClick={() => dispatch(toggleViewPeople())}
            >
              Lidi
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Button}
              variant={viewPlace ? "dark" : "light"}
              onClick={() => dispatch(toggleViewPlace())}
            >
              Místo
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              as={Button}
              variant={viewViolations ? "dark" : "light"}
              onClick={() => dispatch(toggleViewViolations())}
            >
              Porušení pravidel
            </Nav.Link>
          </Nav.Item>
        </>
      )}
    </>
  );
}

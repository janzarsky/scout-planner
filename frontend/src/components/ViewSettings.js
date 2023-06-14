import { useDispatch, useSelector } from "react-redux";
import Nav from "react-bootstrap/Nav";
import {
  toggleViewPeople,
  toggleViewPkg,
  toggleViewPlace,
  toggleViewSettingsEnabled,
  toggleViewTime,
  toggleViewViolations,
} from "../store/viewSlice";

export function ViewSettings() {
  const dispatch = useDispatch();
  const viewSettingsEnabled = useSelector(
    (state) => state.view.viewSettingsEnabled
  );
  const { viewPkg, viewTime, viewPeople, viewPlace, viewViolations } =
    useSelector((state) => state.view);

  return (
    <>
      <Nav.Link
        className={viewSettingsEnabled ? "dark" : ""}
        onClick={() => dispatch(toggleViewSettingsEnabled())}
      >
        <i className="fa fa-eye" />
      </Nav.Link>
      {viewSettingsEnabled && (
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

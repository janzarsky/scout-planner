import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import {
  toggleViewPeople,
  toggleViewPkg,
  toggleViewPlace,
  toggleViewSettingsEnabled,
  toggleViewTime,
  toggleViewViolations,
} from "../store/viewSlice";

export function ViewSettingsToggle() {
  const dispatch = useDispatch();
  const viewSettingsEnabled = useSelector(
    (state) => state.view.viewSettingsEnabled,
  );

  return (
    <Nav.Link
      className={viewSettingsEnabled ? "dark" : ""}
      onClick={() => dispatch(toggleViewSettingsEnabled())}
    >
      <i className="fa fa-eye" />
    </Nav.Link>
  );
}

export function ViewSettings() {
  const dispatch = useDispatch();
  const viewSettingsEnabled = useSelector(
    (state) => state.view.viewSettingsEnabled,
  );
  const { viewPkg, viewTime, viewPeople, viewPlace, viewViolations } =
    useSelector((state) => state.view);

  if (!viewSettingsEnabled) return null;

  return (
    <>
      <Button
        variant={viewPkg ? "dark" : "light"}
        onClick={() => dispatch(toggleViewPkg())}
      >
        Balíček
      </Button>
      <Button
        variant={viewTime ? "dark" : "light"}
        onClick={() => dispatch(toggleViewTime())}
      >
        Čas
      </Button>
      <Button
        variant={viewPeople ? "dark" : "light"}
        onClick={() => dispatch(toggleViewPeople())}
      >
        Lidi
      </Button>
      <Button
        variant={viewPlace ? "dark" : "light"}
        onClick={() => dispatch(toggleViewPlace())}
      >
        Místo
      </Button>
      <Button
        variant={viewViolations ? "dark" : "light"}
        onClick={() => dispatch(toggleViewViolations())}
      >
        Porušení pravidel
      </Button>
    </>
  );
}

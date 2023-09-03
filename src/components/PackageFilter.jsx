import React from "react";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { useDispatch, useSelector } from "react-redux";
import { byName } from "../helpers/Sorting";
import {
  toggleHighlightedPackage,
  toggleHighlighting,
} from "../store/viewSlice";

export function PackageFilterToggle() {
  const dispatch = useDispatch();
  const highlightingEnabled = useSelector(
    (state) => state.view.highlightingEnabled,
  );

  return (
    <Nav.Link
      className={highlightingEnabled ? "dark" : ""}
      onClick={() => dispatch(toggleHighlighting())}
    >
      <i className="fa fa-filter" />
    </Nav.Link>
  );
}

export function PackageFilter() {
  const dispatch = useDispatch();
  const packages = useSelector((state) => state.packages.packages);
  const { highlightedPackages, highlightingEnabled } = useSelector(
    (state) => state.view,
  );

  if (!highlightingEnabled) return null;

  return [...packages].sort(byName).map((pkg) => (
    <Button
      key={pkg._id}
      variant={highlightedPackages.indexOf(pkg._id) !== -1 ? "dark" : "light"}
      style={
        highlightedPackages.indexOf(pkg._id) === -1
          ? { backgroundColor: pkg.color }
          : {}
      }
      onClick={() => dispatch(toggleHighlightedPackage(pkg._id))}
    >
      {pkg.name}
    </Button>
  ));
}

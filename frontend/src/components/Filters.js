import Nav from "react-bootstrap/Nav";
import { useDispatch, useSelector } from "react-redux";
import { byName } from "../helpers/Sorting";
import {
  toggleHighlightedPackage,
  toggleHighlighting,
} from "../store/viewSlice";

function FiltersToggle() {
  const dispatch = useDispatch();
  const highlightingEnabled = useSelector(
    (state) => state.view.highlightingEnabled
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

export function Filters() {
  const dispatch = useDispatch();
  const packages = useSelector((state) => state.packages.packages);
  const { highlightedPackages, highlightingEnabled } = useSelector(
    (state) => state.view
  );

  return (
    <>
      <FiltersToggle />
      {highlightingEnabled &&
        [...packages].sort(byName).map((pkg) => (
          <Nav.Link
            key={pkg._id}
            className={
              highlightedPackages.indexOf(pkg._id) !== -1 ? "dark" : ""
            }
            style={
              highlightedPackages.indexOf(pkg._id) === -1
                ? { backgroundColor: pkg.color }
                : {}
            }
            onClick={() => dispatch(toggleHighlightedPackage(pkg._id))}
          >
            {pkg.name}
          </Nav.Link>
        ))}
    </>
  );
}

import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { useDispatch, useSelector } from "react-redux";
import { byName } from "../helpers/Sorting";
import {
  toggleHighlightedPackage,
  toggleHighlighting,
} from "../store/viewSlice";

export default function Filters() {
  const dispatch = useDispatch();
  const packages = useSelector((state) => state.packages.packages);
  const { highlightedPackages, highlightingEnabled } = useSelector(
    (state) => state.view
  );

  return (
    <>
      <Nav.Item>
        <Nav.Link
          as={Button}
          variant={highlightingEnabled ? "dark" : "light"}
          onClick={() => dispatch(toggleHighlighting())}
        >
          <i className="fa fa-filter" />
        </Nav.Link>
      </Nav.Item>
      {highlightingEnabled &&
        [...packages].sort(byName).map((pkg) => (
          <Nav.Item key={pkg._id}>
            <Nav.Link
              as={Button}
              variant={
                highlightedPackages.indexOf(pkg._id) === -1 ? "light" : "dark"
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
          </Nav.Item>
        ))}
    </>
  );
}

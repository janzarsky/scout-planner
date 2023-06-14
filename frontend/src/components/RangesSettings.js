import { useDispatch, useSelector } from "react-redux";
import Nav from "react-bootstrap/Nav";
import { setActiveRange, toggleRangesEnabled } from "../store/viewSlice";

function RangesSettingsToggle() {
  const dispatch = useDispatch();
  const rangesEnabled = useSelector((state) => state.view.rangesEnabled);

  return (
    <Nav.Link
      className={rangesEnabled ? "dark" : ""}
      onClick={() => dispatch(toggleRangesEnabled())}
    >
      <i className="fa fa-area-chart" />
    </Nav.Link>
  );
}

export function RangesSettings() {
  const dispatch = useDispatch();
  const { rangesEnabled, activeRange } = useSelector((state) => state.view);
  const ranges = useSelector((state) => state.ranges.ranges);

  return (
    <>
      <RangesSettingsToggle />
      {rangesEnabled
        ? ranges.map((range) => (
            <Nav.Link
              key={range._id}
              className={activeRange === range._id ? "dark" : ""}
              onClick={() => dispatch(setActiveRange(range._id))}
            >
              {range.name}
            </Nav.Link>
          ))
        : null}
    </>
  );
}

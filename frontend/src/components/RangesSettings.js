import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { setActiveRange, toggleRangesEnabled } from "../store/viewSlice";

export default function RangesSettings() {
  const dispatch = useDispatch();
  const { rangesEnabled, activeRange } = useSelector((state) => state.view);
  const ranges = useSelector((state) => state.ranges.ranges);

  return (
    <>
      <Nav.Item>
        <Nav.Link
          as={Button}
          variant={rangesEnabled ? "dark" : "light"}
          onClick={() => dispatch(toggleRangesEnabled())}
        >
          <i className="fa fa-area-chart" />
        </Nav.Link>
      </Nav.Item>
      {rangesEnabled
        ? ranges.map((range) => (
            <Nav.Item key={range._id}>
              <Nav.Link
                as={Button}
                variant={activeRange === range._id ? "dark" : "light"}
                onClick={() => dispatch(setActiveRange(range._id))}
              >
                {range.name}
              </Nav.Link>
            </Nav.Item>
          ))
        : null}
    </>
  );
}

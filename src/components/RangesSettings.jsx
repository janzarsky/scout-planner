import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { setActiveRange, toggleRangesEnabled } from "../store/viewSlice";
import { useGetRangesQuery } from "../store/rangesApi";

export function RangesSettingsToggle() {
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
  const { table } = useSelector((state) => state.auth);
  const { data: ranges, isSuccess: rangesLoaded } = useGetRangesQuery(table);

  if (!rangesEnabled || !rangesLoaded) return null;

  return ranges.map((range) => (
    <Button
      key={range._id}
      variant={activeRange === range._id ? "dark" : "light"}
      onClick={() => dispatch(setActiveRange(range._id))}
    >
      {range.name}
    </Button>
  ));
}

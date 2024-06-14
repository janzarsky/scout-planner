import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { setActiveRange, toggleRangesEnabled } from "../store/viewSlice";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetRangesSlice } from "../store/rangesSlice";

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
  const rtkQuery = useSelector((state) => state.config.rtkQuery);
  const { table } = useSelector((state) => state.auth);
  const { data: oldRanges, isSuccess: oldRangesLoaded } = useGetRangesSlice(
    table,
    rtkQuery,
  );
  const { data: newRanges, isSuccess: newRangesLoaded } = useGetRangesQuery(
    table,
    rtkQuery,
  );
  const ranges = rtkQuery ? newRanges : oldRanges;
  const rangesLoaded = rtkQuery ? newRangesLoaded : oldRangesLoaded;

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

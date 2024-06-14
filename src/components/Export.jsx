import React from "react";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetRangesSlice } from "../store/rangesSlice";
import { useGetPackagesSlice } from "../store/packagesSlice";
import { useGetGroupsSlice } from "../store/groupsSlice";

export default function Export() {
  const table = useSelector((state) => state.auth.table);
  const rtkQuery = useSelector((state) => state.config.rtkQuery);

  const { data: groups } = useGetGroupsSlice(table, false);
  const { data: oldRanges } = useGetRangesSlice(table, rtkQuery);
  const { data: newRanges } = useGetRangesQuery(table, rtkQuery);
  const ranges = rtkQuery ? newRanges : oldRanges;
  const { data: packages } = useGetPackagesSlice(table, false);
  const rules = useSelector((state) => state.rules.rules);
  const users = useSelector((state) => state.users.users);
  const settings = useSelector((state) => state.settings.settings);
  const people = useSelector((state) => state.people.people);
  const { programs, deletedPrograms } = useSelector((state) => state.programs);

  const data = JSON.stringify({
    programs: [...programs, ...deletedPrograms],
    pkgs: packages,
    groups,
    rules,
    ranges,
    users,
    settings,
    people,
  });

  return (
    <Form.Group className="mb-3">
      <Form.Label>Exportovaná data:</Form.Label>
      <Form.Control as="textarea" value={data} readOnly />
    </Form.Group>
  );
}

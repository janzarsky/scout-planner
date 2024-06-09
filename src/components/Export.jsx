import React from "react";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { useGetRangesQuery } from "../store/rangesApi";

export default function Export() {
  const table = useSelector((state) => state.auth.table);
  const rtkQuery = useSelector((state) => state.config.rtkQuery);

  const groups = useSelector((state) => state.groups.groups);
  const { ranges: oldRanges } = useSelector((state) => state.ranges);
  const { data: newRanges } = useGetRangesQuery(table, rtkQuery);
  const ranges = rtkQuery ? newRanges : oldRanges;
  const packages = useSelector((state) => state.packages.packages);
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

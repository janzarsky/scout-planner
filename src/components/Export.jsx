import React from "react";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetPackagesSlice } from "../store/packagesSlice";
import { useGetGroupsSlice } from "../store/groupsSlice";
import { useGetPeopleSlice } from "../store/peopleSlice";
import { useGetRulesSlice } from "../store/rulesSlice";
import { useGetSettingsSlice } from "../store/settingsSlice";
import { useGetUsersSlice } from "../store/usersSlice";
import { useGetProgramsSlice } from "../store/programsSlice";

export default function Export() {
  const table = useSelector((state) => state.auth.table);

  const { data: groups } = useGetGroupsSlice(table);
  const { data: ranges } = useGetRangesQuery(table);
  const { data: packages } = useGetPackagesSlice(table);
  const { data: rules } = useGetRulesSlice(table);
  const { data: users } = useGetUsersSlice(table);
  const { data: settings } = useGetSettingsSlice(table);
  const { data: people } = useGetPeopleSlice(table);
  const { data: programs } = useGetProgramsSlice(table);

  const data = JSON.stringify({
    programs,
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

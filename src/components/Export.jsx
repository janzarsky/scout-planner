import React from "react";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetProgramsSlice } from "../store/programsSlice";
import { useGetGroupsQuery } from "../store/groupsApi";
import { useGetPackagesQuery } from "../store/packagesApi";
import { useGetPeopleQuery } from "../store/peopleApi";
import { useGetRulesQuery } from "../store/rulesApi";
import { useGetUsersQuery } from "../store/usersApi";
import { useGetSettingsQuery } from "../store/settingsApi";
import { useGetProgramsQuery } from "../store/programsApi";

export default function Export() {
  const table = useSelector((state) => state.auth.table);

  const { data: groups } = useGetGroupsQuery(table);
  const { data: ranges } = useGetRangesQuery(table);
  const { data: packages } = useGetPackagesQuery(table);
  const { data: rules } = useGetRulesQuery(table);
  const { data: users } = useGetUsersQuery(table);
  const { data: settings } = useGetSettingsQuery(table);
  const { data: people } = useGetPeopleQuery(table);
  const rtkQueryPrograms = useSelector(
    (state) => state.config.rtkQueryPrograms,
  );
  const { data: programs } = rtkQueryPrograms
    ? useGetProgramsQuery(table)
    : useGetProgramsSlice(table);

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

import React from "react";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetGroupsQuery } from "../store/groupsApi";
import { useGetPackagesQuery } from "../store/packagesApi";
import { useGetPeopleQuery } from "../store/peopleApi";
import { useGetRulesQuery } from "../store/rulesApi";
import { useGetUsersQuery } from "../store/usersApi";
import { useGetSettingsQuery } from "../store/settingsApi";
import { useGetProgramsQuery } from "../store/programsApi";
import { useGetTimetableQuery } from "../store/timetableApi";

export default function Export() {
  const table = useSelector((state) => state.auth.table);

  const { data: groups } = useGetGroupsQuery(table);
  const { data: ranges } = useGetRangesQuery(table);
  const { data: packages } = useGetPackagesQuery(table);
  const { data: rules } = useGetRulesQuery(table);
  const { data: users } = useGetUsersQuery(table);
  const { data: settings } = useGetSettingsQuery(table);
  const { data: people } = useGetPeopleQuery(table);
  const { data: programs } = useGetProgramsQuery(table);
  const { data: timetable } = useGetTimetableQuery(table);

  const data = JSON.stringify({
    programs,
    pkgs: packages,
    groups,
    rules,
    ranges,
    users,
    settings, // Settings are part of timetable, kept for compatibility
    people,
    timetable,
  });

  return (
    <Form.Group className="mb-3">
      <Form.Label>Exportovaná data:</Form.Label>
      <Form.Control as="textarea" value={data} readOnly />
    </Form.Group>
  );
}

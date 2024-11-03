import React from "react";
import Table from "react-bootstrap/Table";
import { useSelector } from "react-redux";
import { formatDuration } from "../helpers/DateUtils";
import { byName, byOrder } from "../helpers/Sorting";
import { useGetGroupsQuery } from "../store/groupsApi";
import { useGetPackagesQuery } from "../store/packagesApi";
import { useGetPeopleQuery } from "../store/peopleApi";
import { useGetProgramsQuery } from "../store/programsApi";

export default function Stats() {
  return (
    <>
      <PackageStats />
      <PeopleStats />
    </>
  );
}

function PackageStats() {
  const { table } = useSelector((state) => state.auth);
  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsQuery(table);
  const { data: packages, isSuccess: packagesLoaded } =
    useGetPackagesQuery(table);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);

  const durationPerPackageAndGroup = getDurationPerPackageAndGroup(
    programsLoaded ? programs : [],
  );

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Balíček</th>
          {groupsLoaded &&
            [...groups]
              .sort(byOrder)
              .map((group) => <th key={group._id}>{group.name}</th>)}
        </tr>
      </thead>
      <tbody>
        {packagesLoaded &&
          [...packages]
            .sort(byName)
            .filter((pkg) => pkg.name[0] !== "(")
            .map((pkg) => (
              <tr key={pkg._id}>
                <td>{pkg.name}</td>
                {groupsLoaded &&
                  [...groups]
                    .sort(byOrder)
                    .map((group) => (
                      <td key={group._id}>
                        {durationPerPackageAndGroup[pkg._id] &&
                        durationPerPackageAndGroup[pkg._id][group._id]
                          ? formatDuration(
                              durationPerPackageAndGroup[pkg._id][group._id],
                            )
                          : ""}
                      </td>
                    ))}
              </tr>
            ))}
      </tbody>
    </Table>
  );
}

function PeopleStats() {
  const { table } = useSelector((state) => state.auth);
  const { data: people, isSuccess: peopleLoaded } = useGetPeopleQuery(table);
  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsQuery(table);
  const { data: packages, isSuccess: packagesLoaded } =
    useGetPackagesQuery(table);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);

  const durationPerPersonAndGroup = getDurationPerPersonAndGroup(
    programsLoaded ? programs : [],
    packagesLoaded ? packages : [],
  );

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Lidi</th>
          {groupsLoaded &&
            [...groups]
              .sort(byOrder)
              .map((group) => <th key={group._id}>{group.name}</th>)}
        </tr>
      </thead>
      <tbody>
        {peopleLoaded &&
          [...people]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((person) => (
              <tr key={person._id}>
                <td>{person.name}</td>
                {[...groups].sort(byOrder).map((group) => (
                  <td key={group._id}>
                    {durationPerPersonAndGroup[person._id] &&
                    durationPerPersonAndGroup[person._id][group._id]
                      ? formatDuration(
                          durationPerPersonAndGroup[person._id][group._id],
                        )
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </Table>
  );
}

function getDurationPerPackageAndGroup(programs) {
  const counters = {};

  for (const program of programs) {
    if (program.title[0] !== "(") {
      if (counters[program.pkg] === undefined) counters[program.pkg] = {};

      for (const group of program.groups) {
        if (counters[program.pkg][group] === undefined)
          counters[program.pkg][group] = 0;

        counters[program.pkg][group] += program.duration;
      }
    }
  }

  return counters;
}

function getDurationPerPersonAndGroup(programs, pkgs) {
  const counters = {};

  for (const program of programs) {
    const pkg = pkgs.find((pkg) => pkg._id === program.pkg);

    if ((!pkg || (pkg && pkg.name[0] !== "(")) && program.title[0] !== "(") {
      for (const attendance of program.people) {
        if (counters[attendance.person] === undefined)
          counters[attendance.person] = {};

        for (const group of program.groups) {
          if (counters[attendance.person][group] === undefined)
            counters[attendance.person][group] = 0;

          counters[attendance.person][group] += program.duration;
        }
      }
    }
  }

  return counters;
}

export const testing = {
  getDurationPerPersonAndGroup,
};

import React from "react";
import Table from "react-bootstrap/Table";
import { formatDuration } from "../helpers/DateUtils";

export default function Stats(props) {
  return (
    <>
      {getPackageStats(props)}
      {getPeopleStats(props)}
    </>
  );
}

function getPackageStats(props) {
  const durationPerPackageAndGroup = getDurationPerPackageAndGroup(
    props.programs
  );
  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Balíček</th>
          {[...props.groups]
            .sort((a, b) => {
              if (a.order < b.order) return -1;
              if (a.order > b.order) return 1;
              return 0;
            })
            .map((group) => (
              <th key={group._id}>{group.name}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {[...props.packages]
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((pkg) => pkg.name[0] !== "(")
          .map((pkg) => (
            <tr key={pkg._id}>
              <td>{pkg.name}</td>
              {[...props.groups]
                .sort((a, b) => {
                  if (a.order < b.order) return -1;
                  if (a.order > b.order) return 1;
                  return 0;
                })
                .map((group) => (
                  <td key={group._id}>
                    {durationPerPackageAndGroup[pkg._id] &&
                    durationPerPackageAndGroup[pkg._id][group._id]
                      ? formatDuration(
                          durationPerPackageAndGroup[pkg._id][group._id]
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

function getPeopleStats(props) {
  const durationPerPersonAndGroup = getDurationPerPersonAndGroup(
    props.programs,
    props.packages
  );
  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Lidi</th>
          {[...props.groups]
            .sort((a, b) => {
              if (a.order < b.order) return -1;
              if (a.order > b.order) return 1;
              return 0;
            })
            .map((group) => (
              <th key={group._id}>{group.name}</th>
            ))}
        </tr>
      </thead>
      <tbody>
        {[...props.people]
          .sort((a, b) => a.localeCompare(b))
          .map((person) => (
            <tr key={person}>
              <td>{person}</td>
              {[...props.groups]
                .sort((a, b) => {
                  if (a.order < b.order) return -1;
                  if (a.order > b.order) return 1;
                  return 0;
                })
                .map((group) => (
                  <td key={group._id}>
                    {durationPerPersonAndGroup[person] &&
                    durationPerPersonAndGroup[person][group._id]
                      ? formatDuration(
                          durationPerPersonAndGroup[person][group._id]
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

    if (pkg && pkg.name[0] !== "(" && program.title[0] !== "(") {
      for (const person of program.people) {
        if (counters[person] === undefined) counters[person] = {};

        for (const group of program.groups) {
          if (counters[person][group] === undefined)
            counters[person][group] = 0;

          counters[person][group] += program.duration;
        }
      }
    }
  }

  return counters;
}

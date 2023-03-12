import Table from "react-bootstrap/Table";
import { useSelector } from "react-redux";
import { formatDuration } from "../helpers/DateUtils";
import { byName, byOrder } from "../helpers/Sorting";

export default function Stats() {
  return (
    <>
      <PackageStats />
      <PeopleStats />
    </>
  );
}

function PackageStats() {
  const { groups } = useSelector((state) => state.groups);
  const { packages } = useSelector((state) => state.packages);
  const { programs } = useSelector((state) => state.programs);

  const durationPerPackageAndGroup = getDurationPerPackageAndGroup(programs);

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Balíček</th>
          {[...groups].sort(byOrder).map((group) => (
            <th key={group._id}>{group.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...packages]
          .sort(byName)
          .filter((pkg) => pkg.name[0] !== "(")
          .map((pkg) => (
            <tr key={pkg._id}>
              <td>{pkg.name}</td>
              {[...groups].sort(byOrder).map((group) => (
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

function PeopleStats() {
  const people = useSelector((state) => state.people.legacyPeople);
  const { groups } = useSelector((state) => state.groups);
  const { packages } = useSelector((state) => state.packages);
  const { programs } = useSelector((state) => state.programs);

  const durationPerPersonAndGroup = getDurationPerPersonAndGroup(
    programs,
    packages
  );

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Lidi</th>
          {[...groups].sort(byOrder).map((group) => (
            <th key={group._id}>{group.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...people]
          .sort((a, b) => a.localeCompare(b))
          .map((person) => (
            <tr key={person}>
              <td>{person}</td>
              {[...groups].sort(byOrder).map((group) => (
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

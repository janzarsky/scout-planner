import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Client from "../Client";
import { useSelector } from "react-redux";

export default function Import() {
  const [dataToImport, setDataToImport] = useState();

  const { table } = useSelector((state) => state.auth);
  const client = new Client(table);

  async function handleSubmit(event) {
    event.preventDefault();

    const data = JSON.parse(dataToImport);
    await importData(data, client);

    window.location.reload();
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Data k importu:</Form.Label>
        <Form.Control
          as="textarea"
          value={dataToImport}
          onChange={(e) => setDataToImport(e.target.value)}
        />
      </Form.Group>
      <Form.Group>
        <Button type="submit">Importovat</Button>
      </Form.Group>
    </Form>
  );
}

async function importData(data, client) {
  // data fixes
  if (data.ranges === undefined) data.ranges = [];
  if (data.users === undefined) data.users = [];
  if (data.settings === undefined) data.settings = {};
  if (data.people === undefined) data.people = [];

  return await Promise.all([
    // add all packages
    Promise.all([
      ...data.pkgs.map((pkg) =>
        client.addPackage({ ...pkg, _id: undefined }).then(
          // create package ID replacement map
          (newPkg) => [pkg._id, newPkg._id]
        )
      ),
    ]).then((pkgs) => new Map(pkgs)),
    // add all groups
    Promise.all([
      ...data.groups.map((group) =>
        client.addGroup({ ...group, _id: undefined }).then(
          // create group ID replacement map
          (newGroup) => [group._id, newGroup._id]
        )
      ),
    ]).then((groups) => new Map(groups)),
    // add all ranges
    Promise.all([
      ...data.ranges.map((range) =>
        client.addRange({ ...range, _id: undefined }).then(
          // create range ID replacement map
          (newRange) => [range._id, newRange._id]
        )
      ),
    ]).then((ranges) => new Map(ranges)),
    // add all people
    Promise.all([
      ...data.people.map((person) =>
        client.addPerson({ ...person, _id: undefined }).then(
          // create person ID replacement map
          (newPerson) => [person._id, newPerson._id]
        )
      ),
    ]).then((people) => new Map(people)),
    client.updateSettings(data.settings),
  ])
    // replace package, group, range, and people IDs in programs
    .then(([pkgs, groups, ranges, people]) =>
      data.programs.map((prog) => {
        return {
          ...prog,
          pkg: pkgs.get(prog.pkg),
          groups: prog.groups.map((oldGroup) => groups.get(oldGroup)),
          ranges: prog.ranges
            ? Object.fromEntries(
                Object.entries(prog.ranges).map(([oldRange, val]) => [
                  ranges.get(oldRange),
                  val,
                ])
              )
            : undefined,
          people: prog.people.map((oldPerson) => {
            if (typeof oldPerson === "object" && oldPerson)
              return { ...oldPerson, person: people.get(oldPerson.person) };
            else return oldPerson;
          }),
        };
      })
    )
    // add all programs
    .then((programs) =>
      Promise.all(
        programs.map((prog) =>
          client
            .addProgram({
              ...prog,
              _id: undefined,
            })
            .then(
              // create program ID replacement map
              (newProg) => [prog._id, newProg._id]
            )
        )
      )
    )
    .then((programs) => new Map(programs))
    // replace program IDs in rules
    .then((programs) =>
      data.rules.map((rule) => {
        var value = rule.value;
        if (
          rule.condition === "is_before_program" ||
          rule.condition === "is_after_program"
        )
          value = programs.get(rule.value);
        return {
          ...rule,
          program: programs.get(rule.program),
          value: value,
        };
      })
    )
    // add all rules
    .then((rules) =>
      Promise.all(
        rules.map((rule) => client.addRule({ ...rule, _id: undefined }))
      )
    )
    // add all users (at the end, so there are no issues with permissions)
    .then(() =>
      Promise.all([
        ...data.users.map((user) =>
          client.addUser({ ...user, _id: undefined })
        ),
      ])
    );
}

export const testing = {
  importData,
};

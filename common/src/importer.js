import { level } from "./level";

export async function importData(data, client) {
  // data fixes
  data.ranges ??= [];
  data.users ??= [];
  data.people ??= [];
  data.timetable ??= { settings: data.settings ?? {} };

  return await Promise.all([
    importPackages(data.pkgs, client),
    importGroups(data.groups, client),
    importRanges(data.ranges, client),
    importPeople(data.people, client),
  ])
    .then(([pkgs, groups, ranges, people]) =>
      replaceIdsInPrograms(data.programs, pkgs, groups, ranges, people),
    )
    // add all programs
    .then((programs) =>
      Promise.all(
        programs.map((prog) =>
          client.addProgram(prog).then(
            // create program ID replacement map
            (newProg) => [prog._id, newProg._id],
          ),
        ),
      ),
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
      }),
    )
    // add all rules
    .then((rules) => Promise.all(rules.map((rule) => client.addRule(rule))))
    // add all users (at the end, so there are no issues with permissions)
    .then(() => importUsersFirestore(data.users, client))
    .then(() => client.updateTimetable(data.timetable));
}

async function importPackages(pkgs, client) {
  async function importPackage(pkg) {
    const newPkg = await client.addPackage(pkg);
    return [pkg._id, newPkg._id];
  }

  const idPairs = await Promise.all([...pkgs.map(importPackage)]);
  return new Map(idPairs);
}

async function importGroups(groups, client) {
  async function importGroup(group) {
    const newGroup = await client.addGroup(group);
    return [group._id, newGroup._id];
  }

  const idPairs = await Promise.all([...groups.map(importGroup)]);
  return new Map(idPairs);
}

async function importRanges(ranges, client) {
  async function importRange(range) {
    const newRange = await client.addRange(range);
    return [range._id, newRange._id];
  }

  const idPairs = await Promise.all([...ranges.map(importRange)]);
  return new Map(idPairs);
}

async function importPeople(people, client) {
  async function importPerson(person) {
    const newPerson = await client.addPerson(person);
    return [person._id, newPerson._id];
  }

  const idPairs = await Promise.all([...people.map(importPerson)]);
  return new Map(idPairs);
}

function replaceIdsInPrograms(programs, pkgs, groups, ranges, people) {
  return programs.map((prog) => ({
    ...prog,
    pkg: pkgs.get(prog.pkg) ? pkgs.get(prog.pkg) : null,
    groups: prog.groups.map((oldGroup) =>
      groups.get(oldGroup) ? groups.get(oldGroup) : null,
    ),
    ranges: prog.ranges
      ? Object.fromEntries(
          Object.entries(prog.ranges).map(([oldRange, val]) => [
            ranges.get(oldRange),
            val,
          ]),
        )
      : null,
    people: prog.people.map((oldPerson) =>
      typeof oldPerson === "string"
        ? oldPerson
        : {
            ...oldPerson,
            person: people.get(oldPerson.person)
              ? people.get(oldPerson.person)
              : null,
          },
    ),
  }));
}

function importUsersFirestore(users, client) {
  const realUsers = users.filter((user) => user.email !== "public");

  const publicUser = users.find((user) => user.email === "public");
  const publicUserLevel = publicUser ? publicUser.level : level.ADMIN;

  return Promise.all([
    ...realUsers.map((user) => client.updateUser({ ...user, _id: user.email })),
    client.setPublicLevel(publicUserLevel),
  ]);
}

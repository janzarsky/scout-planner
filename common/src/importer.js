import { level } from "./level";

export async function importData(data, client) {
  // data fixes
  data.ranges ??= [];
  data.users ??= [];
  data.people ??= [];
  data.timetable ??= { settings: data.settings ?? {} };

  return await Promise.all([
    importEntity(data.pkgs, client.addPackage),
    importEntity(data.groups, client.addGroup),
    importEntity(data.ranges, client.addRange),
    importEntity(data.people, client.addPerson),
  ])
    .then(([pkgs, groups, ranges, people]) =>
      replaceIdsInPrograms(data.programs, pkgs, groups, ranges, people),
    )
    .then((programs) => importEntity(programs, client.addProgram))
    .then((programIdPairs) => replaceIdsInRules(data.rules, programIdPairs))
    // add all rules
    .then((rules) => Promise.all(rules.map((rule) => client.addRule(rule))))
    // add all users (at the end, so there are no issues with permissions)
    .then(() => importUsersFirestore(data.users, client))
    .then(() => client.updateTimetable(data.timetable));
}

async function importEntity(data, importFn) {
  async function importItem(item) {
    const newItem = await importFn(item);
    return [item._id, newItem._id];
  }

  const idPairs = await Promise.all(data.map(importItem));
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

function replaceIdsInRules(rules, programIdPairs) {
  return rules.map((rule) => {
    var value = rule.value;
    if (
      rule.condition === "is_before_program" ||
      rule.condition === "is_after_program"
    )
      value = programIdPairs.get(rule.value);
    return {
      ...rule,
      program: programIdPairs.get(rule.program),
      value: value,
    };
  });
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

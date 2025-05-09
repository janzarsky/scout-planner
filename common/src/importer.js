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
    .then(([pkgIds, groupIds, rangeIds, personIds]) =>
      replaceIdsInPrograms(
        data.programs,
        pkgIds,
        groupIds,
        rangeIds,
        personIds,
      ),
    )
    .then((programs) => importEntity(programs, client.addProgram))
    .then((programIds) => replaceIdsInRules(data.rules, programIds))
    .then((rules) => importEntity(rules, client.addRule))
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

function replaceIdsInPrograms(programs, pkgIds, groupIds, rangeIds, personIds) {
  return programs.map((prog) => ({
    ...prog,
    pkg: pkgIds.get(prog.pkg) ? pkgIds.get(prog.pkg) : null,
    groups: prog.groups.map((oldGroup) =>
      groupIds.get(oldGroup) ? groupIds.get(oldGroup) : null,
    ),
    ranges: prog.ranges
      ? Object.fromEntries(
          Object.entries(prog.ranges).map(([oldRange, val]) => [
            rangeIds.get(oldRange),
            val,
          ]),
        )
      : null,
    people: prog.people.map((oldPerson) =>
      typeof oldPerson === "string"
        ? oldPerson
        : {
            ...oldPerson,
            person: personIds.get(oldPerson.person)
              ? personIds.get(oldPerson.person)
              : null,
          },
    ),
  }));
}

function replaceIdsInRules(rules, programIds) {
  return rules.map((rule) => {
    var value = rule.value;
    if (
      rule.condition === "is_before_program" ||
      rule.condition === "is_after_program"
    )
      value = programIds.get(rule.value);
    return {
      ...rule,
      program: programIds.get(rule.program),
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

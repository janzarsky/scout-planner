import { level } from "./level";

export async function importData(data, client) {
  const fullData = getDataFixes(data);

  return await Promise.all([
    importEntity(fullData.pkgs, client.addPackage),
    importEntity(fullData.groups, client.addGroup),
    importEntity(fullData.ranges, client.addRange),
    importEntity(fullData.people, client.addPerson),
  ])
    .then(([pkgIds, groupIds, rangeIds, personIds]) =>
      replaceIdsInPrograms(
        fullData.programs,
        pkgIds,
        groupIds,
        rangeIds,
        personIds,
      ),
    )
    .then((programs) => importEntity(programs, client.addProgram))
    .then((programIds) => replaceIdsInRules(fullData.rules, programIds))
    .then((rules) => importEntity(rules, client.addRule))
    // add all users (at the end, so there are no issues with permissions)
    .then(() => importUsersFirestore(fullData.users, client))
    .then(() => importTimetable(fullData.timetable, client));
}

function getDataFixes(data) {
  return {
    ...data,
    ranges: data.ranges ?? [],
    users: data.users ?? [],
    people: data.people ?? [],
    timetable: data.timetable ?? { settings: data.settings ?? {} },
  };
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

async function importTimetable(timetable, client) {
  await client.updateTimetable(timetable);
}

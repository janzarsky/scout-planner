import { level } from "./level";

export async function importData(data, client) {
  const fullData = getDataFixes(data);

  const [pkgIds, groupIds, rangeIds, personIds] = await Promise.all([
    importEntity(fullData.pkgs, client.addPackage),
    importEntity(fullData.groups, client.addGroup),
    importEntity(fullData.ranges, client.addRange),
    importEntity(fullData.people, client.addPerson),
  ]);

  const replacedPrograms = replaceIdsInPrograms(
    fullData.programs,
    pkgIds,
    groupIds,
    rangeIds,
    personIds,
  );
  const programIds = await importEntity(replacedPrograms, client.addProgram);

  const replacedRules = await replaceIdsInRules(fullData.rules, programIds);
  await importEntity(replacedRules, client.addRule);

  await importUsersFirestore(fullData.users, client);
  await importTimetable(fullData.timetable, client);
}

function getDataFixes(data) {
  return {
    ...data,
    programs: data.programs ?? [],
    pkgs: data.pkgs ?? [],
    groups: data.groups ?? [],
    rules: data.rules ?? [],
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
    pkg: lookupPackage(prog, pkgIds),
    groups: lookupGroups(prog, groupIds),
    ranges: lookupRanges(prog, rangeIds),
    people: lookupPeople(prog, personIds),
  }));
}

function lookupPackage(program, pkgIds) {
  return pkgIds.get(program.pkg) ?? null;
}

function lookupGroups(program, groupIds) {
  if (!program.groups) return [];

  return program.groups.flatMap((oldId) => {
    const newId = groupIds.get(oldId);
    return newId ? [newId] : [];
  });
}

function lookupRanges(program, rangeIds) {
  if (!program.ranges) return null;

  return Object.fromEntries(
    Object.entries(program.ranges).flatMap(([oldId, val]) => {
      const newId = rangeIds.get(oldId);
      return newId ? [[newId, val]] : [];
    }),
  );
}

function lookupPeople(program, personIds) {
  if (!program.people) return [];

  return program.people.flatMap((oldPerson) => {
    if (typeof oldPerson === "string") return [oldPerson];
    else {
      const newId = personIds.get(oldPerson.person);
      return newId ? { ...oldPerson, person: newId } : [];
    }
  });
}

function replaceIdsInRules(rules, programIds) {
  return rules.flatMap((rule) => {
    var value = rule.value;
    if (
      rule.condition === "is_before_program" ||
      rule.condition === "is_after_program"
    ) {
      value = programIds.get(rule.value);

      if (!value) return [];
    }

    const program = programIds.get(rule.program);
    if (!program) return [];

    return [{ ...rule, program, value }];
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

export const testing = {
  replaceIdsInRules,
  replaceIdsInPrograms,
};

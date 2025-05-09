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
    // replace package, group, and range IDs in programs
    .then(([pkgs, groups, ranges, people]) =>
      data.programs.map((prog) => {
        return {
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
        };
      }),
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

function importPackages(pkgs, client) {
  return Promise.all([
    ...pkgs.map((pkg) =>
      client.addPackage(pkg).then(
        // create package ID replacement map
        (newPkg) => [pkg._id, newPkg._id],
      ),
    ),
  ]).then((pkgs) => new Map(pkgs));
}

function importGroups(groups, client) {
  return Promise.all([
    ...groups.map((group) =>
      client.addGroup(group).then(
        // create group ID replacement map
        (newGroup) => [group._id, newGroup._id],
      ),
    ),
  ]).then((groups) => new Map(groups));
}

function importRanges(ranges, client) {
  return Promise.all([
    ...ranges.map((range) =>
      client.addRange(range).then(
        // create range ID replacement map
        (newRange) => [range._id, newRange._id],
      ),
    ),
  ]).then((ranges) => new Map(ranges));
}

function importPeople(people, client) {
  return Promise.all([
    ...people.map((person) =>
      client.addPerson(person).then(
        // create person ID replacement map
        (newPerson) => [person._id, newPerson._id],
      ),
    ),
  ]).then((people) => new Map(people));
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

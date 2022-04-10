import Data from "./Client";

export default async function clear(table) {
  return Promise.all([
    Data.getPrograms(table),
    Data.getPackages(table),
    Data.getRules(table),
    Data.getGroups(table),
  ]).then(([programs, pkgs, rules, groups]) =>
    Promise.all([
      ...[...programs.values()].map((it) => Data.deleteProgram(table, it._id)),
      ...[...pkgs.values()].map((it) => Data.deletePackage(table, it._id)),
      ...[...rules.values()].map((it) => Data.deleteRule(table, it._id)),
      ...[...groups.values()].map((it) => Data.deleteGroup(table, it._id)),
    ])
  );
}

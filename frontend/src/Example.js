import Data from "./Client";

export default async function clear(table) {
  return Promise.all([
    Data.getPrograms(table),
    Data.getPkgs(table),
    Data.getRules(table),
  ]).then(([programs, pkgs, rules]) =>
    Promise.all([
      ...[...programs.values()].map((it) => Data.deleteProgram(table, it._id)),
      ...[...pkgs.values()].map((it) => Data.deletePkg(table, it._id)),
      ...[...rules.values()].map((it) => Data.deleteRule(table, it._id)),
    ])
  );
}

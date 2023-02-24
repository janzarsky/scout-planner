import { formatDateTime } from "./helpers/DateUtils";
import { arraysEqualWithSorting, arraysIntersect } from "./helpers/Sorting";

export function checkRules(rules, programs) {
  const violations = new Map();

  for (const rule of rules) {
    violations.set(rule._id, checkRule(rule, programs));
  }

  const overlaps = checkOverlaps(programs);
  const people = checkPeople(programs);

  return {
    violations: violations,
    other: [...overlaps, ...people],
  };
}

function checkRule(rule, programs) {
  const program = programs.find((program) => program._id === rule.program);

  if (!program)
    return { program: null, satisfied: false, msg: "Program neexistuje" };

  const success = () => {
    return { program: program._id, satisfied: true, msg: null };
  };
  const failure = (msg) => {
    return { program: program._id, satisfied: false, msg: msg };
  };

  if (rule.condition === "is_before_date")
    return program.begin + program.duration <= rule.value
      ? success()
      : failure(
          `Program by měl skončit nejpozději v ${formatDateTime(rule.value)}`
        );

  if (rule.condition === "is_after_date")
    return program.begin >= rule.value
      ? success()
      : failure(
          `Program by měl začínat nejdříve v ${formatDateTime(rule.value)}`
        );

  if (
    rule.condition === "is_before_program" ||
    rule.condition === "is_after_program"
  ) {
    const program2 = programs.find((program) => program._id === rule.value);

    if (!program2) return failure("Druhý program neexistuje");

    if (rule.condition === "is_before_program")
      return program.begin + program.duration <= program2.begin
        ? success()
        : failure(`Program by měl proběhnout před programem ${program2.title}`);

    if (rule.condition === "is_after_program")
      return program.begin >= program2.begin + program2.duration
        ? success()
        : failure(`Program by měl proběhnout po programu ${program2.title}`);
  }

  return failure("Neznámé pravidlo");
}

function checkOverlaps(programs) {
  var overlaps = [];
  const sorted = [...programs].sort((a, b) => (a.begin < b.begin ? -1 : 1));

  sorted.forEach((prog1, idx1) => {
    for (let idx2 = idx1 + 1; idx2 < sorted.length; idx2++) {
      const prog2 = sorted[idx2];

      if (prog2.begin >= prog1.begin + prog1.duration) break;

      if (prog1.groups.length === 0 || prog2.groups.length === 0) {
        overlaps.push({
          program: prog1._id,
          msg: "Více programů pro jednu skupinu",
        });
        overlaps.push({
          program: prog2._id,
          msg: "Více programů pro jednu skupinu",
        });
      } else if (
        arraysIntersect(prog1.groups, prog2.groups) &&
        (prog1.blockOrder === prog2.blockOrder ||
          !arraysEqualWithSorting(prog1.groups, prog2.groups))
      ) {
        overlaps.push({
          program: prog1._id,
          msg: "Více programů pro jednu skupinu",
        });
        overlaps.push({
          program: prog2._id,
          msg: "Více programů pro jednu skupinu",
        });
      }
    }
  });

  return overlaps;
}

function checkPeople(programs) {
  var overlaps = [];
  const sorted = [...programs].sort((a, b) => (a.begin < b.begin ? -1 : 1));

  sorted.forEach((prog1, idx1) => {
    for (let idx2 = idx1 + 1; idx2 < sorted.length; idx2++) {
      const prog2 = sorted[idx2];

      if (prog2.begin >= prog1.begin + prog1.duration) break;

      const overlap = prog1.people
        .filter((person) => prog2.people.indexOf(person) !== -1)
        .sort();

      if (overlap.length > 0) {
        overlaps.push({
          program: prog1._id,
          msg: `Jeden člověk na více programech (${overlap.join(", ")})`,
          people: overlap,
        });
        overlaps.push({
          program: prog2._id,
          msg: `Jeden člověk na více programech (${overlap.join(", ")})`,
          people: overlap,
        });
      }
    }
  });

  return overlaps;
}

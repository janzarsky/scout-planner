import { formatDateTime } from "./helpers/DateUtils";
import { arraysEqualWithSorting, arraysIntersect } from "./helpers/Sorting";

export function checkRules(rules, programs, people = []) {
  const violations = new Map();

  for (const rule of rules) {
    violations.set(rule._id, checkRule(rule, programs));
  }

  const overlaps = checkOverlaps(programs);
  const peopleOverlaps = checkPeople(programs);
  const absence = checkAbsence(programs, people);

  return {
    violations: violations,
    other: [...overlaps, ...peopleOverlaps, ...absence],
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
          `Program by měl skončit nejpozději v ${formatDateTime(rule.value)}`,
        );

  if (rule.condition === "is_after_date")
    return program.begin >= rule.value
      ? success()
      : failure(
          `Program by měl začínat nejdříve v ${formatDateTime(rule.value)}`,
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

function programsOverlap(prog1, prog2) {
  // if there are no groups, it only depends on block order
  if (prog1.groups.length === 0 && prog2.groups.length === 0)
    return prog1.blockOrder === prog2.blockOrder;

  // if only one program has no groups, it is always overlap
  if (prog1.groups.length === 0 || prog2.groups.length === 0) return true;

  if (
    arraysIntersect(prog1.groups, prog2.groups) &&
    (prog1.blockOrder === prog2.blockOrder ||
      !arraysEqualWithSorting(prog1.groups, prog2.groups))
  )
    return true;

  return false;
}

function checkOverlaps(programs) {
  var overlaps = [];
  const sorted = [...programs].sort((a, b) => (a.begin < b.begin ? -1 : 1));

  sorted.forEach((prog1, idx1) => {
    for (let idx2 = idx1 + 1; idx2 < sorted.length; idx2++) {
      const prog2 = sorted[idx2];

      if (prog2.begin >= prog1.begin + prog1.duration) break;

      if (programsOverlap(prog1, prog2)) {
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
        .filter((p1) => prog2.people.find((p2) => p2.person === p1.person))
        .map((p) => p.person);

      if (overlap.length > 0) {
        overlaps.push({
          program: prog1._id,
          people: overlap,
        });
        overlaps.push({
          program: prog2._id,
          people: overlap,
        });
      }
    }
  });

  return overlaps;
}

function intervalsOverlap(begin1, end1, begin2, end2) {
  return begin1 < end2 && begin2 < end1;
}

function isPersonAvailable(absence, begin, end) {
  return absence.reduce((acc, curr) => {
    if (intervalsOverlap(curr.begin, curr.end, begin, end)) return false;

    return acc;
  }, true);
}

function getAbsentPeople(program, allPeople) {
  return program.people.flatMap((attendance) => {
    const person = allPeople.find((p) => p._id === attendance.person);

    if (
      person &&
      person.absence &&
      person.absence.length > 0 &&
      !isPersonAvailable(
        person.absence,
        program.begin,
        program.begin + program.duration,
      )
    )
      return [person._id];

    return [];
  });
}

function checkAbsence(programs, people) {
  return programs.flatMap((program) => {
    const absentPeople = program.people ? getAbsentPeople(program, people) : [];

    if (absentPeople.length > 0)
      return [{ program: program._id, people: absentPeople }];

    return [];
  });
}

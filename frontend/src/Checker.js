/**
 * @file Function for checking rules on programs
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

import DateUtils from './DateUtils'

async function checkRules(rules, programs) {
  const violations = new Map();

  for (const [id, rule] of rules) {
    violations.set(id, checkRule(rule, programs));
  }

  const overlaps = checkOverlaps(programs);
  const people = checkPeople(programs);

  return {
    violations: violations,
    other: [...overlaps, ...people],
  };
}

function checkRule(rule, programs) {
  const program = programs.get(rule.program);

  if (!program)
    return { program: null, satisfied: false, msg: 'Program neexistuje' };

  const success = () => { return { program: program._id, satisfied: true, msg: null }; };
  const failure = msg => { return { program: program._id, satisfied: false, msg: msg }; };

  if (rule.condition === 'is_before_date')
    return (program.begin + program.duration <= rule.value) ? success() :
      failure(`Program by měl skončit nejpozději v ${DateUtils.formatDateTime(rule.value)}`);

  if (rule.condition === 'is_after_date')
    return (program.begin >= rule.value) ? success() :
      failure(`Program by měl začínat nejdříve v ${DateUtils.formatDateTime(rule.value)}`);

  if (rule.condition === 'is_before_program' || rule.condition === 'is_after_program') {
    const program2 = programs.get(rule.value);

    if (!program2)
      return failure('Druhý program neexistuje');

    if (rule.condition === 'is_before_program')
      return (program.begin + program.duration <= program2.begin) ? success() :
        failure(`Program by měl proběhnout před programem ${program2.title}`);

    if (rule.condition === 'is_after_program')
      return (program.begin >= program2.begin + program2.duration) ? success() :
        failure(`Program by měl proběhnout po programu ${program2.title}`);
  }

  return failure('Neznámé pravidlo');
}

function checkOverlaps(programs) {
  var overlaps = [];
  const sorted = [...programs.values()].sort((a, b) => (a.begin < b.begin) ? -1 : 1);

  sorted.forEach((prog1, idx1) => {
    for (let idx2 = idx1 + 1; idx2 < sorted.length; idx2++) {
      const prog2 = sorted[idx2];

      if (prog2.begin >= prog1.begin + prog1.duration)
        break;

      if (prog1.groups.length === 0 || prog2.groups.length === 0) {
        overlaps.push({ program: prog1._id, msg: 'Programy se překrývají (více programů pro jednu skupinu)'});
      }
      else if (prog1.groups.filter(group => prog2.groups.indexOf(group) !== -1).length > 0) {
        overlaps.push({ program: prog1._id, msg: 'Programy se překrývají (více programů pro jednu skupinu)'});
      }
    }
  });

  return overlaps;
}

function checkPeople(programs) {
  var overlaps = [];
  const sorted = [...programs.values()].sort((a, b) => (a.begin < b.begin) ? -1 : 1);

  sorted.forEach((prog1, idx1) => {
    for (let idx2 = idx1 + 1; idx2 < sorted.length; idx2++) {
      const prog2 = sorted[idx2];

      if (prog2.begin >= prog1.begin + prog1.duration)
        break;

      if (prog1.people.filter(person => prog2.people.indexOf(person) !== -1).length > 0) {
        overlaps.push({ program: prog1._id, msg: 'Programy se překrývají (jeden člověk na více programech)'});
      }
    }
  });

  return overlaps;
}

export default {checkRules};

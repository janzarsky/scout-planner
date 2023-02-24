export function groupProgramsToBlocks(unsortedPrograms) {
  const programs = [...unsortedPrograms].sort((a, b) =>
    a.begin < b.begin ? -1 : 1
  );
  const alreadyInBlock = new Array(programs.length).fill(false);
  const blocks = [];

  for (let i = 0; i < programs.length; i++) {
    if (alreadyInBlock[i]) continue;

    const blockPrograms = [programs[i]];
    let blockEnd = programs[i].begin + programs[i].duration;

    for (let j = i + 1; j < programs.length; j++) {
      if (programs[j].begin >= blockEnd) break;

      if (alreadyInBlock[j]) continue;

      if (arraysEqualWithSorting(programs[i].groups, programs[j].groups)) {
        blockPrograms.push(programs[j]);
        alreadyInBlock[j] = true;
        blockEnd = Math.max(blockEnd, programs[j].begin + programs[j].duration);
      }
    }

    blocks.push({
      programs: [...blockPrograms],
      begin: blockPrograms[0].begin,
      duration: blockEnd - blockPrograms[0].begin,
      groups: [...blockPrograms[0].groups],
    });
  }

  return blocks;
}

function arraysEqualWithSorting(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const aSorted = [...a].sort();
  const bSorted = [...b].sort();

  for (var i = 0; i < aSorted.length; ++i) {
    if (aSorted[i] !== bSorted[i]) return false;
  }
  return true;
}

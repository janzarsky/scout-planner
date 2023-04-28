export function getProgramRects(programs, settings) {
  const trayPrograms = programs.filter((p) => typeof p.begin !== "number");

  const dayWidth = (settings.dayEnd - settings.dayStart) / settings.timeStep;

  return trayPrograms.reduce(
    (acc, prog) => {
      const width = Math.ceil(prog.duration / settings.timeStep);
      const isOverflowing = acc.x + width > dayWidth;
      const rect = {
        x: isOverflowing ? 0 : acc.x,
        y: isOverflowing ? acc.y + 1 : acc.y,
        width,
        height: 1,
      };
      return {
        programs: [...acc.programs, [prog, rect]],
        x: acc.x + rect.width,
        y: acc.y,
      };
    },
    { programs: [], x: 4, y: 0 } // make space for "new program" button
  ).programs;
}

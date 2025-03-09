export function getTrayWidth(settings, windowWidth, timetableWidthSettings) {
  const timetableSlots =
    (settings.dayEnd - settings.dayStart) / settings.timeStep;

  if (windowWidth && timetableWidthSettings) {
    const windowSlots = Math.floor(
      windowWidth / ((timetableWidthSettings * 20) / 100),
    );

    if (timetableSlots > windowSlots) return windowSlots;
  }

  return timetableSlots;
}

export function getProgramRects(
  programs,
  timeStep,
  trayWidth,
  addButton = true,
) {
  return programs.reduce(
    (acc, prog) => {
      const width = Math.ceil(prog.duration / timeStep);
      const isOverflowing = acc.x + width > trayWidth;
      const rect = {
        x: isOverflowing ? 0 : acc.x,
        y: isOverflowing ? acc.y + 1 : acc.y,
        width,
        height: 1,
      };
      return {
        programs: [...acc.programs, [prog, rect]],
        x: rect.x + rect.width,
        y: rect.y,
      };
    },
    { programs: [], x: addButton ? 4 : 0, y: 0 }, // make space for "new program" button
  ).programs;
}

export function sortTrayPrograms(programs, packages) {
  return programs.sort((a, b) => {
    const pkgA = packages.find((pkg) => pkg._id === a.pkg);
    const pkgB = packages.find((pkg) => pkg._id === b.pkg);

    const resPkg = (pkgA && pkgA.name ? pkgA.name : "").localeCompare(
      pkgB && pkgB.name ? pkgB.name : "",
    );
    if (resPkg !== 0) return resPkg;

    return a.title.localeCompare(b.title);
  });
}

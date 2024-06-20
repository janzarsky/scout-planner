import React from "react";
import { useSelector } from "react-redux";
import { BlockDroppables, getBlockDroppablesData } from "./Droppables";
import Program from "./Program";
import { getRect, groupProgramsToBlocks } from "../helpers/TimetableUtils";
import { useMemo } from "react";
import { useGetSettingsSlice } from "../store/settingsSlice";

export function Blocks({ settings, violations, onDrop }) {
  const { programs } = useSelector((state) => state.programs);

  const data = useMemo(
    () => getBlocksData(programs, settings, violations),
    [programs, settings, violations],
  );

  return data.map((block) => (
    <Block key={block.key} rect={block.rect}>
      {block.programs.map(({ key, rect, program, violations }) => (
        <Program
          key={key}
          rect={rect}
          program={program}
          violations={violations}
        />
      ))}
      <BlockDroppables data={block.droppablesData} onDrop={onDrop} />
    </Block>
  ));
}

export function Block({ rect, children }) {
  const { table } = useSelector((state) => state.auth);
  const { data: settings, isSuccess: settingsLoaded } = useGetSettingsSlice(
    table,
    false,
  );
  // FIXME: centralize the default width
  const width = settingsLoaded ? settings.width : 100;

  return (
    <div
      className="block"
      style={{
        gridColumnStart: rect.x + 3,
        gridRowStart: rect.y + 2,
        gridColumnEnd: "span " + rect.width,
        gridRowEnd: "span " + rect.height,
        gridTemplateColumns:
          "repeat(" +
          rect.width +
          ", minmax(" +
          (width * 20) / 100 +
          "px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

function getBlocksData(programs, settings, violations) {
  const allGroups = settings.groups.map((g) => g._id);
  const programsGroupFix = programs.map((p) => ({
    ...p,
    groups: p.groups.length > 0 ? p.groups : allGroups,
  }));
  const programsNotInTray = programsGroupFix.filter(
    (p) => typeof p.begin === "number",
  );
  const blocks = groupProgramsToBlocks(programsNotInTray);

  return blocks.map((block) => {
    const blockRect = getRect(
      block.begin,
      block.duration,
      block.groups,
      settings,
    );

    const maxBlockOrder = block.programs
      .map((p) => (p.blockOrder ? p.blockOrder : 0))
      .reduce((acc, curr) => (curr > acc ? curr : acc), 0);

    const blockDroppablesData = getBlockDroppablesData(
      blockRect.width,
      maxBlockOrder + 1,
      block.programs[0].begin,
      settings.timeStep,
      block.programs[0].groups.length > 0 ? block.programs[0].groups[0] : null,
    );

    const programsData = block.programs.map((program) =>
      getProgramData(program, blockRect, settings, violations),
    );

    return {
      key: `${block.programs[0].begin}-${
        block.programs[0].duration
      }-${block.programs[0].groups.join("-")}`,
      rect: blockRect,
      programs: programsData,
      droppablesData: blockDroppablesData,
    };
  });
}

function getProgramData(prog, blockRect, settings, violations) {
  const programRect = getRect(prog.begin, prog.duration, prog.groups, settings);

  const blockOrder = prog.blockOrder ? prog.blockOrder : 0;
  const relativeRect = {
    x: programRect.x - blockRect.x,
    y: programRect.y - blockRect.y + blockOrder,
    width: programRect.width,
    height: 1,
  };

  return {
    key: prog._id,
    rect: relativeRect,
    program: prog,
    violations: violations.get(prog._id),
  };
}

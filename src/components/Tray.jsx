import React from "react";
import { useDrop } from "react-dnd";
import { useSelector } from "react-redux";
import { getProgramRects, sortTrayPrograms } from "../helpers/TrayUtils";
import { useNavigate } from "react-router-dom";
import { level } from "../helpers/Level";
import { useState } from "react";
import { Block } from "./Blocks";
import { getRect } from "../helpers/TimetableUtils";
import Program from "./Program";

export function Tray({ settings, onDroppableDrop }) {
  const { programs } = useSelector((state) => state.programs);
  const { packages } = useSelector((state) => state.packages);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) => onDroppableDrop(item, null, null, programs),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [programs],
  );

  const width = useSelector((state) => state.settings.settings.width);
  const userLevel = useSelector((state) => state.auth.userLevel);

  const trayPrograms = programs.filter((p) => typeof p.begin !== "number");
  const sortedPrograms = sortTrayPrograms(trayPrograms, packages);

  const programRects = getProgramRects(
    sortedPrograms,
    settings,
    userLevel >= level.EDIT,
  );

  const [pinned, setPinned] = useState(false);

  const navigate = useNavigate();

  return (
    <div
      className={"tray-wrapper" + (pinned ? " pinned" : "")}
      style={{
        gridTemplateColumns:
          "auto auto repeat(" +
          settings.timeSpan * settings.timeHeaders.length +
          ", minmax(" +
          (width * 20) / 100 +
          "px, 1fr))",
      }}
    >
      <div
        className="tray-header"
        style={{
          gridRowStart: settings.days.length * settings.groupCnt + 2,
        }}
        title="Odkladiště"
      >
        <div className="tray-header-icon">
          <i className="fa fa-archive" aria-hidden="true"></i>
        </div>
        <button
          className={"btn" + (pinned ? " btn-dark" : "")}
          onClick={() => setPinned(!pinned)}
          title="Připnout"
        >
          <i className="fa fa-thumb-tack" aria-hidden="true"></i>
        </button>
      </div>
      <div
        className={"tray" + (isOver ? " drag-over" : "")}
        style={{
          gridRowStart: settings.days.length * settings.groupCnt + 2,
          gridColumnEnd:
            "span " + settings.timeHeaders.length * settings.timeSpan,
        }}
      >
        <Block
          rect={getRect(
            settings.dayStart,
            settings.dayEnd - settings.dayStart,
            [],
            settings,
          )}
        >
          {userLevel >= level.EDIT && (
            <button
              ref={drop}
              className="tray-add-program"
              onClick={() =>
                navigate("add", { state: { begin: null, groupId: null } })
              }
            >
              {!isOver && (
                <i
                  className="fa fa-plus"
                  aria-hidden="true"
                  title="Nový program"
                />
              )}
            </button>
          )}
          {programRects.map(([program, rect]) => {
            return <Program key={program._id} rect={rect} program={program} />;
          })}
        </Block>
      </div>
    </div>
  );
}

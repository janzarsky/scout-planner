import React from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  getProgramRects,
  getTrayWidth,
  sortTrayPrograms,
} from "../helpers/TrayUtils";
import { useNavigate } from "react-router";
import { level } from "../helpers/Level";
import { Block } from "./Blocks";
import { getRect } from "../helpers/TimetableUtils";
import Program from "./Program";
import { useGetPackagesQuery } from "../store/packagesApi";
import { DEFAULT_WIDTH, useGetSettingsQuery } from "../store/settingsApi";
import { useGetProgramsQuery } from "../store/programsApi";
import { togglePinTray } from "../store/viewSlice";

export function Tray({ settings, onDroppableDrop }) {
  const { table } = useSelector((state) => state.auth);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);
  const { data: packages, isSuccess: packagesLoaded } =
    useGetPackagesQuery(table);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) =>
        onDroppableDrop(item, null, null, programsLoaded ? programs : []),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [programs],
  );

  const { data: timetableSettings, isSuccess: settingsLoaded } =
    useGetSettingsQuery(table);
  const width = settingsLoaded ? timetableSettings.width : DEFAULT_WIDTH;
  const userLevel = useSelector((state) => state.auth.userLevel);

  const trayPrograms = programsLoaded
    ? programs.filter((p) => typeof p.begin !== "number")
    : [];
  const sortedPrograms = sortTrayPrograms(
    trayPrograms,
    packagesLoaded ? packages : [],
  );

  const trayWidth = getTrayWidth(settings);
  const programRects = getProgramRects(
    sortedPrograms,
    settings.timeStep,
    trayWidth,
    userLevel >= level.EDIT,
  );

  const pinned = useSelector((state) => state.view.pinTray);
  const dispatch = useDispatch();

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
          onClick={() => dispatch(togglePinTray())}
          title="Připnout"
        >
          <i className="fa fa-thumb-tack" aria-hidden="true"></i>
        </button>
      </div>
      <div
        className={
          "tray" +
          (isOver ? " drag-over" : "") +
          (!isOver && canDrop ? " can-drop" : "")
        }
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
              {canDrop ? (
                <i
                  className="fa fa-arrow-down"
                  aria-hidden="true"
                  title="Přesunout na odkladiště"
                />
              ) : (
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

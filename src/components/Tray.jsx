import React, { useEffect, useRef, useState } from "react";
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
import { useConfig } from "../store/configSlice";

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

  const newTray = useConfig("newTray");
  const trayWrapperRef = useRef(null);
  const trayHeaderRef = useRef(null);

  function getTrayWrapperWidth() {
    if (trayWrapperRef.current && trayHeaderRef.current)
      return (
        trayWrapperRef.current.clientWidth - trayHeaderRef.current.offsetWidth
      );

    return null;
  }

  const [trayWrapperWidth, setTrayWrapperWidth] = useState(null);
  const [firstRender, setFirstRender] = useState(false);

  useEffect(() => {
    function handleResize() {
      setTrayWrapperWidth(getTrayWrapperWidth());
    }

    if (newTray) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (newTray && !firstRender) setFirstRender(true);
  }, [firstRender]);

  useEffect(() => {
    if (
      newTray &&
      firstRender &&
      trayWrapperRef.current &&
      trayHeaderRef.current
    ) {
      setTrayWrapperWidth(getTrayWrapperWidth());
    }
  }, [firstRender]);

  const trayWidth = newTray
    ? getTrayWidth(settings, trayWrapperWidth, width)
    : getTrayWidth(settings);
  const programRects = getProgramRects(
    sortedPrograms,
    settings.timeStep,
    trayWidth,
    userLevel >= level.EDIT,
  );

  return (
    <TrayWrapper ref={trayWrapperRef} settings={settings} width={width}>
      <TrayHeader ref={trayHeaderRef} settings={settings} />
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
            <TrayButton ref={drop} canDrop={canDrop} />
          )}
          {programRects.map(([program, rect]) => {
            return <Program key={program._id} rect={rect} program={program} />;
          })}
        </Block>
      </div>
    </TrayWrapper>
  );
}

function TrayWrapper({ children, ref, settings, width }) {
  const newTray = useConfig("newTray");
  const pinned = useSelector((state) => state.view.pinTray);

  return (
    <div
      ref={ref}
      className={
        "tray-wrapper" +
        (pinned ? " pinned" : "") +
        (newTray ? " new-tray" : "")
      }
      style={{
        gridTemplateColumns:
          "auto auto repeat(" +
          settings.timeSpan * settings.timeHeaders.length +
          ", minmax(" +
          (width * 20) / 100 +
          "px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

function TrayHeader({ ref, settings }) {
  const dispatch = useDispatch();
  const pinned = useSelector((state) => state.view.pinTray);

  return (
    <div
      ref={ref}
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
  );
}

function TrayButton({ ref, canDrop }) {
  const navigate = useNavigate();

  return (
    <button
      ref={ref}
      className="tray-add-program"
      onClick={() => navigate("add", { state: { begin: null, groupId: null } })}
    >
      {canDrop ? (
        <i
          className="fa fa-arrow-down"
          aria-hidden="true"
          title="Přesunout na odkladiště"
        />
      ) : (
        <i className="fa fa-plus" aria-hidden="true" title="Nový program" />
      )}
    </button>
  );
}

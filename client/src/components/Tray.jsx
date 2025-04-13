import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  getProgramRects,
  getTrayPrograms,
  getTrayWidth,
} from "../helpers/TrayUtils";
import { useNavigate } from "react-router";
import { level } from "@scout-planner/common/level";
import { Block } from "./Blocks";
import { getRect } from "../helpers/TimetableUtils";
import Program from "./Program";
import { useGetPackagesQuery } from "../store/packagesApi";
import { DEFAULT_WIDTH, useGetSettingsQuery } from "../store/settingsApi";
import {
  useGetProgramsQuery,
  useUpdateProgramMutation,
} from "../store/programsApi";
import { togglePinTray } from "../store/viewSlice";
import { useConfig } from "../store/configSlice";
import { firestoreClientFactory } from "../FirestoreClient";

export function Tray({ settings }) {
  const { table } = useSelector((state) => state.auth);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);
  const { data: packages, isSuccess: packagesLoaded } =
    useGetPackagesQuery(table);

  const onDroppableDrop = useTrayDrop();

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) => onDroppableDrop(item, programsLoaded ? programs : []),
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

  const trayPrograms =
    programsLoaded && packagesLoaded ? getTrayPrograms(programs, packages) : [];

  const newTray = useConfig("newTray");
  const wrapperRef = useRef(null);
  const headerRef = useRef(null);

  const trayWrapperWidth = useResizing(wrapperRef, headerRef);

  const trayWidth = newTray
    ? getTrayWidth(settings, trayWrapperWidth, width)
    : getTrayWidth(settings);
  const programRects = getProgramRects(
    trayPrograms,
    settings.timeStep,
    trayWidth,
    userLevel >= level.EDIT,
  );

  return (
    <TrayWrapper ref={wrapperRef} settings={settings} width={width}>
      <TrayHeader ref={headerRef} settings={settings} />
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

function useResizing(wrapperRef, headerRef) {
  const newTray = useConfig("newTray");
  const [firstRender, setFirstRender] = useState(false);
  const [width, setWidth] = useState(null);

  function getTrayWrapperWidth() {
    if (wrapperRef.current && headerRef.current)
      return wrapperRef.current.clientWidth - headerRef.current.offsetWidth;

    return null;
  }

  useEffect(() => {
    function handleResize() {
      setWidth(getTrayWrapperWidth());
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
    if (newTray && firstRender && wrapperRef.current && headerRef.current) {
      setWidth(getTrayWrapperWidth());
    }
  }, [firstRender]);

  return width;
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

function useTrayDrop() {
  const { table } = useSelector((state) => state.auth);

  const client = useMemo(
    () => firestoreClientFactory.getClient(table),
    [table],
  );
  const [updateProgramMutation] = useUpdateProgramMutation();

  return useCallback(
    (item, currentPrograms) => {
      var prog = currentPrograms.find((program) => program._id === item.id);

      if (prog) {
        updateProgramMutation({
          table,
          data: { ...prog, begin: null, blockOrder: 0 },
        });
      }
    },
    [client],
  );
}

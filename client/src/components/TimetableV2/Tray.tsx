import React, { useCallback } from "react";
import { DEFAULT_PROGRAM_COLOR, MIME_TYPE, Program } from "./types";
import { Button } from "react-bootstrap";
import { usePkgs } from "./hooks";
import { isColorDark } from "../../helpers/isColorDark";
import { useNavigate } from "react-router";

interface TrayProps {
  onDragOver: React.DragEventHandler<HTMLDivElement>;
  onDrop: React.DragEventHandler<HTMLDivElement>;
  notScheduledPlannables: Program[];
  setDraggingPlannable: (plannable: { id: string }) => void;
}

export function Tray({
  onDragOver,
  onDrop,
  notScheduledPlannables,
  setDraggingPlannable,
}: TrayProps) {
  const navigate = useNavigate();
  const onCreateTrayItem = useCallback(() => {
    navigate("add");
  }, [navigate]);
  const setEditingTrayItem = useCallback(
    (programId: string) => {
      navigate(`edit/${programId}`);
    },
    [navigate],
  );

  const programmeGroups = usePkgs();

  return (
    <div className="schedulePage__tray" onDragOver={onDragOver} onDrop={onDrop}>
      <div className="schedulePage_trayHeader">
        <h2 className="schedulePage_trayHeaderTitle">Odkladiště</h2>
        <Button onClick={onCreateTrayItem} variant="outline-primary" size="sm">
          <i className="fa fa-plus"></i>
        </Button>
      </div>
      {notScheduledPlannables.map((plannable) => {
        const color =
          (plannable.pkg
            ? programmeGroups.find((it) => it._id === plannable.pkg)?.color
            : null) ?? DEFAULT_PROGRAM_COLOR;
        const isDark = color !== null ? isColorDark(color) : false;
        return (
          <div
            key={plannable._id}
            className={[
              "schedulePage__traySegment",
              isDark && "schedulePage__traySegment--dark",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                "--segment-color": color,
              } as any
            }
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData(MIME_TYPE, plannable._id as string);
              e.dataTransfer.effectAllowed = "move";
              setDraggingPlannable({ id: plannable._id });
            }}
            onClick={() => {
              setEditingTrayItem(plannable._id);
            }}
          >
            {plannable.title}
          </div>
        );
      })}
    </div>
  );
}

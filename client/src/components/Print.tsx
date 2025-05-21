import React from "react";
import { Violations } from "./TimetableV2/types";
import { useConfig } from "../store/configSlice";
import { PrintWrapper as OldPrint } from "./PrintOptions";
import { NewPrint } from "./Print/NewPrint";

export const Print: React.FC<{
  violationsPerProgram: Violations;
  userLevel: any;
  dataLoaded: boolean;
  permissionsLoaded: boolean;
}> = ({ violationsPerProgram, userLevel, dataLoaded, permissionsLoaded }) => {
  const newPrint = useConfig("newPrint");
  const Component = newPrint ? NewPrint : OldPrint;

  return (
    <Component
      violationsPerProgram={violationsPerProgram}
      userLevel={userLevel}
      dataLoaded={dataLoaded}
      permissionsLoaded={permissionsLoaded}
    />
  );
};

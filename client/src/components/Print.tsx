import React from "react";
import { Violations } from "./TimetableV2/types";
import { NewPrint } from "./Print/NewPrint";

export const Print: React.FC<{
  violationsPerProgram: Violations;
  userLevel: any;
  dataLoaded: boolean;
  permissionsLoaded: boolean;
}> = ({ violationsPerProgram, userLevel, dataLoaded, permissionsLoaded }) => {
  return (
    <NewPrint
      violationsPerProgram={violationsPerProgram}
      userLevel={userLevel}
      dataLoaded={dataLoaded}
      permissionsLoaded={permissionsLoaded}
    />
  );
};

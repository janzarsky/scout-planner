import React from "react";
import { Violations } from "../../TimetableV2/types";

export type OptionsComponent<T> = React.ComponentType<{
  options: T;
  setOptions: (options: T | ((prevOptions: T) => T)) => void;
}>;

export type PrintComponent<T> = React.ComponentType<{
  violationsPerProgram: Violations;
  options: T;
}>;

export interface PrintLayout<T, TV extends T = T> {
  label: string;
  initialOptions: T;
  OptionsComponent: OptionsComponent<T>;
  validateOptions: (options: T) => options is TV;
  PrintComponent: PrintComponent<TV>;
}

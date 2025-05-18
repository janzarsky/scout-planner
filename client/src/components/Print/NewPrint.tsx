import React from "react";
import { useRef, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import { Violations } from "../TimetableV2/types";
import { level } from "@scout-planner/common/level";
import { getPageSizeCss, PageSizeSelector, PageSizeKey } from "./pageSize";
import { layouts, OptionsComponent, PrintComponent } from "./layouts";

type LayoutOptions = {
  [T in keyof typeof layouts]: (typeof layouts)[T]["initialOptions"];
};

export const NewPrint: React.FC<{
  violationsPerProgram: Violations;
  userLevel: any;
  dataLoaded: boolean;
  permissionsLoaded: boolean;
}> = ({ violationsPerProgram, userLevel, dataLoaded, permissionsLoaded }) => {
  const [layout, setLayout] = useState(
    () => Object.keys(layouts)[0] as keyof typeof layouts,
  );
  const [pageSize, setPageSize] = useState<PageSizeKey>("a4");
  const [layoutOption, setLayoutOption] = useState<LayoutOptions>(() => {
    return Object.fromEntries(
      Object.entries(layouts).map(([key, value]) => [
        key,
        value.initialOptions,
      ]),
    ) as LayoutOptions;
  });

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  if (!dataLoaded || !permissionsLoaded) {
    return <div>Načítání&hellip;</div>;
  }

  if (userLevel < level.VIEW) {
    return <div>Nemáte oprávnění pro tisk.</div>;
  }

  const OptionsComponent: OptionsComponent<any> =
    layouts[layout].OptionsComponent;
  const validateOptions = layouts[layout].validateOptions as (
    options: any,
  ) => boolean;
  const optionsValid = validateOptions(layoutOption[layout] as any);
  const PrintComponent: PrintComponent<any> = layouts[layout].PrintComponent;

  return (
    <>
      <Container fluid>
        <h2 className="mt-3">Tisk</h2>

        <div className="mb-3">
          <label htmlFor="layout">Rozložení:</label>
          <div className="d-flex flex-row gap-3 flex-wrap">
            {Object.entries(layouts).map(([key, layoutOption]) => (
              <div key={key} className="form-check">
                <input
                  type="radio"
                  id={key}
                  name="layout"
                  value={key}
                  className="form-check-input"
                  checked={layout === key}
                  onChange={() => setLayout(key as keyof typeof layouts)}
                />
                <label htmlFor={key} className="form-check-label">
                  {layoutOption.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <PageSizeSelector
          selectedPageSize={pageSize}
          setSelectedPageSize={setPageSize}
        />

        <OptionsComponent
          options={layoutOption[layout]}
          setOptions={(newOptions: any) => {
            setLayoutOption((prevOptions) => ({
              ...prevOptions,
              [layout]:
                typeof newOptions === "function"
                  ? newOptions(prevOptions[layout])
                  : newOptions,
            }));
          }}
        />

        <Button
          variant="primary"
          onClick={() => {
            handlePrint();
          }}
          disabled={!optionsValid}
        >
          Tisknout
        </Button>
        {optionsValid && (
          <div ref={componentRef} className="newPrint__print">
            <style>{getPageSizeCss(pageSize)}</style>
            <PrintComponent
              violationsPerProgram={violationsPerProgram}
              options={layoutOption[layout]}
            />
          </div>
        )}
      </Container>
    </>
  );
};

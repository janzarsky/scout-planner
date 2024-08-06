import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonToolbar, Container } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import { TimetableWrapper } from "./App";

export function PrintOptions({ printCallback }) {
  const presets = {
    a4: { text: "A4" },
    a4landscape: { text: "A4 (na šířku)" },
    a3: { text: "A3" },
    a3landscape: { text: "A3 (na šířku)" },
    a2: { text: "A2" },
  };

  return (
    <Container fluid>
      <h2 className="mt-3">Tisk</h2>
      <ButtonToolbar>
        {Object.entries(presets).map(([id, { text }]) => (
          <Button
            key={id}
            onClick={() => printCallback(id)}
            className="me-2 mb-2"
          >
            <i className="fa fa-print"></i> {text}
          </Button>
        ))}
      </ButtonToolbar>
    </Container>
  );
}

export function PrintCss({ preset = "default" }) {
  const presets = {
    a4: { pageSize: "a4", fontSize: "6pt", margin: "6mm" },
    a4landscape: { pageSize: "a4 landscape", fontSize: "6pt", margin: "6mm" },
    a3: { pageSize: "a3", fontSize: "9pt", margin: "10mm" },
    a3landscape: { pageSize: "a3 landscape", fontSize: "9pt", margin: "10mm" },
    a2: { pageSize: "420mm 594mm", fontSize: "11pt", margin: "10mm" },
    default: { pageSize: "800mm 1108mm", fontSize: "12pt", margin: "10mm" },
  };

  return (
    <style>
      {`@page{ size: ${presets[preset].pageSize}; margin: ${presets[preset].margin}; }` +
        `@media print{ html{ font-size: ${presets[preset].fontSize}; }}`}
    </style>
  );
}

export function PrintWrapper({
  dataLoaded,
  permissionsLoaded,
  violationsPerProgram,
  userLevel,
}) {
  const componentRef = useRef();
  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  const [preset, setPreset] = useState(null);

  useEffect(() => {
    if (preset && dataLoaded && permissionsLoaded) handlePrint(preset);
  }, [preset, dataLoaded, permissionsLoaded]);

  return (
    <>
      <div ref={componentRef} className="print-preview">
        <PrintCss preset={preset ? preset : "default"} />
        <TimetableWrapper
          dataLoaded={dataLoaded}
          permissionsLoaded={permissionsLoaded}
          violationsPerProgram={violationsPerProgram}
          userLevel={userLevel}
          printView={true}
        />
      </div>
      <PrintOptions printCallback={(preset) => setPreset(preset)} />
    </>
  );
}

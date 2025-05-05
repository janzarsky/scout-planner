import React from "react";

interface PageSize {
  pageSize: string;
  fontSize: string;
  margin: string;
  label: string;
}

const pageSizes = {
  a4: { pageSize: "a4", fontSize: "6pt", margin: "6mm", label: "A4" },
  a4landscape: {
    pageSize: "a4 landscape",
    fontSize: "6pt",
    margin: "6mm",
    label: "A4 (na šířku)",
  },
  a3: { pageSize: "a3", fontSize: "9pt", margin: "10mm", label: "A3" },
  a3landscape: {
    pageSize: "a3 landscape",
    fontSize: "9pt",
    margin: "10mm",
    label: "A3 (na šířku)",
  },
  a2: {
    pageSize: "420mm 594mm",
    fontSize: "11pt",
    margin: "10mm",
    label: "A2",
  },
  a1: {
    pageSize: "594mm 841mm",
    fontSize: "12pt",
    margin: "10mm",
    label: "A1",
  },
  a0: {
    pageSize: "841mm 1189mm",
    fontSize: "12pt",
    margin: "10mm",
    label: "A0",
  },
} as const;

export type PageSizeKey = keyof typeof pageSizes;

export function getPageSizeCss(size: PageSizeKey) {
  const pageSize = pageSizes[size];
  return (
    `@page{ size: ${pageSize.pageSize}; margin: ${pageSize.margin}; }` +
    `@media print{ html{ font-size: ${pageSize.fontSize}; }}`
  );
}

export const PageSizeSelector: React.FC<{
  selectedPageSize: PageSizeKey;
  setSelectedPageSize: (size: PageSizeKey) => void;
}> = ({ selectedPageSize, setSelectedPageSize }) => {
  const handlePageSizeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSize = event.target.value as PageSizeKey;
      setSelectedPageSize(newSize);
    },
    [setSelectedPageSize],
  );

  return (
    <div className="mb-3">
      <label>Velikost stránky:</label>
      <div className="d-flex flex-row gap-3 flex-wrap">
        {Object.entries(pageSizes).map(([key, value]) => (
          <div key={key} className="form-check">
            <input
              type="radio"
              id={key}
              name="pageSize"
              value={key}
              className="form-check-input"
              checked={selectedPageSize === key}
              onChange={handlePageSizeChange}
            />
            <label htmlFor={key} className="form-check-label">
              {value.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

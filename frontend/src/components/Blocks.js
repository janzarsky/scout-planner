import { useSelector } from "react-redux";
import { BlockDroppables } from "./Droppables";
import Program from "./Program";

export function Blocks({ data, onDrop }) {
  return data.map((block) => (
    <Block key={block.key} rect={block.rect}>
      {block.programs.map(({ key, rect, program, violations }) => (
        <Program
          key={key}
          rect={rect}
          program={program}
          violations={violations}
        />
      ))}
      <BlockDroppables data={block.droppablesData} onDrop={onDrop} />
    </Block>
  ));
}

export function Block({ rect, children }) {
  const width = useSelector((state) => state.settings.settings.width);

  return (
    <div
      className="block"
      style={{
        gridColumnStart: rect.x + 3,
        gridRowStart: rect.y + 2,
        gridColumnEnd: "span " + rect.width,
        gridRowEnd: "span " + rect.height,
        gridTemplateColumns:
          "repeat(" +
          rect.width +
          ", minmax(" +
          (width * 20) / 100 +
          "px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

export default function TimeIndicator({ x, y, height }) {
  return (
    <div
      className="timeindicator"
      style={{
        gridColumnStart: x + 3,
        gridRowStart: y + 2,
        gridRowEnd: "span " + height,
      }}
    ></div>
  );
}

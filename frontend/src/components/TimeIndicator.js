export default function TimeIndicator(props) {
  return (
    <div
      className="timeindicator"
      style={{
        gridColumnStart: props.rect.x + 3,
        gridRowStart: props.rect.y + 2,
        gridColumnEnd: "span " + props.rect.width,
        gridRowEnd: "span " + props.rect.height,
      }}
    ></div>
  );
}

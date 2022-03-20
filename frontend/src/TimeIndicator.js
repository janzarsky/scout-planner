import React from "react";

class TimeIndicator extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className="timeindicator"
        style={{
          gridColumnStart: this.props.rect.x + 3,
          gridRowStart: this.props.rect.y + 2,
          gridColumnEnd: "span " + this.props.rect.width,
          gridRowEnd: "span " + this.props.rect.height,
        }}
      ></div>
    );
  }
}

export default TimeIndicator;

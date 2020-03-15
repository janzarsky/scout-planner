import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragged: false,
      modal: false,
    };
  }

  render() {
    if (this.props.rect.x < 0 || this.props.rect.y < 0)
      return null;

    const program = this.props.program;
    return (
      <div
        className={'timetable-program-wrapper'
                   + (this.state.dragged ? ' dragged' : '')}
        style={{
          gridColumnStart: this.props.rect.x + 2,
          gridRowStart: this.props.rect.y + 2,
          gridColumnEnd: 'span ' + this.props.rect.width,
          gridRowEnd: 'span ' + this.props.rect.height,
        }}
        draggable
        onDragStart={(e) => this.onDragStart(e)}
        onDragEnd={(e) => this.onDragEnd(e)}
      >
        {(this.state.modal) ? this.getModal() : ''}
        <div className="timetable-program">
          <div className="program-text">
            <h3>{program.title}</h3>
            <p className="program-package">
              {this.props.pkgs[program.pkg]}
            </p>
            <p className="program-people">
              {program.people.map((p) => this.props.people[p]).join(', ')}
            </p>
            <p className="program-time">
              {new Date(program.begin).getUTCHours()}:
              {new Date(program.begin).getUTCMinutes().toString().padStart(2, 0)}&ndash;
              {new Date(program.begin + program.duration).getUTCHours()}:
              {new Date(program.begin + program.duration).getUTCMinutes().toString().padStart(2, 0)}
            </p>
          </div>
        </div>
        <div
          className="program-modal"
          onClick={(_) => this.setState({modal: true}) }
        >
          <i className="fa fa-info-circle"></i>
        </div>
      </div>
    );
  }

  getModal() {
    const handleClose = () => this.setState({modal: false});
    return (
      <Modal show={true} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {JSON.stringify(this.props.program)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Uložit
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  onDragStart(e) {
    this.props.onDragStart(this.props.program._id);
    this.setState({ dragged: true });
  }

  onDragEnd(e) {
    e.preventDefault();
    this.setState({ dragged: false });
  }
}

export default Program;

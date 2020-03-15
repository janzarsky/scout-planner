import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

class EditProgramModal extends React.Component {
  constructor(props) {
    super(props);
    ['title', 'date', 'time', 'duration'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const begin = new Date(this.props.program.begin);
    const date = begin.getUTCDate() + '.' + (begin.getUTCMonth() + 1) + '.' + begin.getUTCFullYear();
    const time = begin.getUTCHours() + ':' + ((begin.getUTCMinutes() < 10) ? '0' : '') + begin.getUTCMinutes();
    const dur = this.props.program.duration;
    const duration = Math.floor(dur/(1000*60*60)) + ':' + ((dur % (1000*60) < 10) ? '0' : '') + dur % (1000*60);

    return (
      <Modal show={true} onHide={this.props.handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Upravit program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Název</Form.Label>
              <Form.Control type="text" defaultValue={this.props.program.title} ref={this.title} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Začátek</Form.Label>
              <Form.Control type="text" defaultValue={date} ref={this.date} placeholder="YYYY-MM-DD" />
              <Form.Control type="text" defaultValue={time} ref={this.time} placeholder="MM:HH" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Délka</Form.Label>
              <Form.Control type="text" defaultValue={duration} ref={this.duration} placeholder="MM:HH" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={this.props.handleClose}>
              Zrušit
            </Button>
            <Button variant="primary" type="submit">
              Uložit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    const dateVals = this.date.current.value.split('.');
    const date = Date.UTC(parseInt(dateVals[2], 10), parseInt(dateVals[1], 10) - 1, parseInt(dateVals[0], 10));
    const timeVals = this.time.current.value.split(':');
    const time = Date.UTC(1970, 0, 1, parseInt(timeVals[0], 10), parseInt(timeVals[1], 10));
    const durVals = this.duration.current.value.split(':');
    const duration = (parseInt(durVals[0], 10)*60 + parseInt(durVals[1], 10))*60*1000;

    let program = this.props.program;
    program.begin = date + time;
    program.duration = duration;
    program.title = this.title.current.value;
    this.props.updateProgram(program);

    this.props.handleClose();
  }
}

export default EditProgramModal;

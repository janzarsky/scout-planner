import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addProgram: false,
    };
    ['title', 'date', 'time', 'duration'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <div className="control-panel">
        <Button
          variant="primary"
          onClick={(_) => this.addProgram()}
        >
          Přidat
        </Button>
        {(this.state.addProgram) ? this.getAddProgram() : ''}
      </div>
    );
  }

  getAddProgram() {
    const handleClose = () => this.setState({addProgram: false});
    return (
      <Modal show={true} onHide={handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Název</Form.Label>
              <Form.Control type="text" ref={this.title} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Začátek</Form.Label>
              <Form.Control type="text" ref={this.date} placeholder="YYYY-MM-DD" />
              <Form.Control type="text" ref={this.time} placeholder="MM:HH" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Délka</Form.Label>
              <Form.Control type="text" ref={this.duration} placeholder="MM:HH" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={handleClose}>
              Zrušit
            </Button>
            <Button variant="primary" type="submit">
              Přidat
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    fetch('http://localhost:4000/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        begin: Date.parse(this.date.current.value + 'T' + this.time.current.value + ':00.000+00:00'),
        duration: Date.parse('1970-01-01T' + this.duration.current.value + ':00.000+00:00'),
        title: this.title.current.value,
      }),
    });

    this.setState({addProgram: false});
  }

  addProgram() {
    this.setState({addProgram: true});
  }
}

export default ControlPanel;

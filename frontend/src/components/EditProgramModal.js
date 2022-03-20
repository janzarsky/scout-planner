/**
 * @file Modal for program editing
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {
  formatDate,
  formatDuration,
  formatTime,
  parseDate,
  parseDuration,
  parseTime,
} from "../helpers/DateUtils";

export default class EditProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: this.props.program.groups,
      people: this.props.program.people,
    };
    [
      "title",
      "date",
      "time",
      "duration",
      "pkg",
      "groups",
      "people",
      "url",
      "notes",
    ].forEach((field) => (this[field] = React.createRef()));
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  render() {
    const date = formatDate(this.props.program.begin);
    const time = formatTime(this.props.program.begin);
    const duration = formatDuration(this.props.program.duration);

    const url = this.props.program.url;
    const notes = this.props.program.notes;

    const setDuration = (duration) => {
      this.duration.current.value = duration;
    };

    return (
      <Modal show={true} onHide={this.props.handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Upravit program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Název
              </Form.Label>
              <Col>
                <Form.Control
                  type="text"
                  defaultValue={this.props.program.title}
                  ref={this.title}
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Začátek
              </Form.Label>
              <Col>
                <Form.Control
                  type="text"
                  defaultValue={time}
                  ref={this.time}
                  placeholder="MM:HH"
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  defaultValue={date}
                  ref={this.date}
                  placeholder="YYYY-MM-DD"
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Délka
              </Form.Label>
              <Col>
                <Form.Control
                  type="text"
                  defaultValue={duration}
                  ref={this.duration}
                  placeholder="MM:HH"
                />
              </Col>
            </Form.Group>
            <Form.Group>
              {[
                ["0:15", "15 min"],
                ["0:30", "30 min"],
                ["0:45", "45 min"],
                ["1:00", "1 hod"],
                ["1:30", "1,5 hod"],
                ["2:00", "2 hod"],
              ].map(([value, text]) => (
                <Button
                  variant={"outline-secondary"}
                  key={value}
                  onClick={() => setDuration(value)}
                >
                  {text}
                </Button>
              ))}
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Balíček
              </Form.Label>
              <Col>
                <Form.Control
                  as="select"
                  defaultValue={this.props.program.pkg}
                  ref={this.pkg}
                >
                  <option>žádný</option>
                  {[...this.props.pkgs.entries()].map(([key, pkg]) => (
                    <option key={key} value={key}>
                      {pkg.name}
                    </option>
                  ))}
                </Form.Control>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Skupiny
              </Form.Label>
              <Col>
                <Row>
                  {[...this.props.groups.entries()].map(([key, { name }]) => (
                    <Col>
                      <Form.Check
                        type="checkbox"
                        label={name}
                        key={key}
                        defaultChecked={this.state.groups.includes(key)}
                        onClick={(e) => {
                          if (e.target.checked) {
                            this.setState((prev) => ({
                              ...prev,
                              groups: [...prev.groups, key],
                            }));
                          } else {
                            this.setState((prev) => ({
                              ...prev,
                              groups: prev.groups.filter((g) => g !== key),
                            }));
                          }
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Lidi
              </Form.Label>
              <Col>
                <Row>
                  {[
                    ...new Set([...this.props.people, ...this.state.people]),
                  ].map((person) => (
                    <Col>
                      <Form.Check
                        type="checkbox"
                        label={person}
                        key={person}
                        defaultChecked={this.state.people.includes(person)}
                        onClick={(e) => {
                          if (e.target.checked) {
                            this.setState((prev) => ({
                              ...prev,
                              people: [...prev.people, person],
                            }));
                          } else {
                            this.setState((prev) => ({
                              ...prev,
                              people: prev.people.filter((g) => g !== person),
                            }));
                          }
                        }}
                      />
                    </Col>
                  ))}
                </Row>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    const name = window.prompt("Jméno");
                    if (name) {
                      this.setState((prev) => ({
                        ...prev,
                        people: [...prev.people, name],
                      }));
                    }
                  }}
                >
                  Další člověk
                </Button>
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                URL
              </Form.Label>
              <Col>
                <Form.Control type="text" defaultValue={url} ref={this.url} />
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm="2">
                Poznámky
              </Form.Label>
              <Col>
                <Form.Control
                  as="textarea"
                  defaultValue={notes}
                  ref={this.notes}
                />
              </Col>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="link text-danger"
              onClick={this.handleDelete}
              style={{ marginRight: "auto" }}
            >
              Smazat
            </Button>
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

  handleDelete(event) {
    event.preventDefault();
    this.props.deleteProgram(this.props.program._id);
    this.props.handleClose();
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.updateProgram({
      ...this.props.program,
      begin:
        parseDate(this.date.current.value) + parseTime(this.time.current.value),
      duration: parseDuration(this.duration.current.value),
      title: this.title.current.value,
      pkg: this.pkg.current.value,
      groups: this.state.groups,
      people: this.state.people,
      url: this.url.current.value,
      notes: this.notes.current.value,
    });

    this.props.handleClose();
  }
}

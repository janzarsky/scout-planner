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

export class EditProgramModal extends React.Component {
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
    return (
      <Modal show={true} onHide={this.props.handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Upravit program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProgramTitle
              title={this.props.program.title}
              controlRef={this.title}
            />
            <ProgramBeginning
              begin={this.props.program.begin}
              timeRef={this.time}
              dateRef={this.date}
            />
            <ProgramDuration
              duration={this.props.program.duration}
              controlRef={this.duration}
              setDuration={(duration) =>
                (this.duration.current.value = duration)
              }
            />
            <ProgramPackage
              package={this.props.program.package}
              packages={this.props.pkgs}
              controlRef={this.pkg}
            />
            <ProgramGroups
              programGroups={this.state.groups}
              allGroups={this.props.groups}
              addGroup={(group) =>
                this.setState((prev) => ({
                  ...prev,
                  groups: [...prev.groups, group],
                }))
              }
              removeGroup={(group) =>
                this.setState((prev) => ({
                  ...prev,
                  groups: prev.groups.filter((g) => g !== group),
                }))
              }
            />
            <ProgramPeople
              programPeople={this.state.people}
              allPeople={this.props.people}
              addPerson={(person) =>
                this.setState((prev) => ({
                  ...prev,
                  people: [...prev.people, person],
                }))
              }
              removePerson={(person) =>
                this.setState((prev) => ({
                  ...prev,
                  people: prev.people.filter((p) => p !== person),
                }))
              }
            />
            <ProgramUrl url={this.props.program.url} controlRef={this.url} />
            <ProgramNotes
              notes={this.props.program.notes}
              controlRef={this.notes}
            />
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

function ProgramTitle(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Název
      </Form.Label>
      <Col>
        <Form.Control
          type="text"
          defaultValue={props.title}
          ref={props.controlRef}
        />
      </Col>
    </Form.Group>
  );
}

function ProgramBeginning(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Začátek
      </Form.Label>
      <Col>
        <Form.Control
          type="text"
          defaultValue={formatTime(props.begin)}
          ref={props.timeRef}
          placeholder="MM:HH"
        />
      </Col>
      <Col>
        <Form.Control
          type="text"
          defaultValue={formatDate(props.begin)}
          ref={props.dateRef}
          placeholder="YYYY-MM-DD"
        />
      </Col>
    </Form.Group>
  );
}

function ProgramDuration(props) {
  return (
    <>
      <Form.Group as={Row}>
        <Form.Label column sm="2">
          Délka
        </Form.Label>
        <Col>
          <Form.Control
            type="text"
            defaultValue={formatDuration(props.duration)}
            ref={props.controlRef}
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
            onClick={() => props.setDuration(value)}
          >
            {text}
          </Button>
        ))}
      </Form.Group>
    </>
  );
}

function ProgramPackage(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Balíček
      </Form.Label>
      <Col>
        <Form.Control
          as="select"
          defaultValue={props.package}
          ref={props.controlRef}
        >
          <option>žádný</option>
          {[...props.packages.entries()]
            .sort(([, pkg1], [, pkg2]) => pkg1.name.localeCompare(pkg2.name))
            .map(([key, pkg]) => (
              <option key={key} value={key}>
                {pkg.name}
              </option>
            ))}
        </Form.Control>
      </Col>
    </Form.Group>
  );
}

function ProgramGroups(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Skupiny
      </Form.Label>
      <Col>
        <Row>
          {[...props.allGroups.entries()]
            .sort(([, a], [, b]) => {
              if (a.order < b.order) return -1;
              if (a.order > b.order) return 1;
              return 0;
            })
            .map(([key, { name }]) => (
              <Col key={key}>
                <Form.Check
                  type="checkbox"
                  label={name}
                  id={key}
                  defaultChecked={props.programGroups.includes(key)}
                  onClick={(e) => {
                    if (e.target.checked) {
                      props.addGroup(key);
                    } else {
                      props.removeGroup(key);
                    }
                  }}
                />
              </Col>
            ))}
        </Row>
      </Col>
    </Form.Group>
  );
}

function ProgramPeople(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Lidi
      </Form.Label>
      <Col>
        <Row>
          {[...new Set([...props.allPeople, ...props.programPeople])].map(
            (person) => (
              <Col key={person}>
                <Form.Check
                  type="checkbox"
                  label={person}
                  id={person}
                  defaultChecked={props.programPeople.includes(person)}
                  onClick={(e) => {
                    if (e.target.checked) {
                      props.addPerson(person);
                    } else {
                      props.removePerson(person);
                    }
                  }}
                />
              </Col>
            )
          )}
        </Row>
        <Button
          variant="outline-secondary"
          onClick={() => {
            const name = window.prompt("Jméno");
            if (name) {
              props.addPerson(name);
            }
          }}
        >
          Další člověk
        </Button>
      </Col>
    </Form.Group>
  );
}

function ProgramUrl(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        URL
      </Form.Label>
      <Col>
        <Form.Control
          type="text"
          defaultValue={props.url}
          ref={props.controlRef}
        />
      </Col>
    </Form.Group>
  );
}

function ProgramNotes(props) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Poznámky
      </Form.Label>
      <Col>
        <Form.Control
          as="textarea"
          defaultValue={props.notes}
          ref={props.controlRef}
        />
      </Col>
    </Form.Group>
  );
}

export class AddProgramModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { groups: [], people: [] };
    [
      "title",
      "date",
      "time",
      "duration",
      "pkg",
      "people",
      "url",
      "notes",
    ].forEach((field) => (this[field] = React.createRef()));
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <Modal show={true} onHide={this.props.handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Nový program</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProgramTitle title="Nový program" controlRef={this.title} />
            <ProgramBeginning
              begin={this.props.options.begin}
              timeRef={this.time}
              dateRef={this.date}
            />
            <ProgramDuration
              duration={60 * 60 * 1000}
              controlRef={this.duration}
              setDuration={(duration) =>
                (this.duration.current.value = duration)
              }
            />
            <ProgramPackage packages={this.props.pkgs} controlRef={this.pkg} />
            <ProgramGroups
              programGroups={this.state.groups}
              allGroups={this.props.groups}
              addGroup={(group) =>
                this.setState((prev) => ({
                  ...prev,
                  groups: [...prev.groups, group],
                }))
              }
              removeGroup={(group) =>
                this.setState((prev) => ({
                  ...prev,
                  groups: prev.groups.filter((g) => g !== group),
                }))
              }
            />
            <ProgramPeople
              programPeople={this.state.people}
              allPeople={this.props.people}
              addPerson={(person) =>
                this.setState((prev) => ({
                  ...prev,
                  people: [...prev.people, person],
                }))
              }
              removePerson={(person) =>
                this.setState((prev) => ({
                  ...prev,
                  people: prev.people.filter((p) => p !== person),
                }))
              }
            />
            <ProgramUrl url={this.props.program.url} controlRef={this.url} />
            <ProgramNotes
              notes={this.props.program.notes}
              controlRef={this.notes}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={this.props.handleClose}>
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

    this.props.addProgram({
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

import { useState } from "react";
import { useSelector } from "react-redux";
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
import { level } from "../helpers/Level";
import { byName } from "../helpers/Sorting";

export function EditProgramModal(props) {
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const [title, setTitle] = useState(props.program.title);
  const [date, setDate] = useState(formatDate(props.program.begin));
  const [time, setTime] = useState(formatTime(props.program.begin));
  const [duration, setDuration] = useState(
    formatDuration(props.program.duration)
  );
  const [pkg, setPkg] = useState(props.program.pkg);
  const [groups, setGroups] = useState(props.program.groups);
  const [people, setPeople] = useState(props.program.people);
  const [url, setUrl] = useState(props.program.url);
  const [notes, setNotes] = useState(props.program.notes);
  const [locked, setLocked] = useState(props.program.locked);
  const [ranges, setRanges] = useState(props.program.ranges);

  function handleDelete(event) {
    event.preventDefault();

    setDeleteInProgress(true);

    props.deleteProgram(props.program).then(() => {
      setDeleteInProgress(false);
      props.handleClose();
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitInProgress(true);

    props
      .updateProgram({
        ...props.program,
        begin: parseDate(date) + parseTime(time),
        duration: parseDuration(duration),
        title: title,
        pkg: pkg,
        groups: groups,
        people: people,
        ranges: ranges,
        url: url,
        notes: notes,
        locked: locked,
      })
      .then(() => {
        setSubmitInProgress(false);
        props.handleClose();
      });
  }

  return (
    <Modal show={true} onHide={props.handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {props.userLevel >= level.EDIT ? "Upravit program" : "Program"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgramTitle
            title={title}
            setTitle={setTitle}
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramBeginning
            time={time}
            setTime={setTime}
            date={date}
            setDate={setDate}
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramDuration
            duration={duration}
            setDuration={setDuration}
            locked={locked}
            setLocked={setLocked}
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramPackage
            pkg={pkg}
            setPkg={setPkg}
            packages={props.pkgs}
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramGroups
            programGroups={groups}
            addGroup={(group) => setGroups([...groups, group])}
            removeGroup={(group) =>
              setGroups(groups.filter((g) => g !== group))
            }
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramPeople
            programPeople={people}
            allPeople={props.people}
            addPerson={(person) => setPeople([...people, person])}
            removePerson={(person) =>
              setPeople(people.filter((p) => p !== person))
            }
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramUrl
            url={url}
            setUrl={setUrl}
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramRanges
            programRanges={ranges}
            updateRange={(id, val) => setRanges({ ...ranges, [id]: val })}
            disabled={props.userLevel < level.EDIT}
          />
          <ProgramNotes
            notes={notes}
            setNotes={setNotes}
            disabled={props.userLevel < level.EDIT}
          />
        </Modal.Body>
        <Modal.Footer>
          {props.userLevel >= level.EDIT && (
            <Button
              variant="link text-danger"
              onClick={handleDelete}
              style={{ marginRight: "auto" }}
            >
              {deleteInProgress ? (
                <i className="fa fa-spinner fa-pulse" />
              ) : (
                <i className="fa fa-trash" />
              )}
              &nbsp; Smazat
            </Button>
          )}
          <Button variant="link" onClick={props.handleClose}>
            {props.userLevel >= level.EDIT ? "Zrušit" : "Zavřít"}
          </Button>
          {props.userLevel >= level.EDIT && (
            <Button variant="primary" type="submit">
              {submitInProgress ? (
                <i className="fa fa-spinner fa-pulse" />
              ) : (
                <i className="fa fa-save" />
              )}
              &nbsp; Uložit
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function ProgramTitle({ title, setTitle, disabled = false }) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Název
      </Form.Label>
      <Col>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
        />
      </Col>
    </Form.Group>
  );
}

function ProgramBeginning({ time, setTime, date, setDate, disabled = false }) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Začátek
      </Form.Label>
      <Col>
        <Form.Control
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="MM:HH"
          disabled={disabled}
        />
      </Col>
      <Col>
        <Form.Control
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="YYYY-MM-DD"
          disabled={disabled}
        />
      </Col>
    </Form.Group>
  );
}

function ProgramDuration({
  duration,
  setDuration,
  locked,
  setLocked,
  disabled = false,
}) {
  return (
    <>
      <Form.Group as={Row}>
        <Form.Label column sm="2">
          Délka
        </Form.Label>
        <Col>
          <Form.Control
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="MM:HH"
            disabled={disabled}
          />
        </Col>
        <Col>
          <Form.Check
            type="checkbox"
            label="Zamknout"
            checked={locked}
            onChange={(e) => setLocked(e.target.checked)}
            id="locked"
            disabled={disabled}
          />
        </Col>
      </Form.Group>
      {!disabled && (
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
      )}
    </>
  );
}

function ProgramPackage({ pkg, setPkg, packages, disabled = false }) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Balíček
      </Form.Label>
      <Col>
        <Form.Control
          as="select"
          value={pkg}
          onChange={(e) => setPkg(e.target.value)}
          disabled={disabled}
        >
          <option>žádný</option>
          {[...packages].sort(byName).map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </Form.Control>
      </Col>
    </Form.Group>
  );
}

function ProgramGroups({
  programGroups,
  addGroup,
  removeGroup,
  disabled = false,
}) {
  const { groups: allGroups } = useSelector((state) => state.groups);

  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Skupiny
      </Form.Label>
      <Col>
        <Row>
          {[...allGroups].sort(byName).map((group) => (
            <Col key={group._id}>
              <Form.Check
                type="checkbox"
                label={group.name}
                id={group._id}
                checked={programGroups.includes(group._id)}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    addGroup(group._id);
                  } else {
                    removeGroup(group._id);
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

function ProgramPeople({
  programPeople,
  allPeople,
  addPerson,
  removePerson,
  disabled = false,
}) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Lidi
      </Form.Label>
      <Col>
        <Row>
          {[
            ...new Set(
              [...allPeople, ...programPeople].sort((a, b) =>
                a.localeCompare(b)
              )
            ),
          ].map((person) => (
            <Col key={person}>
              <Form.Check
                type="checkbox"
                label={person}
                id={person}
                checked={programPeople.includes(person)}
                disabled={disabled}
                onChange={(e) => {
                  if (e.target.checked) {
                    addPerson(person);
                  } else {
                    removePerson(person);
                  }
                }}
              />
            </Col>
          ))}
        </Row>
        {!disabled && (
          <Button
            variant="outline-secondary"
            onClick={() => {
              const name = window.prompt("Jméno");
              if (name) {
                addPerson(name);
              }
            }}
          >
            Další člověk
          </Button>
        )}
      </Col>
    </Form.Group>
  );
}

function ProgramUrl({ url, setUrl, disabled = false }) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        URL
      </Form.Label>
      <Col>
        {disabled ? (
          <a
            href={url}
            style={{ wordBreak: "break-all" }}
            target="_blank"
            rel="noreferrer noopener"
          >
            {url}
          </a>
        ) : (
          <Form.Control
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}
      </Col>
    </Form.Group>
  );
}

function ProgramRanges({ programRanges, updateRange, disabled = false }) {
  const { ranges: allRanges } = useSelector((state) => state.ranges);

  return [...allRanges].sort(byName).map((range) => (
    <Form.Group as={Row} key={range._id}>
      <Form.Label column sm="2">
        {range.name}
      </Form.Label>
      <Col>
        <Form.Control
          type="range"
          min="0"
          max="3"
          value={
            programRanges && programRanges[range._id]
              ? programRanges[range._id]
              : 0
          }
          onChange={(e) => updateRange(range._id, e.target.value)}
          disabled={disabled}
        />
      </Col>
    </Form.Group>
  ));
}

function ProgramNotes({ notes, setNotes, disabled = false }) {
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2">
        Poznámky
      </Form.Label>
      <Col>
        {disabled ? (
          <p>{notes}</p>
        ) : (
          <Form.Control
            as="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
      </Col>
    </Form.Group>
  );
}

export function AddProgramModal(props) {
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const [title, setTitle] = useState("Nový program");
  const [date, setDate] = useState(formatDate(props.options.begin));
  const [time, setTime] = useState(formatTime(props.options.begin));
  const [duration, setDuration] = useState(formatDuration(60 * 60 * 1000));
  const [pkg, setPkg] = useState(undefined);
  const [groups, setGroups] = useState([]);
  const [people, setPeople] = useState([]);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [locked, setLocked] = useState(false);
  const [ranges, setRanges] = useState({});

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitInProgress(true);

    props
      .addProgram({
        begin: parseDate(date) + parseTime(time),
        duration: parseDuration(duration),
        title: title,
        pkg: pkg,
        groups: groups,
        people: people,
        ranges: ranges,
        url: url,
        notes: notes,
        locked: locked,
      })
      .then(() => {
        setSubmitInProgress(false);
        props.handleClose();
      });
  }

  return (
    <Modal show={true} onHide={props.handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Nový program</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgramTitle title={title} setTitle={setTitle} />
          <ProgramBeginning
            time={time}
            setTime={setTime}
            date={date}
            setDate={setDate}
          />
          <ProgramDuration
            duration={duration}
            setDuration={setDuration}
            locked={locked}
            setLocked={setLocked}
          />
          <ProgramPackage pkg={pkg} setPkg={setPkg} packages={props.pkgs} />
          <ProgramGroups
            programGroups={groups}
            addGroup={(group) => setGroups([...groups, group])}
            removeGroup={(group) =>
              setGroups(groups.filter((g) => g !== group))
            }
          />
          <ProgramPeople
            programPeople={people}
            allPeople={props.people}
            addPerson={(person) => setPeople([...people, person])}
            removePerson={(person) =>
              setPeople(people.filter((p) => p !== person))
            }
          />
          <ProgramUrl url={url} setUrl={setUrl} />
          <ProgramRanges
            programRanges={ranges}
            updateRange={(id, val) => setRanges({ ...ranges, [id]: val })}
          />
          <ProgramNotes notes={notes} setNotes={setNotes} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={props.handleClose}>
            Zrušit
          </Button>
          <Button variant="primary" type="submit">
            {submitInProgress ? (
              <i className="fa fa-spinner fa-pulse" />
            ) : (
              <i className="fa fa-plus" />
            )}
            &nbsp; Přidat
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

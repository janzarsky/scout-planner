import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {
  formatDateWithTray,
  formatDuration,
  formatTimeWithTray,
  parseDate,
  parseDuration,
  parseTime,
} from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import { byName, byOrder } from "../helpers/Sorting";
import {
  addProgram,
  deleteProgram,
  updateProgram,
} from "../store/programsSlice";
import { addPerson } from "../store/peopleSlice";
import { clientFactory } from "../Client";
import { addError } from "../store/errorsSlice";
import { parseIntOrZero } from "../helpers/Parsing";

export function EditProgramModal({ programId, handleClose }) {
  const program = useSelector((state) => {
    const prog = state.programs.programs.find((p) => p._id === programId);
    return prog ? prog : {};
  });

  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const [title, setTitle] = useState(program.title);
  const [date, setDate] = useState(formatDateWithTray(program.begin));
  const [time, setTime] = useState(formatTimeWithTray(program.begin));
  const [duration, setDuration] = useState(formatDuration(program.duration));
  const [pkg, setPkg] = useState(program.pkg);
  const [groups, setGroups] = useState(program.groups);
  const [attendance, setAttendance] = useState(program.people);
  const [place, setPlace] = useState(program.place ? program.place : ""); // data fix
  const [url, setUrl] = useState(program.url);
  const [notes, setNotes] = useState(program.notes);
  const [locked, setLocked] = useState(!!program.locked);
  const [ranges, setRanges] = useState(program.ranges);
  const [blockOrder, setBlockOrder] = useState(
    program.blockOrder ? program.blockOrder : 0 // data fix
  );

  const dispatch = useDispatch();

  const { table, userLevel } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  function handleDelete(event) {
    event.preventDefault();

    setDeleteInProgress(true);

    client.updateProgram({ ...program, deleted: true }).then(
      () => {
        dispatch(deleteProgram(program._id));
        setDeleteInProgress(false);
        handleClose();
      },
      (e) => dispatch(addError(e.message))
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitInProgress(true);

    const begin = parseDate(date) + parseTime(time);

    client
      .updateProgram({
        ...program,
        begin: isNaN(begin) ? null : begin,
        duration: parseDuration(duration),
        title: title,
        pkg: pkg,
        groups: groups,
        people: attendance,
        ranges: ranges,
        place: place,
        url: url,
        notes: notes,
        locked: locked,
        blockOrder: blockOrder,
      })
      .then(
        (resp) => {
          dispatch(updateProgram(resp));
          setSubmitInProgress(false);
          handleClose();
        },
        (e) => dispatch(addError(e.message))
      );
  }

  return (
    <Modal show={true} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {userLevel >= level.EDIT ? "Upravit program" : "Program"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgramTitle
            title={title}
            setTitle={setTitle}
            disabled={userLevel < level.EDIT}
          />
          <ProgramBeginning
            time={time}
            setTime={setTime}
            date={date}
            setDate={setDate}
            disabled={userLevel < level.EDIT}
          />
          <ProgramDuration
            duration={duration}
            setDuration={setDuration}
            locked={locked}
            setLocked={setLocked}
            disabled={userLevel < level.EDIT}
          />
          <ProgramPackage
            pkg={pkg}
            setPkg={setPkg}
            disabled={userLevel < level.EDIT}
          />
          <ProgramGroups
            programGroups={groups}
            addGroup={(group) => setGroups([...groups, group])}
            removeGroup={(group) =>
              setGroups(groups.filter((g) => g !== group))
            }
            disabled={userLevel < level.EDIT}
          />
          <ProgramPeople
            programPeople={attendance}
            addPersonString={(person) => setAttendance([...attendance, person])}
            removePersonString={(person) =>
              setAttendance(attendance.filter((p) => p !== person))
            }
            addPersonObject={(person) => setAttendance([...attendance, person])}
            removePersonObject={(id) =>
              setAttendance(attendance.filter((att) => att.person !== id))
            }
            disabled={userLevel < level.EDIT}
          />
          <ProgramPlace
            place={place}
            setPlace={setPlace}
            disabled={userLevel < level.EDIT}
          />
          <ProgramUrl
            url={url}
            setUrl={setUrl}
            disabled={userLevel < level.EDIT}
          />
          <ProgramRanges
            programRanges={ranges}
            updateRange={(id, val) => setRanges({ ...ranges, [id]: val })}
            disabled={userLevel < level.EDIT}
          />
          <ProgramNotes
            notes={notes}
            setNotes={setNotes}
            disabled={userLevel < level.EDIT}
          />
          <ProgramBlockOrder
            blockOrder={blockOrder}
            setBlockOrder={setBlockOrder}
            disabled={userLevel < level.EDIT}
          />
        </Modal.Body>
        <Modal.Footer>
          {userLevel >= level.EDIT && (
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
          <Button variant="link" onClick={handleClose}>
            {userLevel >= level.EDIT ? "Zrušit" : "Zavřít"}
          </Button>
          {userLevel >= level.EDIT && (
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
    <Form.Group as={Row} className="mb-3">
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
    <Form.Group as={Row} className="mb-1">
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
          placeholder="DD.MM.YYYY"
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
  const timeStep = useSelector((state) => state.settings.settings.timeStep);
  const defaultDurations = {
    [15 * 60 * 1000]: [
      ["0:15", "15 min"],
      ["0:30", "30 min"],
      ["0:45", "45 min"],
      ["1:00", "1 hod"],
      ["1:30", "1,5 hod"],
      ["2:00", "2 hod"],
    ],
    [10 * 60 * 1000]: [
      ["0:10", "10 min"],
      ["0:30", "30 min"],
      ["0:40", "40 min"],
      ["1:00", "1 hod"],
      ["1:30", "1,5 hod"],
      ["2:00", "2 hod"],
    ],
    [5 * 60 * 1000]: [
      ["0:10", "10 min"],
      ["0:15", "15 min"],
      ["0:30", "30 min"],
      ["1:00", "1 hod"],
      ["1:30", "1,5 hod"],
      ["2:00", "2 hod"],
    ],
  }[timeStep];

  return (
    <>
      <Form.Group as={Row} className="mb-1">
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
      {!disabled && defaultDurations && (
        <Form.Group className="mb-3">
          {defaultDurations.map(([value, text]) => (
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

function ProgramPackage({ pkg, setPkg, disabled = false }) {
  const { packages } = useSelector((state) => state.packages);

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">
        Balíček
      </Form.Label>
      <Col>
        <Form.Select
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
        </Form.Select>
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
    <Form.Group as={Row} className="mb-2">
      <Form.Label column sm="2">
        Skupiny
      </Form.Label>
      <Col>
        <Row>
          {[...allGroups].sort(byOrder).map((group) => (
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
  addPersonString,
  removePersonString,
  addPersonObject,
  removePersonObject,
  disabled = false,
}) {
  const {
    legacyPeople: stringPeople,
    people: objectPeople,
    peopleMigrationState,
  } = useSelector((state) => state.people);

  const dispatch = useDispatch();
  const table = useSelector((state) => state.auth.table);
  const client = clientFactory.getClient(table);

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">
        Lidi
      </Form.Label>
      <Col>
        <Row>
          {peopleMigrationState === "finishedPrograms"
            ? [...objectPeople]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((person) => (
                  <Col key={person._id}>
                    <Form.Check
                      type="checkbox"
                      label={person.name}
                      id={person._id}
                      checked={
                        !!programPeople.find((att) => att.person === person._id)
                      }
                      disabled={disabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addPersonObject({ person: person._id });
                        } else {
                          removePersonObject(person._id);
                        }
                      }}
                    />
                  </Col>
                ))
            : [
                ...new Set(
                  [...stringPeople, ...programPeople].sort((a, b) =>
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
                        addPersonString(person);
                      } else {
                        removePersonString(person);
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
                client.addPerson({ name }).then(
                  (resp) => {
                    dispatch(addPerson(resp));
                    peopleMigrationState === "finishedPrograms"
                      ? addPersonObject({ person: resp._id })
                      : addPersonString(name);
                  },
                  (e) => dispatch(addError(e.message))
                );
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

function ProgramPlace({ place, setPlace, disabled = false }) {
  return (
    <Form.Group as={Row} className="mb-2">
      <Form.Label column sm="2">
        Místo
      </Form.Label>
      <Col>
        {disabled ? (
          place
        ) : (
          <Form.Control
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
        )}
      </Col>
    </Form.Group>
  );
}

function ProgramUrl({ url, setUrl, disabled = false }) {
  return (
    <Form.Group as={Row} className="mb-2">
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
    <Form.Group as={Row} key={range._id} className="mb-1">
      <Form.Label column sm="2">
        {range.name}
      </Form.Label>
      <Col>
        <Form.Range
          min="0"
          max="3"
          value={
            programRanges && programRanges[range._id]
              ? programRanges[range._id]
              : 0
          }
          onChange={(e) => updateRange(range._id, e.target.value)}
          disabled={disabled}
          className="mt-2"
        />
      </Col>
    </Form.Group>
  ));
}

function ProgramNotes({ notes, setNotes, disabled = false }) {
  return (
    <Form.Group as={Row} className="mb-2">
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

function ProgramBlockOrder({ blockOrder, setBlockOrder, disabled = false }) {
  return (
    <Form.Group as={Row} className="mb-2">
      <Form.Label column sm="2">
        Pořadí v bloku
      </Form.Label>
      <Col>
        {disabled ? (
          <p>{blockOrder}</p>
        ) : (
          <Form.Control
            type="number"
            value={blockOrder}
            onChange={(e) => setBlockOrder(parseIntOrZero(e.target.value))}
          />
        )}
      </Col>
      <Col>
        <i className="fa fa-flask" aria-hidden="true"></i>{" "}
        <small>Experimentální funkce</small>
      </Col>
    </Form.Group>
  );
}

export function AddProgramModal({ options, handleClose }) {
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const [title, setTitle] = useState("Nový program");
  const [date, setDate] = useState(formatDateWithTray(options.begin));
  const [time, setTime] = useState(formatTimeWithTray(options.begin));
  const [duration, setDuration] = useState(formatDuration(60 * 60 * 1000));
  const [pkg, setPkg] = useState(undefined);
  const [groups, setGroups] = useState(
    options.groupId ? [options.groupId] : []
  );
  const [attendance, setAttendance] = useState([]);
  const [place, setPlace] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [locked, setLocked] = useState(false);
  const [ranges, setRanges] = useState({});
  const [blockOrder, setBlockOrder] = useState(0);

  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  function handleSubmit(event) {
    event.preventDefault();

    setSubmitInProgress(true);

    const begin = parseDate(date) + parseTime(time);

    client
      .addProgram({
        begin: isNaN(begin) ? null : begin,
        duration: parseDuration(duration),
        title: title,
        pkg: pkg,
        groups: groups,
        people: attendance,
        ranges: ranges,
        place: place,
        url: url,
        notes: notes,
        locked: locked,
        blockOrder: blockOrder,
      })
      .then(
        (resp) => {
          dispatch(addProgram(resp));
          setSubmitInProgress(false);
          handleClose();
        },
        (e) => dispatch(addError(e.message))
      );
  }

  return (
    <Modal show={true} onHide={handleClose}>
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
          <ProgramPackage pkg={pkg} setPkg={setPkg} />
          <ProgramGroups
            programGroups={groups}
            addGroup={(group) => setGroups([...groups, group])}
            removeGroup={(group) =>
              setGroups(groups.filter((g) => g !== group))
            }
          />
          <ProgramPeople
            programPeople={attendance}
            addPersonString={(person) => setAttendance([...attendance, person])}
            removePersonString={(person) =>
              setAttendance(attendance.filter((p) => p !== person))
            }
            addPersonObject={(person) => setAttendance([...attendance, person])}
            removePersonObject={(id) =>
              setAttendance(attendance.filter((att) => att.person !== id))
            }
          />
          <ProgramPlace place={place} setPlace={setPlace} />
          <ProgramUrl url={url} setUrl={setUrl} />
          <ProgramRanges
            programRanges={ranges}
            updateRange={(id, val) => setRanges({ ...ranges, [id]: val })}
          />
          <ProgramNotes notes={notes} setNotes={setNotes} />
          <ProgramBlockOrder
            blockOrder={blockOrder}
            setBlockOrder={setBlockOrder}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={handleClose}>
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

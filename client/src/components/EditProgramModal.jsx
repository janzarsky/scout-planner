import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
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
import { level } from "@scout-planner/common/level";
import { byName, byOrder } from "../helpers/Sorting";
import { parseIntOrZero } from "../helpers/Parsing";
import { useLocation, useNavigate, useParams } from "react-router";
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import cs from "date-fns/locale/cs";

import "react-datepicker/dist/react-datepicker.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetGroupsQuery } from "../store/groupsApi";
import { useGetPackagesQuery } from "../store/packagesApi";
import { useAddPersonMutation, useGetPeopleQuery } from "../store/peopleApi";
import { DEFAULT_TIME_STEP, useGetSettingsQuery } from "../store/settingsApi";
import {
  useAddProgramMutation,
  useDeleteProgramMutation,
  useGetProgramQuery,
  useUpdateProgramMutation,
} from "../store/programsApi";

registerLocale("cs", cs);
setDefaultLocale("cs");

export function EditProgramModal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { table } = useSelector((state) => state.auth);
  const { data: program, isSuccess: programLoaded } = useGetProgramQuery({
    table,
    id,
  });

  return (
    <Modal show={true} onHide={() => navigate(`/${table}`)}>
      {programLoaded && <EditProgramForm program={program} />}
    </Modal>
  );
}

function EditProgramForm({ program }) {
  const { table, userLevel } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
    program.blockOrder ? program.blockOrder : 0, // data fix
  );

  const [addProgramMutation] = useAddProgramMutation();
  const [deleteProgramMutation] = useDeleteProgramMutation();
  const [updateProgramMutation] = useUpdateProgramMutation();

  const handleClose = () => navigate(`/${table}`);

  function handleDelete(event) {
    event.preventDefault();

    handleClose();

    deleteProgramMutation({ table, id: program._id });
  }

  function handleClone(event) {
    event.preventDefault();

    handleClose();

    const newProgram = { ...program };
    delete newProgram._id;

    addProgramMutation({ table, data: newProgram });
  }

  function handleSubmit(event) {
    event.preventDefault();

    handleClose();

    const begin = parseDate(date) + parseTime(time);
    const parsedDuration = parseDuration(duration);
    const updatedProgram = {
      ...program,
      begin: isNaN(begin) ? null : begin,
      duration: isNaN(parsedDuration) ? parseDuration("1:00") : parsedDuration,
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
    };

    updateProgramMutation({ table, data: updatedProgram });
  }

  return (
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
          removeGroup={(group) => setGroups(groups.filter((g) => g !== group))}
          disabled={userLevel < level.EDIT}
        />
        <ProgramPeople
          programPeople={attendance}
          setAttendance={(id, att) =>
            setAttendance([
              ...attendance.filter((att) => att.person !== id),
              { person: id, ...att },
            ])
          }
          removeAttendance={(id) =>
            setAttendance(attendance.filter((att) => att.person !== id))
          }
          disabled={userLevel < level.EDIT}
          begin={parseDate(date) + parseTime(time)}
          duration={parseDuration(duration)}
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
          <Button variant="link text-danger" onClick={handleDelete}>
            <i className="fa fa-trash" />
            &nbsp; Smazat
          </Button>
        )}
        {userLevel >= level.EDIT && (
          <Button
            variant="link"
            onClick={handleClone}
            style={{ marginRight: "auto" }}
          >
            <i className="fa fa-clone" />
            &nbsp; Klonovat
          </Button>
        )}
        <Button variant="link" onClick={handleClose}>
          {userLevel >= level.EDIT ? "Zrušit" : "Zavřít"}
        </Button>
        {userLevel >= level.EDIT && (
          <Button variant="primary" type="submit">
            <i className="fa fa-save" />
            &nbsp; Uložit
          </Button>
        )}
      </Modal.Footer>
    </Form>
  );
}

function ProgramTitle({ title, setTitle, disabled = false }) {
  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">
        Název{" "}
        <InfoIcon text="Pro úsporu místa můžeš použít místo názvu emoji nebo dát název do závorek, bude pak v harmonogramu skrytý" />
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

export function ProgramBeginning({
  time,
  setTime,
  date,
  setDate,
  disabled = false,
}) {
  // FIXME: find better approach
  const tray = date === "(odkladiště)";

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
        <DatePicker
          className="form-control"
          dateFormat="d.M.yyyy"
          selected={tray ? null : new Date(parseDate(date))}
          onChange={(val) => setDate(formatDateWithTray(val.getTime()))}
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
  const { table } = useSelector((state) => state.auth);
  const { data: settings, isSuccess: settingsLoaded } =
    useGetSettingsQuery(table);
  const timeStep = settingsLoaded ? settings.timeStep : DEFAULT_TIME_STEP;
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
          <Form.Check>
            <Form.Check.Input
              type="checkbox"
              checked={locked}
              onChange={(e) => setLocked(e.target.checked)}
              id="locked"
              disabled={disabled}
            />
            <Form.Check.Label>
              Zamknout &nbsp;
              <InfoIcon text="Zamknuté programy nelze v harmonogramu přesouvat" />
            </Form.Check.Label>
          </Form.Check>
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
  const { table } = useSelector((state) => state.auth);
  const { data: packages, isSuccess: packagesLoaded } =
    useGetPackagesQuery(table);

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">
        Balíček
      </Form.Label>
      <Col>
        <Form.Select
          value={pkg ? pkg : undefined}
          onChange={(e) => setPkg(e.target.value)}
          disabled={disabled}
        >
          <option>žádný</option>
          {packagesLoaded &&
            [...packages].sort(byName).map((p) => (
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
  const { table } = useSelector((state) => state.auth);
  const { data: allGroups, isSuccess: groupsLoaded } = useGetGroupsQuery(table);

  return (
    <Form.Group as={Row} className="mb-2">
      <Form.Label column sm="2">
        Skupiny
      </Form.Label>
      <Col>
        <Row>
          {groupsLoaded &&
            [...allGroups].sort(byOrder).map((group) => (
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

export function PersonCheck({
  available,
  name,
  id,
  attendance,
  disabled,
  setAttendance,
  removeAttendance,
}) {
  return (
    <Button
      variant="link"
      className={
        "person-button " +
        (available
          ? attendance
            ? attendance.optional
              ? "text-info"
              : "text-success"
            : "text-dark"
          : "text-danger")
      }
      id={id}
      disabled={disabled}
      onClick={() => {
        if (!attendance) setAttendance(id, {});
        else if (attendance && !attendance.optional)
          setAttendance(id, { optional: true });
        else removeAttendance(id);
      }}
    >
      {attendance && !attendance.optional && (
        <i className="fa fa-check" aria-hidden="true" />
      )}
      {attendance && attendance.optional && (
        <>
          {"("}
          <i className="fa fa-check" aria-hidden="true" />
          {")"}
        </>
      )}
      &nbsp;
      {name}
    </Button>
  );
}

export function ProgramPeople({
  programPeople,
  setAttendance,
  removeAttendance,
  disabled = false,
  begin,
  duration,
}) {
  const table = useSelector((state) => state.auth.table);
  const { data: objectPeople, isSuccess: peopleLoaded } =
    useGetPeopleQuery(table);
  const [addPerson] = useAddPersonMutation();

  return (
    <Form.Group as={Row} className="mb-3">
      <Form.Label column sm="2">
        Lidi{" "}
        <InfoIcon text="Organizátoři označení červeně v průběhu programu chybí." />
      </Form.Label>
      <Col>
        {peopleLoaded &&
          [...objectPeople]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((person) => (
              <PersonCheck
                key={person._id}
                name={person.name}
                id={person._id}
                available={isPersonAvailable(
                  person._id,
                  objectPeople,
                  begin,
                  duration,
                )}
                attendance={programPeople.find(
                  (att) => att.person === person._id,
                )}
                disabled={disabled}
                setAttendance={setAttendance}
                removeAttendance={removeAttendance}
              />
            ))}
        {!disabled && (
          <Button
            variant="outline-secondary"
            data-test="add-person"
            onClick={() => {
              const name = window.prompt("Jméno");
              if (name) {
                addPerson({ table, data: { name } }).then((res) =>
                  setAttendance(res.data, {}),
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
        URL{" "}
        <InfoIcon text="Odkaz na více informací. Zobrazuje se v levém dolním rohu programu." />
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
  const { table } = useSelector((state) => state.auth);
  const { data: allRanges, isSuccess: rangesLoaded } = useGetRangesQuery(table);

  return rangesLoaded
    ? [...allRanges].sort(byName).map((range) => (
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
      ))
    : null;
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
        Pořadí v bloku{" "}
        <InfoIcon text="Pro více programů současně, každý program musí mít jiné číslo." />
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

export function AddProgramModal() {
  const location = useLocation();
  const options = { begin: null, groupId: null, ...location.state };

  const navigate = useNavigate();

  const [title, setTitle] = useState("Nový program");
  const [date, setDate] = useState(formatDateWithTray(options.begin));
  const [time, setTime] = useState(formatTimeWithTray(options.begin));
  const [duration, setDuration] = useState(formatDuration(60 * 60 * 1000));
  const [pkg, setPkg] = useState(null);
  const [groups, setGroups] = useState(
    options.groupId ? [options.groupId] : [],
  );
  const [attendance, setAttendance] = useState([]);
  const [place, setPlace] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [locked, setLocked] = useState(false);
  const [ranges, setRanges] = useState({});
  const [blockOrder, setBlockOrder] = useState(0);

  const [addProgramMutation] = useAddProgramMutation();

  const { table } = useSelector((state) => state.auth);

  const handleClose = () => navigate(`/${table}`);

  function handleSubmit(event) {
    event.preventDefault();

    handleClose();

    const begin = parseDate(date) + parseTime(time);
    const parsedDuration = parseDuration(duration);

    const newProgram = {
      begin: isNaN(begin) ? null : begin,
      duration: isNaN(parsedDuration) ? parseDuration("1:00") : parsedDuration,
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
    };

    addProgramMutation({ table, data: newProgram });
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
            setAttendance={(id, att) =>
              setAttendance([
                ...attendance.filter((att) => att.person !== id),
                { person: id, ...att },
              ])
            }
            removeAttendance={(id) =>
              setAttendance(attendance.filter((att) => att.person !== id))
            }
            begin={parseDate(date) + parseTime(time)}
            duration={parseDuration(duration)}
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
            <i className="fa fa-plus" />
            &nbsp; Přidat
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function InfoIcon({ text }) {
  return (
    <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>
      <i className="fa fa-question-circle" aria-hidden="true"></i>
    </OverlayTrigger>
  );
}

function intervalsOverlap(begin1, end1, begin2, end2) {
  return begin1 < end2 && begin2 < end1;
}

function personAvailable(absence, begin, end) {
  return absence.reduce((acc, curr) => {
    if (intervalsOverlap(curr.begin, curr.end, begin, end)) return false;

    return acc;
  }, true);
}

function isPersonAvailable(id, people, begin, duration) {
  const person = people.find((p) => p._id === id);

  if (
    begin !== null &&
    duration !== null &&
    person &&
    person.absence &&
    person.absence.length > 0 &&
    !personAvailable(person.absence, begin, begin + duration)
  )
    return false;

  return true;
}

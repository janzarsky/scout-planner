import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { formatDate, parseDate } from "../helpers/DateUtils";
import DatePicker, { registerLocale, setDefaultLocale } from "react-datepicker";
import cs from "date-fns/locale/cs";
import { useAuth } from "./AuthProvider";
import { useShiftMutation } from "../store/shiftApi";
import { useSelector } from "react-redux";
import { useGetProgramsQuery } from "../store/programsApi";

import "react-datepicker/dist/react-datepicker.css";
registerLocale("cs", cs);
setDefaultLocale("cs");

export default function Shift() {
  const [newDate, setNewDate] = useState(null);
  const [success, setSuccess] = useState(false);

  const { table } = useSelector((state) => state.auth);
  const { user, getIdToken } = useAuth();
  const [shift] = useShiftMutation();

  const currDate = useTimetableBeginning();

  async function handleSubmit(event) {
    event.preventDefault();

    const token = await getIdToken();

    const offset = newDate != null ? parseDate(newDate) - currDate : 0;

    shift({ table, offset, token })
      .unwrap()
      .then(() => {
        setSuccess(true);
      });
  }

  return (
    <>
      <h3>Posunout datum</h3>
      {!user && (
        <p className="text-danger">
          <i className="fa fa-exclamation-triangle" />
          &nbsp; Pro posun data se prosím přihlaste
        </p>
      )}
      {currDate && <p>Začátek harmonogramu: {formatDate(currDate)}</p>}
      {success && <p className="text-success">Harmonogram úspěšně posunut</p>}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Form.Label column sm="2">
            Nový začátek
          </Form.Label>
          <Col sm="3" className="mb-2">
            <DatePicker
              className="form-control"
              dateFormat="d.M.yyyy"
              selected={
                newDate
                  ? new Date(parseDate(newDate))
                  : currDate != null
                    ? new Date(currDate)
                    : null
              }
              onChange={(val) => setNewDate(formatDate(val.getTime()))}
              disabled={!user}
            />
          </Col>
          <Col sm="7" className="mb-2">
            <Button type="submit" disabled={!user}>
              <i className="fa fa-calendar-o"></i> Posunout datum
            </Button>
            <i className="fa fa-flask ms-3" aria-hidden="true"></i>{" "}
            <small>Experimentální funkce</small>
          </Col>
        </Row>
      </Form>
    </>
  );
}

function useTimetableBeginning() {
  const [beginning, setBeginning] = useState(null);
  const { table } = useSelector((state) => state.auth);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);

  useEffect(() => {
    if (programsLoaded) {
      const min = Math.min(
        ...programs.flatMap((p) => (Number.isFinite(p.begin) ? [p.begin] : [])),
      );

      if (Number.isFinite(min)) setBeginning(min);
    }
  }, [programs, programsLoaded]);

  return beginning;
}

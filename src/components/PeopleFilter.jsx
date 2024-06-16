import React from "react";
import Nav from "react-bootstrap/Nav";
import { useDispatch, useSelector } from "react-redux";
import { toggleActivePerson, togglePeopleEnabled } from "../store/viewSlice";
import { byName } from "../helpers/Sorting";
import { Button } from "react-bootstrap";
import { useGetPeopleSlice } from "../store/peopleSlice";

export function PeopleFilterToggle() {
  const dispatch = useDispatch();
  const peopleEnabled = useSelector((state) => state.view.peopleEnabled);

  return (
    <Nav.Link
      className={peopleEnabled ? "dark" : ""}
      onClick={() => dispatch(togglePeopleEnabled())}
    >
      <i className="fa fa-user" />
    </Nav.Link>
  );
}

export function PeopleFilter() {
  const dispatch = useDispatch();
  const { table } = useSelector((state) => state.auth);
  const { data: people, isSuccess: peopleLoaded } = useGetPeopleSlice(
    table,
    false,
  );
  const { activePeople, peopleEnabled } = useSelector((state) => state.view);

  if (!peopleEnabled || !peopleLoaded) return null;

  return [...people].sort(byName).map((person) => (
    <Button
      key={person._id}
      variant={activePeople.indexOf(person._id) !== -1 ? "dark" : "light"}
      onClick={() => dispatch(toggleActivePerson(person._id))}
    >
      {person.name}
    </Button>
  ));
}

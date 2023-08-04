import Nav from "react-bootstrap/Nav";
import { useDispatch, useSelector } from "react-redux";
import { togglePeopleEnabled } from "../store/viewSlice";

export function PeopleFilterToggle() {
  const dispatch = useDispatch();
  const peopleEnabled = useSelector((state) => state.view.peopleEnabled);

  return (
    <Nav.Link
      className={peopleEnabled ? "dark" : ""}
      onClick={() => dispatch(togglePeopleEnabled())}
    >
      <i className="fa fa-user-o" />
    </Nav.Link>
  );
}

import { useDispatch, useSelector } from "react-redux";
import { removeError } from "../store/errorsSlice";
import { Alert, Container } from "react-bootstrap";

export function Notifications() {
  const errors = useSelector((state) => state.errors);
  const dispatch = useDispatch();

  if (errors.length === 0) return null;

  return (
    <Container fluid className="notifications">
      <Alert
        variant="danger"
        dismissible
        onClose={() => dispatch(removeError())}
      >
        <i className="fa fa-exclamation-triangle" />
        &nbsp; {errors[0]}
      </Alert>
    </Container>
  );
}

import React from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "./AuthProvider";
import { setAuthenticated } from "../store/authSlice";
import { addError } from "../store/errorsSlice";
import { Nav } from "react-bootstrap";

export function GoogleLogin() {
  const dispatch = useDispatch();
  const { user, login, logout } = useAuth();

  return !!user ? (
    <Nav.Link
      variant="light"
      data-test="auth-logout-button"
      className="ms-auto"
      onClick={() =>
        logout()
          .then(() => dispatch(setAuthenticated(false)))
          .catch((e) => dispatch(addError(e.message)))
      }
    >
      {user.displayName}
      &nbsp;
      <i className="fa fa-sign-out" />
    </Nav.Link>
  ) : (
    <Nav.Link
      variant="light"
      data-test="auth-login-button"
      className="ms-auto"
      onClick={() =>
        login()
          .then(() => dispatch(setAuthenticated(true)))
          .catch((e) => dispatch(addError(e.message)))
      }
    >
      <i className="fa fa-sign-in" />
    </Nav.Link>
  );
}

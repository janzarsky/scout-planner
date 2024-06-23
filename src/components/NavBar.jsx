import React from "react";
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { useSelector } from "react-redux";
import { PackageFilterToggle } from "./PackageFilter";
import { PeopleFilterToggle } from "./PeopleFilter";
import { ViewSettingsToggle } from "./ViewSettings";
import { RangesSettingsToggle } from "./RangesSettings";
import { NavLink, Route, Routes } from "react-router-dom";
import { level } from "../helpers/Level";
import { GoogleLogin } from "./GoogleLogin";
import { useGetTimetableSlice } from "../store/timetableSlice";

export function NavBar({ rulesSatisfied }) {
  const { userLevel, table } = useSelector((state) => state.auth);
  const { data: timetable, isSuccess: timetableLoaded } =
    useGetTimetableSlice(table);
  const title = timetableLoaded ? timetable.title : null;

  return (
    <Navbar bg="light" className="control-panel" expand="lg">
      <Container fluid className="ps-0 pe-0">
        <Nav.Link as={NavLink} to="" end>
          {title ? title : "Harmonogram"}
        </Nav.Link>
        <Navbar.Toggle
          aria-controls="navbar-toggle"
          data-test="navbar-toggle"
        />
        <Navbar.Collapse id="navbar-toggle">
          {userLevel >= level.VIEW && (
            <Nav.Link as={NavLink} to="rules">
              Pravidla{" "}
              {rulesSatisfied ? (
                <i className="fa fa-check text-success" />
              ) : (
                <i className="fa fa-times text-danger" />
              )}
            </Nav.Link>
          )}
          {userLevel >= level.VIEW && (
            <Nav.Link as={NavLink} to="stats" end>
              Statistiky
            </Nav.Link>
          )}
          {userLevel >= level.VIEW && (
            <NavDropdown title="Nastavení">
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="packages" end>
                  Balíčky
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="groups" end>
                  Skupiny
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="people" end>
                  Organizátoři
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="ranges" end>
                  Linky
                </NavDropdown.Item>
              )}
              {userLevel >= level.ADMIN && (
                <NavDropdown.Item as={NavLink} to="users" end>
                  Uživatelé
                </NavDropdown.Item>
              )}
              {userLevel >= level.VIEW && (
                <NavDropdown.Item as={NavLink} to="settings" end>
                  Nastavení
                </NavDropdown.Item>
              )}
              {userLevel >= level.VIEW && (
                <NavDropdown.Item as={NavLink} to="print" end>
                  Tisk
                </NavDropdown.Item>
              )}
            </NavDropdown>
          )}
          <Routes>
            <Route
              index
              element={
                <>
                  {userLevel >= level.VIEW && <PackageFilterToggle />}
                  {userLevel >= level.VIEW && <PeopleFilterToggle />}
                  {userLevel >= level.VIEW && <ViewSettingsToggle />}
                  {userLevel >= level.VIEW && <RangesSettingsToggle />}
                </>
              }
            />
          </Routes>
          <GoogleLogin />
          <Nav.Link as={NavLink} to="about" variant="light">
            <i className="fa fa-question" />
          </Nav.Link>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

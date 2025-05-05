import React from "react";
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import { useSelector } from "react-redux";
import { PackageFilterToggle } from "./PackageFilter";
import { PeopleFilterToggle } from "./PeopleFilter";
import { ViewSettingsToggle } from "./ViewSettings";
import { RangesSettingsToggle } from "./RangesSettings";
import { NavLink, Route, Routes } from "react-router";
import { level } from "@scout-planner/common/level";
import { GoogleLogin } from "./GoogleLogin";
import { useGetTimetableQuery } from "../store/timetableApi";

export function NavBar({ rulesSatisfied }) {
  const { userLevel, table } = useSelector((state) => state.auth);
  const { data: timetable, isSuccess: timetableLoaded } =
    useGetTimetableQuery(table);
  const title = timetableLoaded ? timetable.title : null;
  const layoutVersion = timetableLoaded ? timetable.layoutVersion : "v1";

  return (
    <Navbar bg="light" className="control-panel" expand="lg">
      <Container fluid className="ps-0 pe-0">
        <Nav.Link as={NavLink} to={`/${table}`} end>
          {title ? title : "Harmonogram"}
        </Nav.Link>
        <Navbar.Toggle
          aria-controls="navbar-toggle"
          data-test="navbar-toggle"
        />
        <Navbar.Collapse id="navbar-toggle">
          {userLevel >= level.VIEW && (
            <Nav.Link as={NavLink} to={`/${table}/rules`}>
              Pravidla{" "}
              {rulesSatisfied ? (
                <i className="fa fa-check text-success" />
              ) : (
                <i className="fa fa-times text-danger" />
              )}
            </Nav.Link>
          )}
          {userLevel >= level.VIEW && (
            <Nav.Link as={NavLink} to={`/${table}/stats`} end>
              Statistiky
            </Nav.Link>
          )}
          {userLevel >= level.VIEW && (
            <NavDropdown title="Nastavení">
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to={`/${table}/packages`} end>
                  Balíčky
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to={`/${table}/groups`} end>
                  Skupiny
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to={`/${table}/people`} end>
                  Organizátoři
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to={`/${table}/ranges`} end>
                  Linky
                </NavDropdown.Item>
              )}
              {userLevel >= level.ADMIN && (
                <NavDropdown.Item as={NavLink} to={`/${table}/users`} end>
                  Uživatelé
                </NavDropdown.Item>
              )}
              {userLevel >= level.VIEW && (
                <NavDropdown.Item as={NavLink} to={`/${table}/settings`} end>
                  Nastavení
                </NavDropdown.Item>
              )}
              {userLevel >= level.VIEW && (
                <NavDropdown.Item as={NavLink} to={`/${table}/print`} end>
                  Tisk
                </NavDropdown.Item>
              )}
            </NavDropdown>
          )}
          {layoutVersion === "v1" && (
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
          )}
          <GoogleLogin />
          <Nav.Link as={NavLink} to={`/${table}/about`} variant="light">
            <i className="fa fa-question" />
          </Nav.Link>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

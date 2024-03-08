import React from "react";
import { Container } from "react-bootstrap";

export default function Rules() {
  return (
    <Container fluid>
      <h2 className="mt-3">Harmáč.cz</h2>
      <p>
        Skautský plánovač vytvořil Walker &ndash; Jan Žárský pro potřeby lesních
        kurzů Velká Morava. Chyby a návrhy na vylepšení piš do issues na&nbsp;
        <a href="https://github.com/janzarsky/scout-planner">GitHubu</a> (klidně
        i česky) nebo mi piš rovnou na&nbsp;
        <a href="mailto:walker@skaut.cz">email</a>.
      </p>
    </Container>
  );
}

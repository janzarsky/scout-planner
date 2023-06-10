import { useState } from "react";
import Nav from "react-bootstrap/Nav";
import { useSearchParams } from "react-router-dom";

export default function ViewSettings() {
  const [active, setActive] = useState(false);

  const defaultVals = {
    viewPkg: true,
    viewTime: false,
    viewPeople: true,
    viewPlace: true,
    viewViolations: true,
  };

  const [searchParams, setSearchParams] = useSearchParams(defaultVals);

  function getVal(params, name) {
    if (params.get(name) === "true") return true;
    if (params.get(name) === "false") return false;
    return defaultVals[name];
  }

  function toggleSearchParam(params, name) {
    const names = [
      "viewPkg",
      "viewTime",
      "viewPeople",
      "viewPlace",
      "viewViolations",
    ];

    const vals = Object.fromEntries(
      names.map((n) => [n, n === name ? !getVal(params, n) : getVal(params, n)])
    );

    let res = {};

    names.forEach((name) => {
      if (vals[name] !== defaultVals[name]) res[name] = vals[name];
    });

    return res;
  }

  return (
    <>
      <Nav.Link
        className={active ? "dark" : ""}
        onClick={() => setActive(!active)}
      >
        <i className="fa fa-eye" />
      </Nav.Link>
      {active && (
        <>
          <Nav.Link
            className={getVal(searchParams, "viewPkg") ? "dark" : ""}
            onClick={() =>
              setSearchParams((prev) => toggleSearchParam(prev, "viewPkg"))
            }
          >
            Balíček
          </Nav.Link>
          <Nav.Link
            className={getVal(searchParams, "viewTime") ? "dark" : ""}
            onClick={() =>
              setSearchParams((prev) => toggleSearchParam(prev, "viewTime"))
            }
          >
            Čas
          </Nav.Link>
          <Nav.Link
            className={getVal(searchParams, "viewPeople") ? "dark" : ""}
            onClick={() =>
              setSearchParams((prev) => toggleSearchParam(prev, "viewPeople"))
            }
          >
            Lidi
          </Nav.Link>
          <Nav.Link
            className={getVal(searchParams, "viewPlace") ? "dark" : ""}
            onClick={() =>
              setSearchParams((prev) => toggleSearchParam(prev, "viewPlace"))
            }
          >
            Místo
          </Nav.Link>
          <Nav.Link
            className={getVal(searchParams, "viewViolations") ? "dark" : ""}
            onClick={() =>
              setSearchParams((prev) =>
                toggleSearchParam(prev, "viewViolations")
              )
            }
          >
            Porušení pravidel
          </Nav.Link>
        </>
      )}
    </>
  );
}

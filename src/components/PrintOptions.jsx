import { Button, ButtonToolbar, Container } from "react-bootstrap";

export default function PrintOptions({ printCallback }) {
  const presets = {
    a4: { text: "A4" },
    a4landscape: { text: "A4 (na šířku)" },
    a3: { text: "A3" },
    a3landscape: { text: "A3 (na šířku)" },
    a2: { text: "A2" },
  };

  return (
    <Container fluid>
      <h2 className="mt-3">Tisk</h2>
      <ButtonToolbar>
        {Object.entries(presets).map(([id, { text }]) => (
          <Button
            key={id}
            onClick={() => printCallback(id)}
            className="me-2 mb-2"
          >
            <i className="fa fa-print"></i> {text}
          </Button>
        ))}
      </ButtonToolbar>
    </Container>
  );
}

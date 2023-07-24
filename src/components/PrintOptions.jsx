import { Button, Container } from "react-bootstrap";

export default function PrintOptions({ printCallback }) {
  return (
    <Container fluid>
      <h2 className="mt-3">Tisk</h2>
      <Button onClick={() => printCallback("a4")}>
        <i className="fa fa-print"></i> A4
      </Button>
    </Container>
  );
}

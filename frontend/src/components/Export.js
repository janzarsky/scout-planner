import Form from "react-bootstrap/Form";

export default function Export(props) {
  const data = JSON.stringify({
    programs: props.programs,
    pkgs: props.pkgs,
    groups: props.groups,
    rules: props.rules,
    ranges: props.ranges,
    users: props.users,
  });

  return (
    <Form.Group>
      <Form.Label>Exportovaná data:</Form.Label>
      <Form.Control as="textarea" value={data} readOnly />
    </Form.Group>
  );
}

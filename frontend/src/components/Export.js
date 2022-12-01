import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";

export default function Export(props) {
  const { groups } = useSelector((state) => state.groups);
  const { ranges } = useSelector((state) => state.ranges);

  const data = JSON.stringify({
    programs: props.programs,
    pkgs: props.pkgs,
    groups,
    rules: props.rules,
    ranges,
    users: props.users,
  });

  return (
    <Form.Group>
      <Form.Label>Exportovaná data:</Form.Label>
      <Form.Control as="textarea" value={data} readOnly />
    </Form.Group>
  );
}

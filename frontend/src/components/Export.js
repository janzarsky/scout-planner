import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";

export default function Export(props) {
  const { groups } = useSelector((state) => state.groups);
  const { ranges } = useSelector((state) => state.ranges);
  const { packages } = useSelector((state) => state.packages);
  const { rules } = useSelector((state) => state.rules);

  const data = JSON.stringify({
    programs: props.programs,
    pkgs: packages,
    groups,
    rules,
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

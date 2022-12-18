import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";

export default function Export() {
  const groups = useSelector((state) => state.groups.groups);
  const ranges = useSelector((state) => state.ranges.ranges);
  const packages = useSelector((state) => state.packages.packages);
  const rules = useSelector((state) => state.rules.rules);
  const users = useSelector((state) => state.users.users);
  const { programs, deletedPrograms } = useSelector((state) => state.programs);

  const data = JSON.stringify({
    programs: [...programs, ...deletedPrograms],
    pkgs: packages,
    groups,
    rules,
    ranges,
    users,
  });

  return (
    <Form.Group>
      <Form.Label>Exportovaná data:</Form.Label>
      <Form.Control as="textarea" value={data} readOnly />
    </Form.Group>
  );
}

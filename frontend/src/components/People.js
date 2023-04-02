import Table from "react-bootstrap/Table";
import { useSelector } from "react-redux";
import { convertLegacyPeople } from "../helpers/PeopleConvertor";

export default function People() {
  const { people, legacyPeople } = useSelector((state) => state.people);

  const allPeople = convertLegacyPeople(legacyPeople, people);

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          <th>Organizátor</th>
        </tr>
      </thead>
      <tbody>
        {[...allPeople]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((person) => (
            <tr key={person._id}>
              <td>{person.name}</td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
}

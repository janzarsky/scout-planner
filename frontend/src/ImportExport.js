import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Data from './Data';

class ImportExport extends React.Component {
  constructor(props) {
    super(props);
    ['importData'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const data = JSON.stringify({
      programs: [...this.props.programs.values()],
      pkgs: [...this.props.pkgs.values()],
      groups: [...this.props.groups.values()],
      rules: [...this.props.rules.values()],
    });

    return <Form onSubmit={this.handleSubmit}>
      <Container fluid>
        <Form.Group>
          <Form.Label>Exportovaná data:</Form.Label>
          <Form.Control as="textarea" value={data} readOnly/>
        </Form.Group>
        <Form.Group>
          <Form.Label>Data k importu:</Form.Label>
          <Form.Control as="textarea" ref={this.importData}/>
        </Form.Group>
        <Form.Group>
          <Button type="submit">Importovat</Button>
        </Form.Group>
      </Container>
    </Form>;
  }

  handleSubmit(event) {
    event.preventDefault();
    
    const data = JSON.parse(this.importData.current.value);

    Promise.all([
      ...data.pkgs.map(pkg =>
        Data.addPkg({...pkg, _id: undefined}).then(newPkg => [pkg._id, newPkg._id])
      )
    ])
    .then(pkgs => new Map(pkgs))
    .then(pkgs =>
      data.programs.map(prog => { return { ...prog, pkg: pkgs.get(prog.pkg), }; })
    )
    .then(programs => Promise.all(programs.map(prog =>
      Data.addProgram({ ...prog, _id: undefined }).then(newProg => [prog._id, newProg._id])
    )))
    .then(programs => new Map(programs))
    .then(programs =>
      data.rules.map(rule => { return { ...rule, program: programs.get(rule.program) }; })
    )
    .then(rules => Promise.all(rules.map(rule => Data.addRule(rule))))
    .then(() => window.location.reload());
  }
}

export default ImportExport;

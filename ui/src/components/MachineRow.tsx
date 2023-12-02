import { useNavigate } from 'react-router-dom'

import { Button, Card, Col, Row } from "reactstrap"

const MachineRow = ({ machine, setSelectedMachine }: any) => {
  const navigate = useNavigate()

  return (
    <Card className='p-3 mb-2'>
    <Row>
      <Col>
        <span className="form-control-label">
          {machine.name}
        </span>
      </Col>
      <Col className="text-right">
        <Button
          size="sm"
          color="info"
          type='button'
          onClick={() => navigate(`/infograph/${machine.id}`)}
        >
          View
        </Button>
        <Button
          size="sm"
          color="success"
          type='button'
          onClick={() => setSelectedMachine(machine)}
        >
          Pick
        </Button>
      </Col>
    </Row>
    </Card>
  )
}

export default MachineRow

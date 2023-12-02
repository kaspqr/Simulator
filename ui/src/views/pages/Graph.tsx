import { useParams } from 'react-router-dom'
import { Card, CardHeader, Col, Row } from 'reactstrap'
import { LineChart, XAxis, Tooltip, CartesianGrid, Line, YAxis } from 'recharts'
import { useGetMachinesQuery } from '../../redux/api/machinesApiSlice'
import { Machine } from '../../types/domain/machine.model'

const Graph = () => {
  const { id } = useParams()

  const { machine } = useGetMachinesQuery("machinesList", {
    selectFromResult: ({ data }: any) => ({
      machine: data?.find((machine: Machine) => machine.id === id)
    }),
  })

  const temperaturesData = machine?.temperature_recordings.map((recording: any) => {
    return {
      name: new Date(recording.timestamp).toLocaleString(),
      temperature: recording.temperature.value
    }
  })

  return (
    <Card>
      <CardHeader>
        <Row>
          <Col>
            <span className='heading'>{machine?.name} {machine?.id}</span>
          </Col>
        </Row>
        <Row>
          <Col>
            <span className='form-control-label'>
              {machine?.temperature_recordings?.length} Records
            </span>
          </Col>
        </Row>
      </CardHeader>
      <Row className='p-4'>
        <Col>
        <LineChart width={600} height={300} data={temperaturesData} margin={{ right: 20, left: 10 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="temperature" stroke="#ff7300" />
        </LineChart>
        </Col>
      </Row>
    </Card>
  )
}

export default Graph

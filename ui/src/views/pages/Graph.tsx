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

  const temperatureData = machine?.temperature?.recordings?.map((recording: any) => {
    return {
      name: new Date(recording?.timestamp).toLocaleString(),
      temperature: recording?.temperature
    }
  })

  const vibrationData = machine?.vibration?.recordings?.map((recording: any) => {
    return {
      name: new Date(recording?.timestamp).toLocaleString(),
      xAxis: recording?.x_axis,
      yAxis: recording?.y_axis,
      zAxis: recording?.z_axis
    }
  })

  const pressureData = machine?.pressure?.recordings?.map((recording: any) => {
    return {
      name: new Date(recording?.timestamp).toLocaleString(),
      pressure: recording?.pressure
    }
  })

  const humidityData = machine?.humidity?.recordings?.map((recording: any) => {
    return {
      name: new Date(recording?.timestamp).toLocaleString(),
      humidity: recording?.humidity
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
      </CardHeader>
      <Row className='ml-4 mt-4'>
        <Col>
          <span className='form-control-label'>
            {machine?.temperature?.recordings?.length} Temperature Records
          </span>
        </Col>
      </Row>
      <Row className='p-4'>
        <Col>
        <LineChart width={600} height={300} data={temperatureData} margin={{ right: 20, left: 10 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="temperature" stroke="olivedrab" />
        </LineChart>
        </Col>
      </Row>
      <Row className='ml-4 mt-4'>
        <Col>
          <span className='form-control-label'>
            {machine?.vibration?.recordings?.length} Vibration Records
          </span>
        </Col>
      </Row>
      <Row className='p-4'>
        <Col>
        <LineChart width={600} height={300} data={vibrationData} margin={{ right: 20, left: 10 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="xAxis" stroke="red" />
          <Line type="monotone" dataKey="yAxis" stroke="rebeccapurple" />
          <Line type="monotone" dataKey="zAxis" stroke="steelblue" />
        </LineChart>
        </Col>
      </Row>
      <Row className='ml-4 mt-4'>
        <Col>
          <span className='form-control-label'>
            {machine?.pressure?.recordings?.length} Pressure Records
          </span>
        </Col>
      </Row>
      <Row className='p-4'>
        <Col>
        <LineChart width={600} height={300} data={pressureData} margin={{ right: 20, left: 10 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="pressure" stroke="hotpink" />
        </LineChart>
        </Col>
      </Row>
      <Row className='ml-4 mt-4'>
        <Col>
          <span className='form-control-label'>
            {machine?.humidity?.recordings?.length} Humidity Records
          </span>
        </Col>
      </Row>
      <Row className='p-4'>
        <Col>
        <LineChart width={600} height={300} data={humidityData} margin={{ right: 20, left: 10 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          <Line type="monotone" dataKey="humidity" stroke="tomato" />
        </LineChart>
        </Col>
      </Row>
    </Card>
  )
}

export default Graph

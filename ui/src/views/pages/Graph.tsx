import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { LineChart, XAxis, Tooltip, CartesianGrid, YAxis, Line } from 'recharts'

import { useGetMachinesQuery } from '../../redux/api/machinesApiSlice'
import { Machine } from '../../types/domain/machine.model'
import { 
  TEMPERATURE,
  VIBRARTION,
  PRESSURE,
  HUMIDITY,
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
} from '../consts'
import { getChartData, getVibrationChartData } from '../utils/utils'

const Graph = () => {
  const { id } = useParams()

  const [health, setHealth] = useState<string>(TEMPERATURE)

  const { machine } = useGetMachinesQuery("machinesList", {
    selectFromResult: ({ data }: any) => ({
      machine: data?.find((machine: Machine) => machine.id === id)
    }),
    refetchOnMountOrArgChange: true
  })

  const temperatureData = getChartData(machine?.temperature?.recordings, TEMPERATURE)
  const pressureData = getChartData(machine?.pressure?.recordings, PRESSURE)
  const humidityData = getChartData(machine?.humidity?.recordings, HUMIDITY)
  const vibrationData = getVibrationChartData(machine?.vibration?.recordings)

  return (
    <Card>
      <CardHeader>
        <Row>
          <Col>
            <span className='heading'>{machine?.name} {machine?.id}</span>
          </Col>
        </Row>
      </CardHeader>
      <CardBody className='ml-4'>
        <Row>
          <Button
            onClick={() => setHealth(TEMPERATURE)}
            type='button'
            color='primary'
          >
            Temperature
          </Button>
          <Button
            color='primary'
            onClick={() => setHealth(VIBRARTION)}
            type='button'
          >
            Vibration
          </Button>
          <Button
            color='primary'
            onClick={() => setHealth(PRESSURE)}
            type='button'
          >
            Pressure
          </Button>
          <Button
            color='primary'
            onClick={() => setHealth(HUMIDITY)}
            type='button'
          >
            Humidity
          </Button>
        </Row>
      </CardBody>
      <Row className='ml-4 mt-4'>
        <Col>
          <span className='form-control-label'>
            {machine?.[health]?.recordings?.length}
            {' '}
            {health.charAt(0).toUpperCase() + health.slice(1)}
            {' '}
            Records
          </span>
        </Col>
      </Row>
      <Row className='p-4'>
        <Col>
          <LineChart 
            width={600} 
            height={300} 
            data={health === TEMPERATURE 
              ? temperatureData
              : health === PRESSURE
                ? pressureData
                : health === HUMIDITY
                  ? humidityData
                  : health === VIBRARTION
                    ? vibrationData
                    : undefined
            }
            margin={{ right: 20, left: 10 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#f5f5f5" />
            {health === VIBRARTION
              ? <>
                <Line type="monotone" dataKey={X_AXIS} stroke="red" />
                <Line type="monotone" dataKey={Y_AXIS} stroke="rebeccapurple" />
                <Line type="monotone" dataKey={Z_AXIS} stroke="steelblue" />
              </>
              : <Line 
                type="monotone" 
                dataKey={health === TEMPERATURE 
                  ? TEMPERATURE
                  : health === PRESSURE
                    ? PRESSURE
                    : health === HUMIDITY
                      ? HUMIDITY
                      : undefined
                }
                stroke={health === TEMPERATURE 
                  ? "olivedrab"
                  : health === PRESSURE
                    ? "hotpink"
                    : health === HUMIDITY
                      ? "tomato"
                      : undefined
                }
              />
            }
          </LineChart>
        </Col>
      </Row>
    </Card>
  )
}

export default Graph

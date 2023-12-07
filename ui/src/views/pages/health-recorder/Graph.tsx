import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { LineChart, XAxis, Tooltip, CartesianGrid, YAxis, Line } from 'recharts'
import Swal from 'sweetalert2'

import { useGetMachinesQuery, useUpdateMachineMutation } from '../../../redux/api/machinesApiSlice'
import { Machine, emptyMachine } from '../../../types/domain/machine.model'
import { mqttConnect, mqttDisconnect, mqttSub, mqttUnSub } from '../../../mqtt/mqttClient'
import { alerts } from '../../components/feedback/alerts'

import { healthCheckerMqttOptions, standardInterval } from './consts/mqtt.const'
import { devices } from './mocks/devices.mocks'
import { 
  TEMPERATURE,
  VIBRATION,
  PRESSURE,
  HUMIDITY,
  X_AXIS,
  Y_AXIS,
  Z_AXIS,
  HEALTH_CHECK_TOPIC,
} from './consts'
import { 
  getDeviceSelectOptions, 
  getErrMsg, 
  getLineChartData, 
  getUpdatedMachineFromMessage, 
  getVibrationChartData, 
  mqttPublishHealthCheck 
} from './utils/utils'

const Graph = () => {
  const { id } = useParams()

  const [health, setHealth] = useState<string>(TEMPERATURE)
  const [recording, setRecording] = useState<boolean>(false)
  const [cardWidth, setCardWidth] = useState<number | undefined>(undefined)
  const [client, setClient] = useState<any>(undefined)

  const cardRef = useRef<HTMLDivElement>(null)
  const machineRef = useRef<Machine>(emptyMachine)

  const { machine } = useGetMachinesQuery("machinesList", {
    selectFromResult: ({ data }: any) => ({
      machine: data?.find((machine: Machine) => machine.id === id)
    }),
    refetchOnMountOrArgChange: true,
    pollingInterval: (standardInterval - 1) * 1000
  })

  const [updateMachine, {
    isSuccess,
    isError,
    error
  }] = useUpdateMachineMutation()

  useEffect(() => {
    const handleResize = () => {
      if (cardRef.current) {
        const width = cardRef.current.clientWidth
        setCardWidth(width)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (client && recording) {
      client.on('message', async (topic: string, message: string) => {
        const machineToUpdate = machineRef.current === emptyMachine ? machine : machineRef.current
        const updatedMachine = getUpdatedMachineFromMessage({
          message, 
          machine: machineToUpdate
        })
        machineRef.current = updatedMachine
        await updateMachine(updatedMachine)
        console.log(`received message: ${message} from topic: ${topic}`)
      })
    }
  }, [client, recording])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    const device = devices.find(device => device.name === health)
  
    if (recording && device) {
      mqttSub({ client, topic: HEALTH_CHECK_TOPIC, qos: 2 })
      intervalId = setInterval(() => {
        const checkOptions = getDeviceSelectOptions({ devices: [device] })
        const newMachine = machineRef.current === emptyMachine ? machine : machineRef.current
        mqttPublishHealthCheck({ 
          client, 
          machine: newMachine, 
          checkOptions 
        })
      }, standardInterval * 1000)
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId)
      mqttUnSub({ client, topic: HEALTH_CHECK_TOPIC, qos: 2 })
      mqttDisconnect({ client })
    }
  }, [recording])

  if (isError && error) alerts.errorAlert(`${getErrMsg(error)}`, "Error")
  if (isSuccess) Swal.close()

  const vibrationData = getVibrationChartData(machine?.vibration?.recordings)
  const lineChartData = getLineChartData(health, machine)

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
            onClick={() => setHealth(VIBRATION)}
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
      <div ref={cardRef}>
        <Row className='ml-4'>
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
        <Row className='ml-4 mt-2'>
          <Col>
            <Button
              type='button'
              color={recording ? 'danger' : 'success'}
              size='sm'
              onClick={() => {
                if (!recording) {
                  const newClient = mqttConnect({
                    options: healthCheckerMqttOptions,
                    uri: import.meta.env.VITE_HIVE_URI
                  })
                  setClient(newClient)
                }
                setRecording(!recording)
              }}
            >
              {recording ? 'Stop Recording' : 'Record Live'}
            </Button>
          </Col>
        </Row>
        <Row className='p-4'>
          <Col>
            <LineChart 
              width={cardWidth ? Math.floor(cardWidth * 0.9) : 600} 
              height={300} 
              data={health === VIBRATION 
                ? vibrationData?.slice(-20) 
                : lineChartData.data?.slice(-20)
              }
              margin={{ right: 20, left: 10 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid stroke="#f5f5f5" />
              {health === VIBRATION
                ? <>
                  <Line type="monotone" dataKey={X_AXIS} stroke="red" />
                  <Line type="monotone" dataKey={Y_AXIS} stroke="rebeccapurple" />
                  <Line type="monotone" dataKey={Z_AXIS} stroke="steelblue" />
                </>
                : <Line 
                  type="monotone" 
                  dataKey={lineChartData.dataKey}
                  stroke={lineChartData.stroke}
                />
              }
            </LineChart>
          </Col>
        </Row>
      </div>
    </Card>
  )
}

export default Graph

import { useState, useEffect, useRef, MouseEvent } from 'react'
import { Row, Input, Col, Button, Card, CardHeader, CardBody, CardImg } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { 
  getErrMsg, 
  getUpdatedMachineFromRef,
  getValueColor,
  mqttConnect,
  mqttDisconnect,
  mqttPublish,
  mqttSub,
  mqttUnSub
} from '../utils/utils'

import tempJpg from '../../assets/img/temp.jpg'
import { useGetMachinesQuery, useUpdateMachineMutation } from '../../redux/api/machinesApiSlice'
import { alerts } from '../../components/feedback/alerts'
import { Machine, emptyMachine } from '../../types/domain/machine.model'
import { ReactTable } from '../../components/react-table/ReactTable'
import { machinesTableColumns } from '../tables/Machines.table'

const HealthChecker = () => {
  const [client, setClient] = useState<any>(null)
  const [payload, setPayload] = useState<any>({})
  const [requiredInterval, setRequiredInterval] = useState<number>(1)
  const [running, setRunning] = useState<boolean>(false)
  const [selectedMachine, setSelectedMachine] = useState<Machine | undefined>(undefined)

  const machineRef = useRef(emptyMachine)

  const navigate = useNavigate()

  const {
    data: machines,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetMachinesQuery('machinesList', {
    pollingInterval: 75000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true
  })

  const [updateMachine, {
    isSuccess: updateSuccess,
    isError: isUpdateError,
    error: updateError
  }] = useUpdateMachineMutation()

  useEffect(() => {
    if (client) {
      client.on('connect', () => console.log('connection successful'))
      client.on('error', (err: string) => {
        console.error('Connection error: ', err)
        client.end()
      })
      client.on('message', async (topic: string, message: string) => {
        if (machineRef.current === emptyMachine) return
        const messageObj = JSON.parse(message)
        const updatedMachine = getUpdatedMachineFromRef(message, machineRef.current)
        await updateMachine(updatedMachine)
        setPayload(messageObj)
        setSelectedMachine(updatedMachine)
        console.log(`received message: ${message} from topic: ${topic}`)
      })
    }
  }, [client, running])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
  
    if (running) {
      mqttSub(client)
      intervalId = setInterval(() => {
        mqttPublish(client, selectedMachine)
      }, requiredInterval * 1000)
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId)
      mqttUnSub(client)
      mqttDisconnect(client)
    }
  }, [running, requiredInterval])

  useEffect(() => {
    if (selectedMachine) machineRef.current = selectedMachine
  }, [selectedMachine])

  const onPickMachine = (e: MouseEvent) => {
    e.preventDefault()
    const { id } = e.currentTarget
    const machineToCheck: Machine | undefined = machines.find(
      (machine: Machine) => machine.id === id
    )
    if (machineToCheck) setSelectedMachine(machineToCheck)
  }

  if (isLoading) alerts.loadingAlert("Fetching machines", "Loading...")
  if (isError) alerts.errorAlert(`${getErrMsg(error)}`, "Error")
  if (isUpdateError && updateError) alerts.errorAlert(`${getErrMsg(updateError)}`, "Error")
  if (isSuccess || updateSuccess) Swal.close()

  return (
    <Card>
      <CardHeader>
        <Row>
          <Col>
            <span className='heading'>Machine Health Recorder</span>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md="8">
            <Card className='p-4'>
              <Row>
                <Col>
                  <Row>
                    <Col>
                      <label 
                        className="form-control-label" 
                        htmlFor='required-interval'
                      >
                        Interval in seconds
                      </label>
                    </Col>
                  </Row>
                  <Row className='mb-2'>
                    <Col>
                      <Input 
                        type='number'
                        name='required-interval'
                        min={1}
                        value={requiredInterval}
                        onChange={(e) => setRequiredInterval(+e.target.value)}
                      />
                    </Col>
                    <Col>
                      {!running 
                        ? <Button
                          type='button'
                          color={selectedMachine ? 'success' : undefined}
                          disabled={!selectedMachine}
                          onClick={() => {
                            mqttConnect({ setClient })
                            setRunning(true)
                          }}
                        >
                          Start Recording
                        </Button>
                        : <Button
                          type='button'
                          color='danger'
                          onClick={() => setRunning(false)}
                        >
                          Stop Recording
                        </Button>
                      }
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
            <Card className='p-4'>
              <ReactTable 
                data={machines || []}
                columns={machinesTableColumns({
                  onPickButtonClick: onPickMachine,
                })}
              />
            </Card>
          </Col>
          <Col md="4">
            <Card className='pb-4'>
              <CardImg alt="temperature-icon" src={tempJpg} top />
              <Row>
                <Col className='heading text-center mt-4'>
                  {selectedMachine ? selectedMachine.name : 'Pick Machine'}
                </Col>
              </Row>
              {selectedMachine && 
                <Row className='mt-2'>
                  <Col className='text-center'>
                    <Button
                      color='info'
                      size='sm'
                      type='button'
                      onClick={() => navigate(`/infograph/${selectedMachine.id}`)}
                    >
                      View Charts
                    </Button>
                  </Col>
                </Row>
              }
              <Row>
                <Col>
                  <div className="card-profile-stats d-flex justify-content-center">
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.temperature?.temperature, 
                            machineRef?.current?.temperature.min, 
                            machineRef?.current?.temperature.max
                          )
                        }}
                        className="heading"
                      >
                        {payload?.temperature && `${payload.temperature.temperature}` + '\u00B0C'}
                      </span>
                      <span className="description">Temperature</span>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.vibration?.x_axis, 
                            machineRef?.current?.vibration.min.x_axis, 
                            machineRef?.current?.vibration.max.x_axis
                          )
                        }}
                        className="heading"
                      >
                        {payload?.vibration && `${payload.vibration.x_axis}g`}
                      </span>
                      <span className="description">X-Axis Vibration</span>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="card-profile-stats d-flex justify-content-center">
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.vibration?.y_axis, 
                            machineRef?.current?.vibration?.min.y_axis, 
                            machineRef?.current?.vibration?.max.y_axis
                          )
                        }}
                        className="heading"
                      >
                        {payload?.vibration && `${payload.vibration.y_axis}g`}
                      </span>
                      <span className="description">Y-Axis Vibration</span>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.vibration?.z_axis, 
                            machineRef?.current?.vibration?.min.z_axis, 
                            machineRef?.current?.vibration?.max.z_axis
                          )
                        }}
                        className="heading"
                      >
                        {payload?.vibration && `${payload.vibration.z_axis}g`}
                      </span>
                      <span className="description">Z-Axis Vibration</span>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="card-profile-stats d-flex justify-content-center">
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.pressure?.pressure, 
                            machineRef?.current?.pressure.min, 
                            machineRef?.current?.pressure.max
                          )
                        }}
                        className="heading"
                      >
                        {payload?.temperature && `${payload?.pressure.pressure}kPa`}
                      </span>
                      <span className="description">Pressure</span>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.humidity?.humidity, 
                            machineRef?.current?.humidity.min, 
                            machineRef?.current?.humidity.max
                          )
                        }}
                        className="heading"
                      >
                        {payload?.temperature && `${payload.humidity.humidity}%`}
                      </span>
                      <span className="description">Humidity</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default HealthChecker

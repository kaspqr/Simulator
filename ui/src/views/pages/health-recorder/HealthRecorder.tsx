import { useState, useEffect, useRef, MouseEvent } from 'react'
import { Row, Input, Col, Button, Card, CardHeader, CardBody, CardImg } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

import { healthCheckerMqttOptions, standardInterval } from './consts/mqtt.const'
import { machinesTableColumns } from './tables/Machines.table'
import { HEALTH_CHECK_TOPIC } from './consts'
import { deviceSelectOptions } from './mocks/devices.mocks'
import { 
  getErrMsg, 
  getUpdatedMachineFromMessage,
  getValueColor,
  mqttPublishHealthCheck,
} from './utils/utils'

import { alerts } from '../../components/feedback/alerts'
import { ReactTable } from '../../components/react-table/ReactTable'
import { SelectField } from '../../components/select-field/SelectField'

import tempJpg from '../../../assets/img/temp.jpg'
import { mqttConnect, mqttDisconnect, mqttSub, mqttUnSub } from '../../../mqtt/mqttClient'
import { useGetMachinesQuery, useUpdateMachineMutation } from '../../../redux/api/machinesApiSlice'
import { Machine, emptyMachine } from '../../../types/domain/machine.model'
import { SelectOption } from '../../../types/ui/common-ui'

const HealthRecorder = () => {
  const [client, setClient] = useState<any>(null)
  const [payload, setPayload] = useState<any>({})
  const [requiredInterval, setRequiredInterval] = useState<number>(standardInterval)
  const [running, setRunning] = useState<boolean>(false)
  const [selectedMachine, setSelectedMachine] = useState<Machine | undefined>(undefined)
  const [selectedDevices, setSelectedDevices] = useState<SelectOption[]>([])

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
      client.on('message', async (topic: string, message: string) => {
        if (machineRef.current === emptyMachine) return
        const messageObj = JSON.parse(message)
        const updatedMachine = getUpdatedMachineFromMessage({ 
          message, 
          machine: machineRef.current 
        })
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
      mqttSub({ client, topic: HEALTH_CHECK_TOPIC, qos: 2 })
      intervalId = setInterval(() => {
        mqttPublishHealthCheck({ 
          client, 
          machine: selectedMachine, 
          checkOptions: selectedDevices 
        })
      }, requiredInterval * 1000)
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId)
      mqttUnSub({ client, topic: HEALTH_CHECK_TOPIC, qos: 2 })
      mqttDisconnect({ client })
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

  const canRecord: boolean = selectedMachine !== undefined && 
    selectedDevices.length > 0 && 
    requiredInterval >= 3

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
                  <Row className='mb-3'>
                    <Col>
                      <label 
                        className="form-control-label" 
                        htmlFor='required-interval'
                      >
                        Interval in seconds (min. 3)
                      </label>
                      <Input 
                        disabled={running}
                        type='number'
                        name='required-interval'
                        min={3}
                        value={requiredInterval}
                        onChange={(e) => setRequiredInterval(+e.target.value)}
                      />
                    </Col>
                    <Col>
                      <SelectField 
                        id="devices"
                        label="Devices"
                        options={deviceSelectOptions}
                        isMulti
                        value={selectedDevices}
                        onChange={(newValue: unknown) => {
                          if (newValue) {
                            const options = newValue as SelectOption[]
                            setSelectedDevices(options)
                          }
                        }}
                      />
                    </Col>
                  </Row>
                  <Row className='mb-2'>
                    <Col />
                    <Col className='text-right'>
                      {!running 
                        ? <Button
                          type='button'
                          color={canRecord
                            ? 'success' 
                            : undefined
                          }
                          disabled={!canRecord}
                          onClick={() => {
                            const newClient = mqttConnect({
                              options: healthCheckerMqttOptions,
                              uri: import.meta.env.VITE_HIVE_URI
                            })
                            setClient(newClient)
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
                            machineRef?.current?.temperature?.min, 
                            machineRef?.current?.temperature?.max
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
                            machineRef?.current?.vibration?.min?.x_axis, 
                            machineRef?.current?.vibration?.max?.x_axis
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
                            machineRef?.current?.vibration?.min?.y_axis, 
                            machineRef?.current?.vibration?.max?.y_axis
                          )
                        }}
                        className="heading"
                      >
                        {payload?.vibration && `${payload.vibration?.y_axis}g`}
                      </span>
                      <span className="description">Y-Axis Vibration</span>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.vibration?.z_axis, 
                            machineRef?.current?.vibration?.min?.z_axis, 
                            machineRef?.current?.vibration?.max?.z_axis
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
                            machineRef?.current?.pressure?.min, 
                            machineRef?.current?.pressure?.max
                          )
                        }}
                        className="heading"
                      >
                        {payload?.pressure && `${payload?.pressure?.pressure}kPa`}
                      </span>
                      <span className="description">Pressure</span>
                    </div>
                    <div>
                      <span 
                        style={{ 
                          textTransform: "none",
                          color: getValueColor(
                            payload?.humidity?.humidity, 
                            machineRef?.current?.humidity?.min, 
                            machineRef?.current?.humidity?.max
                          )
                        }}
                        className="heading"
                      >
                        {payload?.humidity && `${payload.humidity.humidity}%`}
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

export default HealthRecorder

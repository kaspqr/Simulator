import { useState, useEffect, useRef } from 'react'
import { Row, Input, Col, Button, Card, CardHeader, CardBody, CardImg } from 'reactstrap'
import mqtt from 'mqtt'
import MachineRow from '../../components/MachineRow'
import tempJpg from '../../assets/img/temp.jpg'

import { useGetMachinesQuery, useUpdateMachineMutation } from '../../redux/api/machinesApiSlice'
import Swal from 'sweetalert2'
import { Machine, emptyMachine } from '../../types/domain/machine.model'
import { alerts } from '../../components/feedback/alerts'

import { getErrMsg } from './utils/utils'

const TemperatureChecker = () => {
  const [client, setClient] = useState<any>(null)
  const [payload, setPayload] = useState<any>({})
  const [requiredInterval, setRequiredInterval] = useState<number>(1)
  const [running, setRunning] = useState<boolean>(false)
  const [selectedMachine, setSelectedMachine] = useState<Machine | undefined>(undefined)

  const currentMachine = useRef(emptyMachine)

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
      client.on('connect', () => {
        console.log('connection successful')
      })

      client.on('error', (err: string) => {
        console.error('Connection error: ', err)
        client.end()
      })

      client.on('message', async (topic: string, message: number) => {
        const newPayload = { topic, message: message.toString() }

        if (currentMachine.current === emptyMachine) return

        const newRecording = {
          timestamp: new Date(Date.now()).getTime(),
          device_id: "D5555",
          temperature: {
            value: +newPayload.message,
            unit: "Celsius"
          }
        }

        const updatedMachine = {
          ...currentMachine.current,
          temperature_recordings: [
            ...currentMachine.current.temperature_recordings, 
            newRecording
          ]
        }

        await updateMachine(updatedMachine)

        setPayload(newPayload)
        setSelectedMachine(updatedMachine)

        console.log(`received message: ${newPayload.message} from topic: ${newPayload.topic}`)
      })
    }
  }, [client, running])

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
  
    if (running) {
      mqttSub()
      intervalId = setInterval(() => {
        mqttPublish()
      }, requiredInterval * 1000)
    }
  
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
  
      mqttUnSub()
      mqttDisconnect()
    }
  }, [running, requiredInterval])

  useEffect(() => {
    if (selectedMachine) currentMachine.current = selectedMachine
  }, [selectedMachine])

  const mqttSub = () => {
    if (client) {
      const topic = "machineTemperature"
      const qos = 2

      client.subscribe(topic, qos, (error: string) => {
        if (error) {
          console.log('Subscribe to topics error', error)
          return
        }
        console.log(`Subscribe to topic: ${topic}`)
      })
    }
  }

  const mqttUnSub = () => {
    if (client) {
      const topic = "machineTemperature"
      const qos = 2

      client.unsubscribe(topic, qos, (error: any) => {
        if (error) {
          console.log('Unsubscribe error', error)
          return
        }
        console.log(`unsubscribed topic: ${topic}`)
      })
    }
  }

  const mqttPublish = () => {
    if (client && selectedMachine) {
      const topic = "machineTemperature"
      const qos = 2
      const temp = selectedMachine.normal_temperature
      const increase = Math.random() > 0.5
      const difference = (temp * 0.1 * Math.random()).toFixed(1)
      const newPayload = increase ? (temp + (+difference)).toString() : (temp - (+difference)).toString()

      client.publish(topic, newPayload, { qos }, (error: any) => {
        if (error) {
          console.log('Publish error: ', error)
        }
      })
    }
  }

  const mqttConnect = () => {
    const options = {
      clean: true,
      reconnectPeriod: 1000, // ms
      connectTimeout: 30 * 1000, // ms
    }

    setClient(mqtt.connect(import.meta.env.VITE_HIVE_URI, options))
  }

  const mqttDisconnect = () => {
    if (client) {
      try {
        client.end(false, () => {
          console.log('disconnected successfully')
        })
      } catch (error) {
        console.log('disconnect error:', error)
      }
    }
  }

  if (isLoading) {
    alerts.loadingAlert("Fetching machines", "Loading...")
    return
  }

  if (isError) {
    alerts.errorAlert(`${getErrMsg(error)}`, "Error")
    return
  }

  if (isUpdateError && updateError) {
    alerts.errorAlert(`${getErrMsg(updateError)}`, "Error")
    return
  }

  if (isSuccess || updateSuccess) Swal.close()

  return (
    <Card>
      <CardHeader>
        <Row>
          <Col>
            <span className='heading'>Temperature Recorder</span>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <Row>
          <Col md="8">
            {machines?.map((machine: any) => {
              return (
                <MachineRow 
                  key={machine.id} 
                  machine={machine}
                  setSelectedMachine={setSelectedMachine}
                />
              )
            })}
            <Row className='mt-4'>
              <Col>
                <Row>
                  <Col>
                    <span className="form-control-label">
                      {selectedMachine ? selectedMachine?.name : 'Pick a machine to record'}
                    </span>
                  </Col>
                </Row>
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
                </Row>
                <Row className='mb-4'>
                  <Col>
                    {!running 
                      ? <Button
                        type='button'
                        color={selectedMachine ? 'info' : undefined}
                        disabled={!selectedMachine}
                        onClick={() => {
                          mqttConnect()
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
              <Col 
                style={{ fontSize: "50px", color: "orange" }} 
                className="heading text-center"
              >
                {payload?.message && payload?.message + '\u00B0C'}
              </Col>
            </Row>
          </Col>
          <Col md="4">
            <Card>
              <CardImg alt="temperature-icon" src={tempJpg} top />
              <Row>
                <Col>
                  <div className="card-profile-stats d-flex justify-content-center">
                    <div>
                      <span className="heading">{machines?.length}</span>
                      <span className="description">Machines</span>
                    </div>
                    <div>
                      <span className="heading">0</span>
                      <span className="description">Warnings</span>
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

export default TemperatureChecker

import mqtt from 'mqtt'
import { Dispatch, SetStateAction } from 'react'

import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { 
  HumidityRecording, 
  Machine, 
  PressureRecording, 
  TemperatureRecording, 
  VibrationRecording 
} from '../../types/domain/machine.model'

export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}

export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  )
}

export const getErrMsg = (error: FetchBaseQueryError | SerializedError) => {
  if (isFetchBaseQueryError(error)) {
    return 'error' in error ? error.error : JSON.stringify(error.data)
  } else if (isErrorWithMessage(error)) {
    return error.message
  }
}

export const getNewRecordingValue = (normalValue: number) => {
  const increase = Math.random() > 0.5
  const tempDifference = (normalValue * 0.1 * Math.random())
  const newValue = increase 
    ? normalValue + tempDifference
    : normalValue - tempDifference

  return newValue
}

export const getNewTemperatureRecording = (normalTemp: number, deviceId: string) => {
  const newTempValue = +getNewRecordingValue(normalTemp).toFixed(1)

  const newTemp: TemperatureRecording = {
    timestamp: new Date(Date.now()).getTime(),
    device_id: deviceId,
    temperature: newTempValue
  }

  return newTemp
}

export const getNewVibrationRecording = (
  normalVibration: Omit<VibrationRecording, "timestamp" | "device_id">, 
  deviceId: string
) => {
  const newVibrationX = +getNewRecordingValue(normalVibration.x_axis).toFixed(3)
  const newVibrationY = +getNewRecordingValue(normalVibration.y_axis).toFixed(3)
  const newVibrationZ = +getNewRecordingValue(normalVibration.z_axis).toFixed(3)

  const newVibration: VibrationRecording = {
    timestamp: new Date(Date.now()).getTime(),
    device_id: deviceId,
    x_axis: newVibrationX,
    y_axis: newVibrationY,
    z_axis: newVibrationZ
  }

  return newVibration
}

export const getNewPressureRecording = (normalPressure: number, deviceId: string) => {
  const newPressureValue = +getNewRecordingValue(normalPressure).toFixed(1)

  const newTemp: PressureRecording = {
    timestamp: new Date(Date.now()).getTime(),
    device_id: deviceId,
    pressure: newPressureValue
  }

  return newTemp
}

export const getNewHumidityRecording = (normalHumidity: number, deviceId: string) => {
  const newHumidityValue = +getNewRecordingValue(normalHumidity).toFixed(1)

  const newTemp: HumidityRecording = {
    timestamp: new Date(Date.now()).getTime(),
    device_id: deviceId,
    humidity: newHumidityValue
  }

  return newTemp
}

export const getUpdatedMachineFromRef = (message: string, machine: Machine) => {
  const messageObj = JSON.parse(message)

  const updatedMachine: Machine = {
    ...machine,
    temperature: {
      ...machine.temperature, 
      recordings: [ 
        ...machine.temperature.recordings,
        messageObj.temperature
      ]
    },
    vibration: {
      ...machine.vibration, 
      recordings: [ 
        ...machine.vibration.recordings,
        messageObj.vibration
      ]
    },
    pressure: {
      ...machine.pressure, 
      recordings: [ 
        ...machine.pressure.recordings,
        messageObj.pressure
      ]
    },
    humidity: {
      ...machine.humidity, 
      recordings: [ 
        ...machine.humidity.recordings,
        messageObj.humidity
      ]
    },
  }

  return updatedMachine
}

type MqttConnectProps = {
  setClient: Dispatch<SetStateAction<any>>
}

export const mqttConnect = ({ setClient }: MqttConnectProps) => {
  const options = {
    clean: true,
    reconnectPeriod: 1000, // ms
    connectTimeout: 30 * 1000, // ms
  }

  setClient(mqtt.connect(import.meta.env.VITE_HIVE_URI, options))
}

export const mqttDisconnect = (client: any) => {
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

export const mqttPublish = (client: any, selectedMachine: Machine | undefined) => {
  if (client && selectedMachine) {
    const topic = "healthCheck"
    const qos = 2

    const temperature = getNewTemperatureRecording(selectedMachine.temperature.normal, "D5555")
    const vibration = getNewVibrationRecording(selectedMachine.vibration.normal, "D1234")
    const pressure = getNewPressureRecording(selectedMachine.pressure.normal, "D5678")
    const humidity = getNewHumidityRecording(selectedMachine.humidity.normal, "D9999")

    const newPayload = JSON.stringify({ temperature, vibration, pressure, humidity })

    client.publish(topic, newPayload, { qos }, (error: any) => {
      if (error) {
        console.log('Publish error: ', error)
      }
    })
  }
}

export const mqttUnSub = (client: any) => {
  if (client) {
    const topic = "healthCheck"
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

export const mqttSub = (client: any) => {
  if (client) {
    const topic = "healthCheck"
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

export const getValueColor = (value: number, min: number, max: number) => {
  return value < min || value > max ? "red" : undefined
}

export const getChartData = (recordings: any, key: string) => {
  const data = recordings?.map((recording: any) => {
    return {
      name: new Date(recording?.timestamp).toLocaleString(),
      [key]: recording?.[key]
    }
  })
  return data
}

export const getVibrationChartData = (recordings: any) => {
  const data = recordings?.map((recording: any) => {
    return {
      name: new Date(recording?.timestamp).toLocaleString(),
      xAxis: recording?.x_axis,
      yAxis: recording?.y_axis,
      zAxis: recording?.z_axis
    }
  })
  return data
}

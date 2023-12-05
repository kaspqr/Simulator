import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { 
  Machine, 
  Recording, 
  VibrationRecording 
} from '../../types/domain/machine.model'
import { mqttPublish } from '../../mqtt/mqttClient'
import { HEALTH_CHECK_TOPIC, HUMIDITY, HUMIDITY_CHECK_DEVICE_ID, PRESSURE, PRESSURE_CHECK_DEVICE_ID, TEMPERATURE, TEMPERATURE_CHECK_DEVICE_ID, VIBRATION, VIBRATION_CHECK_DEVICE_ID } from '../consts'
import { SelectOption } from '../../types/ui/common-ui'

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

type HealthRecording = {
  record: string;
  normal: number; 
  deviceId: string;
  toFixedLength: number;
}

export const getNewHealthRecording = ({
  record,
  normal,
  deviceId,
  toFixedLength
}: HealthRecording) => {
  const newValue = +getNewRecordingValue(normal).toFixed(toFixedLength)
  const newRecording: Recording = {
    timestamp: new Date(Date.now()).getTime(),
    device_id: deviceId,
    [record]: newValue
  }

  return newRecording
}

type VibrationRecordingProps = {
  normalVibration: Omit<VibrationRecording, "timestamp" | "device_id">;
  deviceId: string;
}

export const getNewVibrationRecording = ({
  normalVibration, 
  deviceId
}: VibrationRecordingProps) => {
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

export const getUpdatedMachineFromRef = (message: string, machine: Machine) => {
  const messageObj = JSON.parse(message)

  console.log(messageObj)

  const updatedMachine: Machine = {
    ...machine,
    temperature: {
      ...machine.temperature, 
      recordings: messageObj.temperature 
        ? [ ...machine.temperature.recordings, messageObj.temperature ]
        : machine.temperature.recordings
    },
    vibration: {
      ...machine.vibration, 
      recordings: messageObj.vibration
        ? [ ...machine.vibration.recordings, messageObj.vibration ]
        : machine.vibration.recordings
    },
    pressure: {
      ...machine.pressure, 
      recordings: messageObj.pressure
        ? [ ...machine.pressure.recordings, messageObj.pressure ]
        : machine.pressure.recordings
    },
    humidity: {
      ...machine.humidity, 
      recordings: messageObj.humidity 
        ? [ ...machine.humidity.recordings, messageObj.humidity ]
        : machine.humidity.recordings
    },
  }

  return updatedMachine
}

type HealthCheckPublishProps = {
  client: any;
  machine: Machine | undefined;
  checkOptions: SelectOption[];
}

export const mqttPublishHealthCheck = ({
  client, 
  machine,
  checkOptions
}: HealthCheckPublishProps) => {
  if (client && machine) {
    const topic = HEALTH_CHECK_TOPIC
    const qos = 2

    const checks = checkOptions.map((option: SelectOption) => {
      return option.label.split(' ')[0].toLowerCase()
    })

    const temperature = checks.includes(TEMPERATURE) 
      ? getNewHealthRecording({ 
        record: TEMPERATURE, 
        normal: machine.temperature.normal, 
        deviceId: TEMPERATURE_CHECK_DEVICE_ID, 
        toFixedLength: 1 
      })
      : undefined
    const pressure = checks.includes(PRESSURE)
      ? getNewHealthRecording({ 
        record: PRESSURE, 
        normal: machine.pressure.normal, 
        deviceId: PRESSURE_CHECK_DEVICE_ID, 
        toFixedLength: 1 
      })
      : undefined
    const humidity = checks.includes(HUMIDITY)
      ? getNewHealthRecording({ 
        record: HUMIDITY, 
        normal: machine.humidity.normal, 
        deviceId: HUMIDITY_CHECK_DEVICE_ID, 
        toFixedLength: 1 
      })
      : undefined
    const vibration = checks.includes(VIBRATION)
      ? getNewVibrationRecording({
        normalVibration: machine.vibration.normal, 
        deviceId: VIBRATION_CHECK_DEVICE_ID
      })
      : undefined

      const newPayload = JSON.stringify({ 
        temperature, 
        vibration, 
        pressure, 
        humidity 
      })

    mqttPublish(client, newPayload, topic, qos)
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

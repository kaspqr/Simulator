import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import { SelectOption } from '../../../../types/ui/common-ui'
import { 
  Device,
  Machine, 
  MachineSingleValueHealth, 
  Recording, 
  VibrationRecording 
} from '../../../../types/domain/machine.model'

import { 
  PRESSURE, 
  TEMPERATURE, 
} from '../../../../common/consts'


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

type UpdateMachineProps = {
  message: string;
  machine: Machine;
}

export const getUpdatedMachineFromMessage = ({ message, machine }: UpdateMachineProps) => {
  const messageObj = JSON.parse(message)

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

  const stroke = key === TEMPERATURE 
    ? "olivedrab"
    : key === PRESSURE
      ? "hotpink"
      : "tomato"
  
  const chartData = {
    data,
    dataKey: key,
    stroke
  }

  return chartData
}

export const getLineChartData = (health: string, machine: Machine) => {
  const healthProperty = machine?.[health as keyof Machine] as MachineSingleValueHealth
  const recordings = healthProperty?.recordings
  const chartData = getChartData(recordings, health)
  return chartData
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

export const getDeviceSelectOptions = ({ devices }: { devices: Device[] }) => {
  const deviceSelectOptions: SelectOption[] = devices.map(device => {
    return { 
      value: device.id, 
      label: `${device.name.charAt(0).toUpperCase() + device.name.slice(1)} Recorder ${device.id}`
    }
  })

  return deviceSelectOptions
}

import { SelectOption } from "../../types/ui/common-ui"

import { 
  TEMPERATURE_CHECK_DEVICE_ID, 
  VIBRATION_CHECK_DEVICE_ID,
  PRESSURE_CHECK_DEVICE_ID, 
  HUMIDITY_CHECK_DEVICE_ID,
  TEMPERATURE,
  VIBRATION,
  PRESSURE,
  HUMIDITY
} from "../consts"

export const devices = [
  { name: TEMPERATURE, id: TEMPERATURE_CHECK_DEVICE_ID },
  { name: VIBRATION, id: VIBRATION_CHECK_DEVICE_ID },
  { name: PRESSURE, id: PRESSURE_CHECK_DEVICE_ID },
  { name: HUMIDITY, id: HUMIDITY_CHECK_DEVICE_ID },
]

export const deviceSelectOptions: SelectOption[] = devices.map(device => {
  return { 
    value: device.id, 
    label: `${device.name.charAt(0).toUpperCase() + device.name.slice(1)} Recorder ${device.id}`
  }
})

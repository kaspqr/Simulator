import { Device } from "../types/domain/machine.model"
import { 
  TEMPERATURE_CHECK_DEVICE_ID, 
  VIBRATION_CHECK_DEVICE_ID,
  PRESSURE_CHECK_DEVICE_ID, 
  HUMIDITY_CHECK_DEVICE_ID,
  TEMPERATURE,
  VIBRATION,
  PRESSURE,
  HUMIDITY
} from "../common/consts"
import { getDeviceSelectOptions } from "../views/pages/health-recorder/utils/utils"

export const devices: Device[] = [
  { name: TEMPERATURE, id: TEMPERATURE_CHECK_DEVICE_ID },
  { name: VIBRATION, id: VIBRATION_CHECK_DEVICE_ID },
  { name: PRESSURE, id: PRESSURE_CHECK_DEVICE_ID },
  { name: HUMIDITY, id: HUMIDITY_CHECK_DEVICE_ID },
]

export const deviceSelectOptions = getDeviceSelectOptions({ devices })

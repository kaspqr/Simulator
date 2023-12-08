import { 
  HEALTH_CHECK_TOPIC, 
  HUMIDITY, 
  HUMIDITY_CHECK_DEVICE_ID, 
  PRESSURE, 
  PRESSURE_CHECK_DEVICE_ID, 
  TEMPERATURE, 
  TEMPERATURE_CHECK_DEVICE_ID, 
  VIBRATION, 
  VIBRATION_CHECK_DEVICE_ID 
} from "../../common/consts";
import { Machine } from "../../types/domain/machine.model";
import { SelectOption } from "../../types/ui/common-ui";
import { getNewHealthRecording, getNewVibrationRecording } from "../../views/pages/health-recorder/utils/utils";
import { mqttPublish } from "../mqttClient";

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

      const payload = JSON.stringify({ temperature, vibration, pressure, humidity })

    mqttPublish({ client, topic, qos, payload })
  }
}

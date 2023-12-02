export interface Temperature {
  value: number;
  unit: string;
}

export interface TemperatureRecording {
  timestamp: number;
  device_id: string;
  temperature: Temperature;
}

export interface Machine {
  id: string;
  name: string;
  normal_temperature: number;
  temperature_recordings: TemperatureRecording[];
}

export const emptyTemperature: Temperature = {
  value: 0,
  unit: "Celcius"
}

export const emptyTemperatureRecording: TemperatureRecording = {
  timestamp: 0,
  device_id: "",
  temperature: emptyTemperature
}

export const emptyMachine: Machine = {
  id: "",
  name: "",
  normal_temperature: 0,
  temperature_recordings: []
}

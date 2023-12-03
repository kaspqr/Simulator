export interface Recording {
  timestamp: number;
  device_id: string;
}

export interface TemperatureRecording extends Recording {
  temperature: number;
}

export interface VibrationRecording extends Recording {
  x_axis: number; 
  y_axis: number; 
  z_axis: number;
}

export interface PressureRecording extends Recording {
  pressure: number;
}

export interface HumidityRecording extends Recording {
  humidity: number;
}

export interface Temperature {
  normal: number;
  min: number;
  max: number;
  unit: string;
  recordings: TemperatureRecording[];
}

export interface Vibration {
  normal: Omit<VibrationRecording, "timestamp" | "device_id">;
  min: Omit<VibrationRecording, "timestamp" | "device_id">;
  max: Omit<VibrationRecording, "timestamp" | "device_id">;
  unit: string;
  recordings: VibrationRecording[];
}

export interface Pressure {
  normal: number;
  min: number;
  max: number;
  unit: string;
  recordings: PressureRecording[];
}

export interface Humidity {
  normal: number;
  min: number;
  max: number;
  unit: string;
  recordings: HumidityRecording[];
}

export interface Machine {
  id: string;
  name: string;
  temperature: Temperature;
  vibration: Vibration;
  pressure: Pressure;
  humidity: Humidity;
}

export const emptyTemperature: Temperature = {
  normal: 0,
  min: 0,
  max: 0,
  unit: "C",
  recordings: []
}

export const emptyVibrationValue: Omit<VibrationRecording, "timestamp" | "device_id"> = {
  x_axis: 0,
  y_axis: 0,
  z_axis: 0,
}

export const emptyVibration: Vibration = {
  normal: emptyVibrationValue,
  min: emptyVibrationValue,
  max: emptyVibrationValue,
  unit: "g",
  recordings: []
}

export const emptyPressure: Pressure = {
  normal: 0,
  min: 0,
  max: 0,
  unit: "kPa",
  recordings: []
}

export const emptyHumidity: Humidity = {
  normal: 0,
  min: 0,
  max: 0,
  unit: "%",
  recordings: []
}

export const emptyMachine: Machine = {
  id: "",
  name: "",
  temperature: emptyTemperature,
  vibration: emptyVibration,
  pressure: emptyPressure,
  humidity: emptyHumidity
}

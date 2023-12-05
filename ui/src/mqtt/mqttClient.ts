import mqtt from "mqtt"

type Options = {
  clean: boolean;
  reconnectPeriod: number;
  connectTimeout: number;
}

type MqttConnectProps = {
  options: Options;
  uri: string;
}
  
export const mqttConnect = ({ options, uri }: MqttConnectProps) => {
  const client = mqtt.connect(uri, options)
  return client
}

export const mqttDisconnect = (client: any) => {
  if (client) client.end(false)
}

export const mqttPublish = (client: any, payload: string, topic: string, qos: number) => {
  if (client) client.publish(topic, payload, { qos })
}

export const mqttUnSub = (client: any, topic: string, qos: number) => {
  if (client) client.unsubscribe(topic, qos)
}

export const mqttSub = (client: any, topic: string, qos: number) => {
  if (client) client.subscribe(topic, qos)
}

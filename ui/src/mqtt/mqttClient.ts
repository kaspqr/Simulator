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

type DisconnectProps = {
  client: any;
}

type SubProps = DisconnectProps & {
  topic: string;
  qos: number;
}

type PublishProps = SubProps & {
  payload: string;
}
  
export const mqttConnect = ({ options, uri }: MqttConnectProps) => {
  const client = mqtt.connect(uri, options)
  return client
}

export const mqttDisconnect = ({client}: DisconnectProps) => {
  if (client) client.end(false)
}

export const mqttPublish = ({ client, payload, topic, qos }: PublishProps) => {
  if (client) client.publish(topic, payload, { qos })
}

export const mqttUnSub = ({ client, topic, qos }: SubProps) => {
  if (client) client.unsubscribe(topic, qos)
}

export const mqttSub = ({ client, topic, qos }: SubProps) => {
  if (client) client.subscribe(topic, qos)
}

// This module contains the alarm handling components
// Hydrogen alarms will be red, water alarms will be blue, pump status will be green
// Bitrode faults will be purple

import React from 'react';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import { red500, green500, purple500, blue500 } from 'material-ui/styles/colors';

const AlarmCard = props => {
  // Dataset is empty, return no card
  if (props.data.length===0) {
    return null
  }

  // Initialize empty alarm array
  let alarms = [];
  // Notify if any hydrogen sensors are triggering
  ['h2lab','h2duct','h2upstairs'].forEach(sensor => {
    if (props.data[sensor]) {
      alarms.push(H2Alarm(sensor))
    }
  });
  // Notify if any water sensors are triggering
  ['water1','water2'].forEach(sensor => {
    if (props.data[sensor]) {
      alarms.push(WaterAlarm(sensor))
    }
  });
  // Notify if AC vent is running
  if (props.data['acvent']) {
    alarms.push(ACAlarm('acvent'))
  }
  // Notify if any pumps are offline
  props.bathList.forEach(bath => {
    if (!props.data['pump' + bath]) {
      //alarms.push(PumpAlarm(bath))
    }
  });
  // Notify if any Bitrode circuits are throwing a fault
  props.data.bitrode
  .filter(o => o.Mode!=='CHRG' && o.Mode!=='DCHG' && o.Mode!=='REST' && o.Mode!=='DONE')
  .forEach(i => alarms.push(BitrodeFault(i.Circuit)))

  // No alarms, return all good response
  if (alarms.length===0) {
    alarms = AllGood()
  };

  return (
    <Card>
      <CardHeader title='Alarms and Faults'/>
      <CardMedia className='container'>
        {alarms}
      </CardMedia>
    </Card>
  )
}

function H2Alarm(sensor) {
  return (
    <p style={{color: red500}} key={sensor}><b>
      H2 sensor {sensor} is triggering an alarm
    </b></p>
  )
}
function WaterAlarm(sensor) {
  return (
    <p style={{color: blue500}} key={sensor}><b>
      Water sensor {sensor} is triggering an alarm
    </b></p>
  )
}
function ACAlarm(ac) {
  return (
    <p style={{color: blue500}} key={ac}><b>
      AC vent is running
    </b></p>
  )
}
function PumpAlarm(pump) {
  return (
    <p style={{color: green500}} key={pump}>
      Pump {pump} is offline
    </p>
  )
}
function BitrodeFault(circuit) {
  return (
    <p style={{color: purple500}} key={circuit}>
      Bitrode circuit {circuit} is throwing a fault
    </p>
  )
}
function AllGood() {
  return (
    <p style={{color: green500}}><b>
      No alarms or exceptions at this time!
    </b></p>
  )
}

export default AlarmCard;

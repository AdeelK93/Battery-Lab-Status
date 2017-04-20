// Worker functions for Real-time analysis of Bitrode data
// Generate datasets and dropdown list to select group for charting

import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import { onlyUnique } from './Charts';
import { BitrodeColorLine } from './BitrodeHelpers';
import { LineChart, hclColors } from './HistoryComponents';
import dateFormat from 'dateformat';
import { variance } from './Statistics';

// Array of line dashes that I think look nice (CanvasRenderingContext2D.setLineDash())
const lineDashes = [[0],[0,4,4],[0,1,2],[0,1,2,3],[0,1,2,3,4],[0,1,2,3,4,5]];

// List of circuits to display in the graph
const BitrodeDropdownList = (data, groupBy) => (
  data[data.length-1].bitrode // Latest record
  .map(record => record[groupBy])
  .filter(arr => arr!==undefined)
  .filter(onlyUnique)
  .map(group => <MenuItem value={group} primaryText={group} key={group} />)
)

// Filter down a key to a value, and then return a chart friendly dataset
function ChartjsBitrodeHistory(obj, key, val, labs, yAxis, hideDate) {
  const filtered = obj.map(record => record.bitrode.filter(o => o[key]===val));
  // Points overwhelm the line dashes if there are more than 50 points
  const showPoints = obj.length<50;
  // List of circuits to display in the graph
  var yList = obj[obj.length-1].bitrode
  .filter(o => o[key]===val)
  // Labels are either circuit labels or Battery ID
  // Depending on if the grouping is by Bitrode or Test
  .map(record => record[key==='Bitrode' ? labs : 'Battery ID']);

  if (key==='Test') {
    var colorLine = BitrodeColorLine(filtered[filtered.length-1])
    // Sort the filtered dataset by Battery ID
    yList.sort();
  }

  const xAxis = hideDate ? 'UTC:h:MM TT' : 'UTC:mmm d\nh:MM TT';
  // Array of colors to use in the graph
  const colors = hclColors(yList.length, 0.6);
  const colorsLight = hclColors(yList.length, 0.3);
  return {
    // X-axis is the timestamps, optionally with the date omitted from the label
    labels: obj.map(record => dateFormat(record.bitrodeupdated, xAxis)),
    datasets: yList.map(function(circuit) {
      // Colors and linetypes of each battery are formulaically determined by the grouping
      const color = key==='Bitrode' ? colors[yList.indexOf(circuit)] : colorLine[circuit].color;
      const colorLight = key==='Bitrode' ? colorsLight[yList.indexOf(circuit)] : colorLine[circuit].colorLight;
      const line = key==='Bitrode' ? 0 : colorLine[circuit].line;
      return {
        label: circuit,
        fill: false,
        lineTension: 0.1,
        pointRadius: showPoints ? 1 : 0,
        backgroundColor: colorLight,
        borderColor: color,
        pointBorderColor: color,
        borderDash: lineDashes[line],
        data: filtered.map(
          record => record.filter(group => group[key==='Bitrode' ? labs : 'Battery ID']===circuit)
          .map(circuit => circuit[yAxis])[0]
        )
      }
    })
  }
}

// Is the current or voltage more interesting to look at in a line graph?
// Best guess by calculating variance of both
function whatsInteresting(obj) {
  // Only look at batteries that are charging or discharging
  const filtered = obj
  .filter(record => record.Mode==='DCHG' || record.Mode==='CHRG')
  if (filtered.length===0) {
    return 'Voltage' // Default to voltage if everything at rest
  }
  if (filtered.filter(record => record.Mode==='DCHG').length!==0) {
    return 'Voltage' // Default to voltage if there are discharges
  }
  // Determine if the voltage or current voltage is greater
  const voltageVariance = variance(
    filtered.map(circuit => circuit.Voltage)
  )
  const currentVariance = variance(
    filtered.map(circuit => circuit.Current)
  )
  return voltageVariance>currentVariance ? 'Voltage' : 'Current'
}

// History card for use in dashboard
// Shows most recent current or voltage readings for particular test
const BitrodeHistoryCard = props => {
  // Is voltage or current more interesting to plot?
  const ylab = whatsInteresting(
    props.data.bitrode
    .filter(o => o[props.groupBy]===props.group)
  )
  return (
    <Card>
      <CardHeader title={props.group + ' ' + ylab}/>
      <CardMedia>
        <LineChart data={ChartjsBitrodeHistory(
          props.labHistory, props.groupBy, props.group, props.labs, ylab, true
        )} height={Math.max(280,(window.innerHeight/2)-110)}
        options={{maintainAspectRatio: false}} />
      </CardMedia>
    </Card>
  )
}

export { BitrodeDropdownList, ChartjsBitrodeHistory, BitrodeHistoryCard };

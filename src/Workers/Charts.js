/*
  This module contains all of the charting logic. All charts use charts.js
  The three chart types (Cycling, Temperature, Pie) each have two elements:
    * A chartjs function, which transforms the array for charts.js digestion
    * A card component, which serves as the reusable wrapper for the respective chart
  Also exports onlyUnique function to return uniques from an array
  The returned charts are of a fixed height, as a function of the viewport height at time of request
  This means you will need to refresh the page if you resize your window (unsure if this is an issue)

  To do:
    * Will split up this module when the bath API is ready
*/

import React from 'react';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import { Bar, Doughnut } from 'react-chartjs-2';
import dateFormat from 'dateformat';
import { bathList } from './Constants';

const red = 'rgba(255, 99, 132, 0.3)';
const yellow = 'rgba(255, 206, 86, 0.3)';
const green = 'rgba(75, 192, 192, 0.3)';
const blue = 'rgba(54, 162, 235, 0.3)';
const purple = 'rgba(153, 102, 255, 0.3)';

const ColorMode = {
  CHRG: green,
  DCHG: red,
  REST: yellow,
  DONE: blue
}

const CyclingCard = props => {
  // Dataset is empty, return no card
  if ((typeof props.val)==='undefined') {
    return null
  }
  return (
    <Card>
      <CardHeader title={props.title}/>
      <CardMedia>
        <Bar data={ChartjsCycling(props.data.bitrode, props.column, props.val, props.labs)}
          height={Math.max(280,(window.innerHeight/2)-110)}
          options={{maintainAspectRatio: false, legend: {display: false},
          tooltips: {
              callbacks: {label: (tooltip) => (tooltip.yLabel + ' Cycles')}
          },
          scales: {
            yAxes: [{ticks: {beginAtZero: true},
            scaleLabel: {display: true, labelString: 'Cycles Completed'}}]
          }
        }} />
      </CardMedia>
    </Card>
  )
}

const TemperatureCard = props => {
  // Dataset is empty, return no card
  if ((typeof props.val)==='undefined') {
    return null
  }
  return (
    <Card>
      <CardHeader title={props.title}/>
      <CardMedia>
        <Bar data={ChartjsTemperature(props.data.bitrode, props.column, props.val, props.labs)}
          height={Math.max(280,(window.innerHeight/2)-110)}
          options={{maintainAspectRatio: false, legend: {display: false},
          tooltips: {
              callbacks: {label: (tooltip) => (tooltip.yLabel + ' ºC')}
          },
          scales: {
            yAxes: [{scaleLabel: {display: true, labelString: 'Temperature (ºC)'}}]
          }
        }} />
      </CardMedia>
    </Card>
  )
}

const BathCard = props => {
  // Dataset is empty, return no card
  if (props.data.length===0) {
    return null
  }
  return (
    <Card>
      <CardHeader title={props.title}/>
      <CardMedia>
        <Bar data={ChartjsBath(props.data)}
          height={Math.max(280,(window.innerHeight/2)-110)}
          options={{maintainAspectRatio: false, legend: {display: false},
          tooltips: {
              callbacks: {label: (tooltip) => (tooltip.yLabel + ' ºC')}
          },
          scales: {
            yAxes: [{scaleLabel: {display: true, labelString: 'Temperature (ºC)'}}]
          }
        }} />
      </CardMedia>
    </Card>
  )
}

const PieCard = props => {
  // Dataset is empty, return no card
  if ((typeof props.val)==='undefined') {
    return null
  }
  return (
    <Card>
      <CardHeader title={props.title}/>
      <CardMedia>
        <Doughnut  data={ChartjsPie(props.data.bitrode, props.column, props.val)}
          height={Math.max(280,(window.innerHeight/2)-110)}
        options={{maintainAspectRatio: false}} />
      </CardMedia>
    </Card>
  )
}

// Filter down a key to a value, and then return a chart.js friendly dataset
function ChartjsCycling(obj, key, val, labs) {
  var filtered = obj.filter(o => o[key]===val)
  if (key==='Test') {
    // Sort the dataset by Battery ID, if grouped by test
    filtered = filtered.sort((a,b) => a['Battery ID'] < b['Battery ID'] ? -1 : 1)
  }
  return {
    labels: filtered.map(o => o[key==='Bitrode' ? labs : 'Battery ID']),
    datasets: [{
      backgroundColor: filtered.map(o => ColorMode[o.Mode] || purple),
      data: filtered.map(o => o.Cycle)
    }]
  }
}

// Same thing, but for temperature
function ChartjsTemperature(obj, key, val, labs) {
  var filtered = obj.filter(o => o[key]===val)
  if (key==='Test') {
    // Sort the dataset by Battery ID, if grouped by test
    filtered = filtered.sort((a,b) => a['Battery ID'] < b['Battery ID'] ? -1 : 1)
  }
  return {
    labels: filtered.map(o => o[key==='Bitrode' ? labs : 'Battery ID']),
    datasets: [{
      backgroundColor: red,
      data: filtered.map(o => o['Assignable Variable 1'])
    }]
  }
}

// Color code the bars for the bath status chart
function ChartjsBath(data) {
  return {
    labels: bathList,
    datasets: [{
      backgroundColor: bathList.map(
        bath => data['heater' + bath] ? red : blue
      ),
      data: bathList.map(
        bath => data['temp' + bath]
      )
    }]
  }
}

// Shows how what fraction of circuits are doing what
function ChartjsPie(obj, key, val) {
  const filtered = obj.filter(o => o[key]===val)
  return {
    labels: ['Charging','Discharging','Rest','Free','Fault'],
    datasets: [{
      backgroundColor: [green,red,yellow,blue,purple],
      data: [
        filtered.filter(o => o.Mode==='CHRG').length,
        filtered.filter(o => o.Mode==='DCHG').length,
        filtered.filter(o => o.Mode==='REST').length,
        filtered.filter(o => o.Mode==='DONE').length,
        filtered.filter(o => o.Mode!=='CHRG' && o.Mode!=='DCHG' && o.Mode!=='REST' && o.Mode!=='DONE').length
      ]
    }]
  }
}

// Returns unique values from an array
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const LastUpdatedFooter = props => (
  <p className='top-buffer'>
    Last updated {dateFormat(props.updated, 'UTC:m/d/yyyy h:MM:ss TT')}
  </p>
)

export { CyclingCard, TemperatureCard, BathCard, PieCard, onlyUnique, LastUpdatedFooter };

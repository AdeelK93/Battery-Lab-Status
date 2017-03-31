// This module plots history of bath temperature/status as a line graph
// The selected number of records is passed onto the REST api

import React from 'react';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import { RecordsDropdownList, DateTimeRow, LineChart, hclColors } from './HistoryComponents.js';
import { bathList, reloadRate } from './Constants.js';
import dateFormat from 'dateformat';

class BathHistoryCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      records: 10,
      yaxis: 'temp',
      bathData: this.props.labHistory || [],
      dateTime: ''
    };
  }
  // Begin polling database on a 5 minute timer
  componentWillMount() {
    // Initial poll only if the labHistory props is undefined, then every 5 minutes
    this.props.labHistory || this.pollBath();
    this._timer = setInterval(this.pollBath.bind(this), reloadRate);
  }
  // Clean up timer after destruction
  componentWillUnmount() {
    clearInterval(this._timer);
  }

  handleChangeRecords = (event, index, records) => {
    this.setState({records})
    this.pollBath(records)
  };
  handleChangeYaxis = (event, index, yaxis) => this.setState({yaxis});
  handleTimeTravel = dateTime => {
    this.setState({dateTime});
    this.pollBath(null, dateTime);
    clearInterval(this._timer); // No point in polling anymore
  };

  // Fetch the selected number of records from the REST api
  pollBath(records, dateTime) {
    // Use value stored in state if none provided
    records = records || this.state.records
    dateTime = dateTime || this.state.dateTime
    fetch(
      'api/pg/batterylabstatus?select=datetime,pump1,pump2,pump3,pump4,pump5,pump6,pump7,pump8,pump9,heater1,heater2,heater3,heater4,heater5,heater6,heater7,heater8,heater9,temp1,temp2,temp3,temp4,temp5,temp6,temp7,temp8,temp9,h2lab,h2duct,h2upstairs,water1,water2,h2alarm,acvent&order=datetime.desc&limit=' + records + dateTime,
      {credentials: 'same-origin'}
    )
    .then(res => res.json())
    .then(resjson => {
      // Order the array properly, since the REST query must reverse records
      // In order to fetch the most recent ones
      this.setState({ bathData: resjson.reverse()})
    }).catch(err => console.error(err));
  }

  render() {
    // Dataset is empty, return no card
    if (this.state.bathData.length===0) {
      return null
    }

    return (
      <Card>
        <CardHeader title='Bath History'/>
        <CardMedia>
          <p className='container-fluid'>
            Temperature is reported in Celsius, state is reported in binary (0 for off, 1 for on). <br/>
            You can also optionally travel back in time using the previous date and previous time dropdowns.
          </p>
          <div className='row container-fluid'>
            <div className='col-sm-4'>
              <SelectField
                floatingLabelText='Data to plot' value={this.state.yaxis}
                onChange={this.handleChangeYaxis} >
                <MenuItem value='temp' primaryText='Temperature' />
                <MenuItem value='heater' primaryText='Heater Status' />
                <MenuItem value='pump' primaryText='Pump Status' />
                <MenuItem value='h2' primaryText='H2 Alarms' />
                <MenuItem value='water' primaryText='Water Alarms' />
              </SelectField>
            </div>
            <div className='col-sm-4'>
              <RecordsDropdownList value={this.state.records} onChange={this.handleChangeRecords} />
            </div>
          </div>
          <DateTimeRow reload={() => this.pollBath(this.state.records)} callbackDateTime={this.handleTimeTravel}/>
          <LineChart data={ChartjsBathHistory(this.state.bathData,this.state.yaxis)}
            options={{
              tooltips: {
                  callbacks: {label: (tooltip, data) => bathHistoryTooltip(tooltip, data)}
              },
            scales: {yAxes: [{scaleLabel: {display: true, labelString: BathAlarmSwitch(this.state.yaxis)}}]}
          }} />
        </CardMedia>
      </Card>
    );
  }
}

// Charts.js friendly dataset for bath history line chart
function ChartjsBathHistory(data, yaxis) {
  // Points overwhelm the line dashes if there are more than 50 points
  const showPoints = data.length<50;
  // Create the array of sensors to plot
  let yList = [];
  switch (yaxis) {
    case 'h2':
      yList = ['h2alarm','h2lab','h2duct','h2upstairs','acvent'];
      break;
    case 'water':
      yList = ['water1','water2'];
      break;
    default:
      yList = bathList.map(bath => yaxis + bath);
      break;
  }
  // Array of colors to use in the graph
  const colors = hclColors(yList.length, 0.6);
  const colorsLight = hclColors(yList.length, 0.3);
  return {
    // Format x-axis timestamp in a readable way
    labels: data.map(record => dateFormat(record.datetime, 'UTC:mmm d\nh:MM TT')),
    datasets: yList.map(function(bath) {
      const color = colors[yList.indexOf(bath)];
      const colorLight = colorsLight[yList.indexOf(bath)];
      return {
        label: bath,
        fill: false,
        lineTension: 0.1,
        pointRadius: showPoints ? 1 : 0,
        backgroundColor: colorLight,
        borderColor: color,
        pointBorderColor: color,
        data: data.map(record => record[bath])
      }
    })
  }
}

// Clean up tooltips with degrees or boolean state
function bathHistoryTooltip(tooltip, data) {
  const label = data.datasets[tooltip.datasetIndex].label + ': ';
  if (label.search(/temp/)===0) {
    return label + data.datasets[tooltip.datasetIndex].data[tooltip.index] + ' ºC'
  }
  const value = data.datasets[tooltip.datasetIndex].data[tooltip.index] ? 'On' : 'Off';
  return label + value
}

// Replace the short bath/alarm name with more descriptive one
function BathAlarmSwitch(name) {
  switch (name) {
    case 'temp': return 'Temperature (ºC)'
    case 'heater': return 'Heater Status'
    case 'pump': return 'Pump Status'
    case 'h2': return 'H2 Alarms'
    case 'water': return 'Water Alarms'
    // Cannot derive the proper color name?
    default: return name
  }
}

export default BathHistoryCard;

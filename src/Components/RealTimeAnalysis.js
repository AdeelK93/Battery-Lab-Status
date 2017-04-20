// This module plots history of Bitrode cycling as a line graph
// The selected number of records is passed onto the REST api

import React from 'react';
import Material from '../MaterialTheme';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import { BitrodeDropdownList, ChartjsBitrodeHistory } from '../Workers/BitrodeHistory';
import { RecordsDropdownList, DateTimeRow, LineChart } from '../Workers/HistoryComponents';
import { BitrodeParse } from '../Workers/BitrodeHelpers';
import { reloadRate } from '../Workers/Constants';

class RealTimeAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      records: 25,
      yaxis: 'Voltage',
      bitrodeData: props.labHistory || [],
      dateTime: ''
    };
  }
  // Begin polling database on a 5 minute timer
  componentWillMount() {
    // Set initial value for group dropdown if labHistory was passed in props
    if (this.props.labHistory) {
      // Groups to pick from in drop down select list from lastest Bitrode record
      const DropDownList = this.props.labHistory[this.props.labHistory.length-1].bitrode
      .map(record => record[this.props.groupBy])
      .filter(arr => arr!==undefined)
      this.setState({ group: DropDownList[1] || DropDownList[0] }) // The || is to skip over Bitrode Midnight
    } else {
      // Initial poll only if the labHistory props is undefined, then every 5 minutes
      this.pollBitrode();
    }
    this._timer = setInterval(this.pollBitrode.bind(this), reloadRate);
  }
  // Clean up timer after destruction
  componentWillUnmount() {
    clearInterval(this._timer);
  }
  // Check if the current value for group is in the next version's dropdown list for groups
  componentWillUpdate(nextProps, nextState) {
    if (nextState.bitrodeData.length!==0) {
      // Groups to pick from in drop down select list from lastest Bitrode record
      const DropDownList = nextState.bitrodeData[nextState.bitrodeData.length-1].bitrode
      .map(record => record[nextProps.groupBy])
      .filter(arr => arr!==undefined)
      //.filter(onlyUnique)
      if (DropDownList.indexOf(nextState.group) === -1) {
        // Default value for group if group stored in state is not present in the drop down list
        this.setState({ group: DropDownList[1] || DropDownList[0] }) // The || is to skip over Bitrode Midnight
      }
    }
  }

  handleChangeRecords = (event, index, records) => {
    this.setState({records})
    this.pollBitrode(records)
  };
  handleChangeGroup = (event, index, group) => this.setState({group});
  handleChangeYaxis = (event, index, yaxis) => this.setState({yaxis});
  handleTimeTravel = dateTime => {
    this.setState({dateTime});
    this.pollBitrode(null, dateTime);
    clearInterval(this._timer); // No point in polling anymore
  };

  // Fetch the selected number of records from the REST api
  pollBitrode(records, dateTime) {
    // Use value stored in state if none provided
    records = records || this.state.records
    dateTime = dateTime || this.state.dateTime
    fetch(
      '/api/pg/batterylabstatus?select=bitrode,bitrodeupdated&order=datetime.desc&limit=' + records + dateTime,
      {credentials: 'same-origin'}
    )
    .then(res => res.json())
    .then(resjson => {
      // Order the array properly, since the REST query must reverse records
      // In order to fetch the most recent ones
      this.setState({ bitrodeData: resjson.map(record => BitrodeParse(record)).reverse() })
    }).catch(err => console.error(err));
  }

  render() {
    // Dataset is empty, return no card
    if (this.state.bitrodeData.length===0) {
      return null
    }

    return (
      <Material className='container-fluid'>
        <div className='col-sm-10 top-buffer'>
          <Card>
            <CardHeader title='Real-time Analysis'/>
            <CardMedia>
              <p className='container-fluid'>
                You can toggle between grouping by Bitrode or by Test in the menu options. <br/>
                You can also optionally travel back in time using the previous date and previous time dropdowns.
              </p>
              <div className='row container-fluid'>
                <div className='col-sm-4'>
                  <SelectField
                    floatingLabelText={this.props.groupBy + ' to filter'} value={this.state.group}
                    onChange={this.handleChangeGroup} >
                    {BitrodeDropdownList(this.state.bitrodeData, this.props.groupBy)}
                  </SelectField>
                </div>
                <div className='col-sm-4'>
                  <SelectField
                    floatingLabelText='Data to plot' value={this.state.yaxis}
                    onChange={this.handleChangeYaxis} >
                    <MenuItem value='Cycle' primaryText='Cycle' />
                    <MenuItem value='Step' primaryText='Step' />
                    <MenuItem value='Current' primaryText='Current' />
                    <MenuItem value='Voltage' primaryText='Voltage' />
                    <MenuItem value='Amp-Hours' primaryText='Capacity' />
                    <MenuItem value='Assignable Variable 1' primaryText='Temperature' />
                  </SelectField>
                </div>
                <div className='col-sm-4'>
                  <RecordsDropdownList value={this.state.records} onChange={this.handleChangeRecords} />
                </div>
              </div>
              <DateTimeRow reload={() => this.pollBitrode(this.state.records)} callbackDateTime={this.handleTimeTravel}/>
              <LineChart data={ChartjsBitrodeHistory(this.state.bitrodeData, this.props.groupBy, this.state.group, this.props.labs, this.state.yaxis, false)}
                options={{
                scales: {yAxes: [{scaleLabel: {display: true, labelString: this.state.yaxis.replace(/Assignable Variable 1/,'Temperature (ºC)')}}]}
              }} />
            </CardMedia>
          </Card>
          <br/>
        </div>
      </Material>
    );
  }
}

export default RealTimeAnalysis;

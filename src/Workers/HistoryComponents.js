// Reusable components for Bath and Bitrode history
// Also contains line chart container with more intelligent redraw logic

import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import dateFormat from 'dateformat';
import FlatButton from 'material-ui/FlatButton';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import { Line } from 'react-chartjs-2';
import isEqual from 'lodash.isequal';
import chroma from 'chroma-js';

// Reusable element for selecting the number of records to query
const RecordsDropdownList = props => {
  return(
    <SelectField
      floatingLabelText='Previous records to fetch' value={props.value}
      onChange={props.onChange} >
      <MenuItem value={10} primaryText='10' />
      <MenuItem value={25} primaryText='25' />
      <MenuItem value={50} primaryText='50' />
      <MenuItem value={100} primaryText='100' />
      <MenuItem value={250} primaryText='250' />
      <MenuItem value={500} primaryText='500' />
    </SelectField>
  )
}

// Reusable element for requerying the data and optionally travelling back in time
class DateTimeRow extends React.Component {
  constructor() {
    super();
    this.state = { date: null, time: null };
  }

  // Handle date and time updates
  handleDate = (event, date) => {
    this.setState({ date })
    this.handleDateTime(date, null)
  };
  handleTime = (event, time) => {
    this.setState({ time })
    this.handleDateTime(null, time)
  };
  // Send datetime up to parent if data and time are both selected
  handleDateTime = (date, time) => {
    // Use value stored in state if none provided
    date = date || this.state.date
    time = time || this.state.time
    if (date!==null && time!==null) {
      const isoDate = dateFormat(date,'isoDate');
      const isoTime = dateFormat(time,'isoTime');
      this.props.callbackDateTime('&datetime=lte.' + isoDate + 'T' + isoTime);
    }
  };

  render() {
    return (
      <div className='row container-fluid'>
        <div className='col-sm-4'>
          <DatePicker floatingLabelText='Previous date' value={this.state.date}
            onChange={this.handleDate} autoOk={true}
            minDate={new Date('2016-12-31')} maxDate={new Date()}
            locale='en-US' firstDayOfWeek={0} />
        </div>
        <div className='col-sm-4'>
          <TimePicker floatingLabelText="Previous time" value={this.state.time}
            onChange={this.handleTime} autoOk={true}
            pedantic={true} />
        </div>
        <div className='col-sm-4'>
          <FlatButton label='Refresh' labelPosition='after'
            icon={<Refresh />} onTouchTap={this.props.reload} />
        </div>
      </div>
    );
  }
}

// Chart.js Line container that has more intelligent redrawing logic
class LineChart extends React.Component {
  constructor() {
    super();
    this.state = { redraw: false };
  }
  // Check if the options have changed (such as the y-axis label)
  // Redraw everything if it has
  componentWillReceiveProps(nextProps) {
    this.setState({ redraw: !isEqual(this.props.options,nextProps.options) });
  }

  render() {
    return (
      <Line data={this.props.data} redraw={this.state.redraw}
        height={this.props.height || (window.innerWidth<450) ? 340 : null}
        options={this.props.options} />
    );
  }
}

// Template for chroma hcl color gradient, used in line charts
const chromaHcl = chroma.scale(['rgb(255, 179, 181)','rgb(107, 218, 189)','rgb(247, 176, 230)']).mode('hcl');
// Generate array of equispaced hcl colors at the target alpha values
const hclColors = (count, alpha) => chromaHcl
.colors(count)
.map(color => chroma(color).alpha(alpha).css());


export { RecordsDropdownList, DateTimeRow, LineChart, hclColors };

// The main dashboard cycles through each Bitrode's data every 6 seconds
// The environmental API has not yet been implemented
// Will remove progres bar if it takes up too many resources

import React from 'react';
import LinearProgress from 'material-ui/LinearProgress';
import Material from '../MaterialTheme';
import AlarmCard from '../Workers/Alarms';
import { BathCard, CyclingCard, PieCard, onlyUnique } from '../Workers/Charts';
import { BitrodeHistoryCard } from '../Workers/BitrodeHistory';
import { bathList } from '../Workers/Constants';
// Rate at which the charts are cycled through
const cycleRate = 6000;

class Dashboard extends React.Component {
  state = {
    currentGroup: '',
    indexGroup: 1
  };

  // Begin the timer when the component mounts
  componentDidMount() {
    this.startPollingDash();
  }
  // Clean up timer after destruction
  componentWillUnmount() {
    clearInterval(this._timer);
  }

  startPollingDash() {
    setTimeout(() => {
      this.pollDash(); // do it once and then every 6 seconds
      this._timer = setInterval(this.pollDash.bind(this), cycleRate);
    }, 400); // Is this 400ms a race condition?
  }

  // This function handles cycling through content
  pollDash() {
    if (this.props.data.length===0) {
      return
    }
    const GroupList = this.props.data.bitrode
    .map(o => o[this.props.groupBy])
    .filter(arr => arr!== undefined)
    .filter(onlyUnique)

    this.setState({
      currentGroup: GroupList[this.state.indexGroup % GroupList.length],
      indexGroup: ++this.state.indexGroup
    })
  }

  render() {
    if (this.props.data.length===0) {
      return <p>Connecting to server...</p>
    }
    return (
      <Material className='container-fluid'>
        <div className='row'>
          <div className='col-sm-5 top-buffer'>
            <AlarmCard data={this.props.data} bathList={bathList} />
          </div>
          <div className='col-sm-7 top-buffer'>
            <BathOrBitrodeHistory data={this.props.data} labHistory={this.props.labHistory}
              groupBy={this.props.groupBy} group={this.state.currentGroup} labs={this.props.labs} />
          </div>
        </div>

        <div className='row'>
          <div className='col-sm-8 top-buffer'>
            <CyclingCard title={this.props.groupBy + ' ' + this.state.currentGroup}
              data={this.props.data} labs={this.props.labs}
              column={this.props.groupBy} val={this.state.currentGroup} />
          </div>
          <div className='col-sm-4 top-buffer'>
            <PieCard title={this.props.groupBy + ' ' + this.state.currentGroup}
              data={this.props.data} column={this.props.groupBy} val={this.state.currentGroup} />
          </div>
        </div>
        <p/>
        <CycleProgress update={this.state.currentGroup} />
        <p/>
      </Material>
    );
  }
}

class CycleProgress extends React.Component {
  state = {completed: 0};

  // Start the timer for the progress meter
  componentDidMount() {
    this.timer = setTimeout(() => this.progress(250), 250);
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  progress(completed) {
    // The data in the cards was just changed
    if (this.state.update!==this.props.update) {
      this.setState({completed: 0, update: this.props.update})
      this.timer = setTimeout(() => this.progress(250), 250);
    // Keep incrementing the progress bar
    } else {
      this.setState({completed, update: this.props.update});
      this.timer = setTimeout(() => this.progress(completed + 250), 250);
    }
  }

  render() {
    return (
      <LinearProgress mode='determinate' value={this.state.completed} max={cycleRate-400} />
    );
  }
}

// Simple switch between showing bath data or bitrode history
// Depending on how much data we want to show on the dashboard
function BathOrBitrodeHistory(props) {
  if (props.groupBy==='Test') {
    return (
      <BitrodeHistoryCard data={props.data} labHistory={props.labHistory}
        groupBy={props.groupBy} group={props.group} labs={props.labs} />
    )
  } else {
    return (
      <BathCard title='Bath Temperature'
        data={props.data} bathList={bathList} />
    )
  }
}

export default Dashboard;

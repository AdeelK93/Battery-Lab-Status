// This main app module contains polling and routing logic

import React from 'react';
import { Location, Locations, NotFound } from 'react-router-component';

import { BitrodeParse } from './Workers/BitrodeHelpers.js';
import MenuDrawer from './Components/MenuDrawer.js';
import Dashboard from './Components/Dashboard.js';
import TabularOverview from './Components/TabularOverview.js';
import CyclingProgress from './Components/CyclingProgress.js';
import Temperature from './Components/Temperature.js';
import WaterBaths from './Components/WaterBaths.js';
import RealTimeAnalysis from './Components/RealTimeAnalysis.js';
// Rate at which the REST is polled
import { reloadRate } from './Workers/Constants.js';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      labStatus: [],
      showLabels: 'Circuit Name',
      groupBy: 'Test'
    };
  }
  // Load up the external data
  componentWillMount() {
    this.pollDatabase() // do it once and then every 5 minutes
    this._timer = setInterval(this.pollDatabase.bind(this), reloadRate)
  }

  // This function handles polling for Bitrode/bath/sensor data
  // Pull the 25 most recent records
  pollDatabase() {
    fetch('api/pg/batterylabstatus?order=datetime.desc&limit=25', {credentials: 'same-origin'})
    .then(res => res.json())
    .then(resjson => {
      // Order the array properly, since the REST query must reverse records
      // In order to fetch the most recent ones
      const newData = resjson.map(record => BitrodeParse(record)).reverse()
      this.setState({ labHistory: newData, labStatus: newData[newData.length-1] })
    }).catch(err => console.error(err));
  }

  // Get label checkbox state from menu drawer child props
  onLabelsChanged = newLabels => this.setState({showLabels: newLabels ? 'Circuit Name' : 'Circuit'})
  onGroupChanged = groupByTest => this.setState({groupBy: groupByTest ? 'Test' : 'Bitrode'})

  render() {
    return (
      <div>
        <MenuDrawer callbackLabels={this.onLabelsChanged} callbackGroup={this.onGroupChanged} callbackRefresh={() => this.pollDatabase()} />
        <Locations hash>
          <Location path='/' handler={Dashboard} labs={this.state.showLabels} groupBy={this.state.groupBy} data={this.state.labStatus} labHistory={this.state.labHistory} />
          <Location path='/table' handler={TabularOverview} data={this.state.labStatus} />
          <Location path='/cycling' handler={CyclingProgress} groupBy={this.state.groupBy} labs={this.state.showLabels} data={this.state.labStatus} />
          <Location path='/temperature' handler={Temperature} groupBy={this.state.groupBy} labs={this.state.showLabels} data={this.state.labStatus} />
          <Location path='/waterbaths' handler={WaterBaths} data={this.state.labStatus} labHistory={this.state.labHistory} />
          <Location path='/analysis' handler={RealTimeAnalysis} groupBy={this.state.groupBy} labs={this.state.showLabels} labHistory={this.state.labHistory} />
          <NotFound handler={Dashboard} labs={this.state.showLabels} groupBy={this.state.groupBy} data={this.state.labStatus} />
        </Locations>
      </div>
    );
  }
}

export default App;

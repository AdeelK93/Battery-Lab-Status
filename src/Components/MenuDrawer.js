// This module contains the top app bar, clock, and menu components
// The clock is hidden on mobile devices

import React from 'react';
import Material from '../MaterialTheme.js';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Refresh from 'material-ui/svg-icons/navigation/refresh';
import dateFormat from 'dateformat';

import Dashboard from 'material-ui/svg-icons/action/dashboard';
import GridOn from 'material-ui/svg-icons/image/grid-on';
import BatteryFull from 'material-ui/svg-icons/device/battery-charging-full';
import WhatsHot from 'material-ui/svg-icons/social/whatshot';
import HotTub from 'material-ui/svg-icons/places/hot-tub';
import LineChart from 'material-ui/svg-icons/editor/multiline-chart';
import Check from 'material-ui/svg-icons/navigation/check';
import Close from 'material-ui/svg-icons/navigation/close';

class MenuDrawer extends React.Component {
  constructor() {
    super();
    this.state = {
      menuOpen: false,
      showLabels: true,
      groupByTest: true
    };
  }

  handleToggle = () => this.setState({menuOpen: !this.state.menuOpen});
  navigate(location) {
    window.location = location;
    this.setState({menuOpen: false})
  }
  handleLabels() {
    const newLabels = !this.state.showLabels;
    this.setState({showLabels: newLabels});
    this.props.callbackLabels(newLabels)
  }
  handleGroup() {
    const newGroup = !this.state.groupByTest;
    this.setState({groupByTest: newGroup});
    this.props.callbackGroup(newGroup)
  }

  // Start the clock in the menu bar
  componentDidMount() {
     window.setInterval(() =>
      this.setState({date: new Date()})
    , 1000); // 1s polling may be too frequent?
  }

  render() {
    return (
      <Material>
        <AppBar title='Battery Lab Status' onLeftIconButtonTouchTap={this.handleToggle} style={{position: 'fixed'}}>
          <h4 className='time'> {dateFormat(this.state.date, 'dddd, mmmm dS, yyyy, h:MM TT')} </h4>
        </AppBar>
        <div className='spacer'/>

        <Drawer open={this.state.menuOpen} docked={false}
          onRequestChange={(menuOpen) => this.setState({menuOpen})}>
          <Subheader> Battery Lab Status </Subheader>
          <MenuItem leftIcon={<Dashboard />} onTouchTap={() => this.navigate('#')}>
            Dashboard
          </MenuItem>
          <MenuItem leftIcon={<GridOn />} onTouchTap={() => this.navigate('#table')}>
            Tabular Overview
          </MenuItem>
          <MenuItem leftIcon={<BatteryFull />} onTouchTap={() => this.navigate('#cycling')}>
            Cycling Progress
          </MenuItem>
          <MenuItem leftIcon={<WhatsHot />} onTouchTap={() => this.navigate('#temperature')}>
            Battery Temperature
          </MenuItem>
          <MenuItem leftIcon={<HotTub />} onTouchTap={() => this.navigate('#waterbaths')}>
            Water Baths
          </MenuItem>
          <MenuItem leftIcon={<LineChart />} onTouchTap={() => this.navigate('#analysis')}>
            Real-time Analysis
          </MenuItem>
          <br/>
          <Divider />
          <Subheader> Options </Subheader>
          <MenuItem leftIcon={this.state.showLabels ? <Check /> : <Close />} onTouchTap={() => this.handleLabels()} >
            Detailed circuit labels
          </MenuItem>
          <MenuItem leftIcon={this.state.groupByTest ? <Check /> : <Close />} onTouchTap={() => this.handleGroup()} >
            Group by test
          </MenuItem>
          <MenuItem leftIcon={<Refresh/>} onTouchTap={() => this.props.callbackRefresh()} >
            Refresh
          </MenuItem>
        </Drawer>
      </Material>
    );
  }
}

export default MenuDrawer;

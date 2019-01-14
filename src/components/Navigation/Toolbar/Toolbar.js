import React from 'react';

import Logo from '../../Logo/Logo';
import NavigationItems from '../NavigationItems/NavigationItems';
import DrawerToggle from '../SideDrawer/DrawerToggle/DrawerToggle';
import classes from './Toolbar.css';

const toolbar = ( props ) => (
  <header className={classes.Toolbar}>
    <DrawerToggle click={props.drawerToggleClicked} />
    {/* <button onClick={props.drawerToggleClicked}>Menu</button> */}
    <div className={classes.Logo}>
      <Logo />
    </div>
    <nav className={classes.DesktopOnly}>
      <NavigationItems isAuthenticated={props.isAuth}></NavigationItems>
    </nav>
  </header>
);

export default toolbar;
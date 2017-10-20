import React        from 'react';
import { Link }     from 'react-router';
import                   './Header-style.scss'
import                   './Main-style.scss'
import                   './Footer-style.scss'
// Using "Stateless Functional Components"
const MainLayout = (props) => { 
  return (
    <div className="app">
      <header className="header">
        <nav className="main-nav">
          <ul>
            <li><Link to="/sockets" activeClassName="active" ><i className="fa fa-toggle-on" aria-hidden="true"></i></Link></li>
            <li><Link to="/temperature" activeClassName="active" ><i className="fa fa-thermometer-full" aria-hidden="true"></i></Link></li>
            <li><Link to="/coffeeMachine" activeClassName="active" ><i className="fa fa-coffee" aria-hidden="true"></i></Link></li>
            <li><Link to="/musicPlayer" activeClassName="active" ><i className="fa fa-music" aria-hidden="true"></i></Link></li>
            <li><Link to="/settings" activeClassName="active" ><i className="fa fa-cog" aria-hidden="true"></i></Link></li>
          </ul>
        </nav>
      </header>
      <main className="main">
        {props.children}
      </main>
    </div>
  );
}

export default MainLayout

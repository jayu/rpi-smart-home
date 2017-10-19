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
            <li><Link to="/sockets" activeClassName="active" >Sockets</Link></li>
            <li><Link to="/temperature" activeClassName="active" >Temperature</Link></li>
            <li><Link to="/coffeeMachine" activeClassName="active" >CoffeeMachine</Link></li>
            <li><Link to="/musicPlayer" activeClassName="active" >Muzyka</Link></li>
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

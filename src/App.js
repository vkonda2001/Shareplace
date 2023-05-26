import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes
  
} from 'react-router-dom'
import { Navigate } from 'react-router';
import './App.css';
import Sidebar from './components/Sidebar';
import FriendsView from './components/FriendsView'
import UserView from './components/UserView'
import LoginView from './components/LoginView'
import RegisterView from './components/RegisterView'
import HomeView from './components/HomeView'
import RedirectView from './components/RedirectView';

function App() {

  const AuthRoute = function({children}) {
    if (localStorage.getItem("firebaseId") === "") {
      return <Navigate to="/final" />;
    }
    else {
      return children;
    }
  }

  return (
    <Router>
      <Sidebar>
      <Routes>
        <Route path = "/final" element= {<RedirectView />} />
        <Route path = "/final/login" element = {<LoginView />} />
        <Route path = "/final/friends" element = {<AuthRoute><FriendsView /></AuthRoute>} />
        <Route path = "/final/friends/:id" element = {<AuthRoute><UserView /></AuthRoute>}/>
        <Route path = "/final/home" element = {<AuthRoute><HomeView /></AuthRoute>} />
        <Route path = "/final/register" element = {<RegisterView />} />
        <Route path = "/final/profile" element = {<AuthRoute><UserView /></AuthRoute>}/>
      </Routes>
      </Sidebar> 
    </Router>
  );
}

export default App;

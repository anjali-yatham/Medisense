import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import StartPage from './components/StartPage';
import Signin from './components/Signin';
import Signup from './components/Signup';
import SuperAdminLogin from './components/SuperAdminLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Prescriptions from './components/Prescriptions';
import Medicines from './components/Medicines';
import TrackMedicines from './components/TrackMedicines';
import MedDatabase from './components/MedDatabase';
import Profile from './components/Profile';
import Reports from './components/Reports';

// Layout component that conditionally renders Header
function Layout() {
  const location = useLocation();
  
  // Pages that have their own header - don't show the global Header
  const pagesWithOwnHeader = ['/', '/signin', '/signup', '/superadmin'];
  const hideGlobalHeader = pagesWithOwnHeader.includes(location.pathname);

  return (
    <>
      {!hideGlobalHeader && <Header />}
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/superadmin" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/track-medicines" element={<TrackMedicines />} />
        <Route path="/med-database" element={<MedDatabase />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Layout />
      </div>
    </Router>
  );
}

export default App;

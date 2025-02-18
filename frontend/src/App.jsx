import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Signup from './pages/Signup';
import Login from './pages/Login';
import SquatCounter from './components/SquatCounter';
import PushUpCounter from './components/PushUpCounter';
import CrunchCounter from './components/CrunchCounter';
import ChallengesScreen from './pages/ChallengesScreen';
import LeaderboardScreen from './pages/LeaderboardScreen';
import ProfilePage from './pages/Profile';

function App() {
  return (
    <>
    <Navbar/>
    <div className='min-h-screen'>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/profile" element={<ProfilePage/>} />  
      <Route path="/challenges" element={<ChallengesScreen/>} />
      <Route path="/leaderboard" element={<LeaderboardScreen/>} />
      <Route path="/squat-counter" element={<SquatCounter />} />
      <Route path="/pushup-counter" element={<PushUpCounter />} />
      <Route path="/crunches-counter" element={<CrunchCounter />} />
    </Routes>
    </div>
    <Footer/>
    </>
    
    
  );
}

export default App;

import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import WhiteboardContainer from './comp/whiteboard_container/WhiteboardContainer';
import NewWhiteboard from './comp/newWhiteboard/NewWhiteboard';

function App() {
  return (
    <Router>
      <Route path="/" exact component={NewWhiteboard}></Route>
      <Route path="/invite" component={NewWhiteboard}></Route>
      <Route path="/session" component={WhiteboardContainer}></Route>
    </Router>
  );
}

export default App;

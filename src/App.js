import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import WhiteboardContainer from './comp/whiteboard_container/WhiteboardContainer';
import NewWhiteboard from './comp/newWhiteboard/NewWhiteboard';

function App() {
  return (
    <Router>
      <Route path="/" exact component={NewWhiteboard}></Route>
      <Route path="/whiteboard" component={WhiteboardContainer}></Route>
    </Router>
  );
}

export default App;

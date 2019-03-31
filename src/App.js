import React from 'react';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>Slack Slash Command /lmgtfy</h2>
        </header>
        <p>
          Wrapping <a href="http://lmgtfy.com/">LMGTFY</a> using a simple slack command.
        </p>
      </div>
    );
  }
}

export default App;

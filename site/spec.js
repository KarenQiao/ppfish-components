import React from 'react';

export default class Spec extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="app">
        <header className="header">
          <div className="container">
            <h1>
              LOGO
            </h1>
            <ul className="nav">
              <li className="nav-item">
                <a href="#/home/" rel="noopener noreferrer">首页</a>
              </li>
              <li className="nav-item">
                <a className="active" rel="noopener noreferrer">设计语言</a>
              </li>
              <li className="nav-item">
                <a href="#/components/">组件</a>
              </li>
            </ul>
          </div>
        </header>
        <div>设计语言</div>
      </div>
    );
  }
}

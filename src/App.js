import React, { createRef } from 'react'
import SlideVerify from './lib/index'

import img0 from './assets/img.jpg';
import img1 from './assets/img1.jpg';
import img2 from './assets/img2.jpg';
import img3 from './assets/img3.jpg';
import img4 from './assets/img4.jpg';
import img5 from './assets/img5.jpg';

const imgs = [
  img0,
  img1,
  img2,
  img3,
  img4,
  img5,
]

class App extends React.Component {
  constructor(props) {
    super(props)
    this.ref = createRef()
  }

  onSuccess = (time) => {
    console.log('验证成功', time)
  }

  onRefresh = () => {
    console.log('刷新成功')
  }

  onClick = () => {
    this.ref.current.refresh()
  }

  onAgain = () => {
    console.log('再试一次')
  }

  render() {
    return (
      <div id="app">
        <SlideVerify
          ref={this.ref}
          imgs={imgs}
          w={400}
          h={300}
          r={20}
          l={60}
          liderText="test"
          again={this.onAgain}
          success={this.onSuccess}
          refresh={this.onRefresh} />
        <button onClick={this.onClick}>父组件手动刷新</button>
      </div>
    )
  }
}

export default App

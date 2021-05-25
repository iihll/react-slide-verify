import React from 'react'
import './index.less'

const PI = Math.PI;

function sum(x, y) {
  return x + y
}

function square(x) {
  return x * x
}

class SlideVerify extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      containerActive: false, // container active class
      containerSuccess: false, // container success class
      containerFail: false, // container fail class
      canvasCtx: null,
      blockCtx: null,
      block: null,
      block_x: undefined, // container random position
      block_y: undefined,
      L: this.props.l + this.props.r * 2 + 3, // block real lenght
      img: undefined,
      originX: undefined,
      originY: undefined,
      isMouseDown: false,
      trail: [],
      sliderLeft: 0, // block right offset
      sliderMaskWidth: 0, // mask width,
      success: false, // Bug Fixes 修复了验证成功后还能滑动
      loadBlock: true, // Features 图片加载提示，防止图片没加载完就开始验证
      timestamp: null,
    }
    this.blockRef = React.createRef()
    this.canvasRef = React.createRef()
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.bindMousemove)
    document.removeEventListener('mouseup', this.bindMouseup)
  }

  init = () => {
    setTimeout(() => {
      this.initDom()
      this.initImg()
      this.bindEvents()
    }, 0)
  }

  initDom = () => {
    this.setState({
      block: this.blockRef.current,
      canvasCtx: this.canvasRef.current.getContext('2d')
    }, () => {
      this.setState({
        blockCtx: this.state.block.getContext('2d')
      })
    })

  }
  initImg = () => {
    const { block, canvasCtx, blockCtx, L, block_x: x, block_y: y } = this.state
    const { w, h, r } = this.props

    const img = this.createImg(() => {
      setTimeout(() => {
        // 图片加载完关闭遮蔽罩
        this.setState({
          loadBlock: false
        })
        this.drawBlock()
        canvasCtx.drawImage(img, 0, 0, w, h)
        blockCtx.drawImage(img, 0, 0, w, h)
        let _y = this.state.block_y - r * 2 - 1
        let ImageData = blockCtx.getImageData(this.state.block_x, _y, L, L)
        // TODO 待优化
        block.width = L
        blockCtx.putImageData(ImageData, 0, _y)
      }, 0)
    });
    this.setState({
      img
    })
  }
  drawBlock = () => {
    const { block_x, block_y, L, canvasCtx, blockCtx } = this.state
    const { r, w, h } = this.props

    this.setState({
      block_x: this.getRandomNumberByRange(L + 10, w - (L + 10)),
      block_y: this.getRandomNumberByRange(10 + r * 2, h - (L + 10))
    })
    this.draw(this.state.canvasCtx, this.state.block_x, this.state.block_y, 'fill')
    this.draw(this.state.blockCtx, this.state.block_x, this.state.block_y, 'clip')
  }
  draw = (ctx, x, y, operation) => {
    const { l, r } = this.props;
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
    ctx.lineTo(x + l, y)
    ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
    ctx.lineTo(x + l, y + l)
    ctx.lineTo(x, y + l)
    ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
    ctx.lineTo(x, y)
    ctx.lineWidth = 2
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.stroke()
    ctx[operation]()
    // Bug Fixes 修复了火狐和ie显示问题
    ctx.globalCompositeOperation = "destination-over"
  }
  createImg = (onload) => {
    const img = document.createElement('img');
    img.crossOrigin = "Anonymous";
    img.onload = onload;
    img.onerror = () => {
      img.src = this.getRandomImg()
    }
    img.src = this.getRandomImg()
    return img;
  }
  // 随机生成img src
  getRandomImg = () => {
    // return require('../assets/img.jpg')
    const { imgs } = this.props
    const len = imgs.length;
    return len > 0 ?
      imgs[this.getRandomNumberByRange(0, len)] :
      'https://picsum.photos/300/150/?image=' + this.getRandomNumberByRange(0, 1084);
  }
  getRandomNumberByRange = (start, end) => {
    return Math.round(Math.random() * (end - start) + start)
  }
  refresh = () => {
    this.reset()
    this.props.refresh()
  }
  sliderDown = (event) => {
    const { success } = this.state
    if (success) return;
    this.originX = event.clientX;
    this.originY = event.clientY;
    this.setState({
      originX: event.clientX,
      originY: event.clientY,
      isMouseDown: true,
      timestamp: + new Date()
    })
  }
  touchStartEvent(e) {
    const { success } = this.state
    if (success) return;
    this.setState({
      originX: e.changedTouches[0].pageX,
      originY: e.changedTouches[0].pageY,
      isMouseDown: true,
      timestamp: + new Date()
    })
  }

  bindMousemove = (e) => {
    let { isMouseDown, originX, originY, sliderLeft, block, timestamp, trail } = this.state
    const { w, accuracy } = this.props
    if (!this.state.isMouseDown) return false;
    const moveX = e.clientX - this.state.originX;
    const moveY = e.clientY - this.state.originY;
    if (moveX < 0 || moveX + 38 >= w) return false;

    let blockLeft = (w - 40 - 20) / (w - 40) * moveX;
    block.style.left = blockLeft + 'px';
    trail.push(moveY);

    this.setState({
      containerActive: true, // add active
      sliderMaskWidth: moveX + 'px',
      trail,
      block,
      sliderLeft: moveX + 'px'
    })
  }

  bindMouseup = (e) => {
    let { isMouseDown, originX, originY, sliderLeft, block, timestamp, trail } = this.state
    const { w, accuracy } = this.props
    if (!this.state.isMouseDown) return false
    if (e.clientX === this.state.originX) return false;
    this.setState({
      isMouseDown: false,
      containerActive: false, // remove active
      timestamp: + new Date() - this.state.timestamp
    })

    const { spliced, TuringTest } = this.verify();
    if (spliced) {
      if (accuracy === -1) {
        this.setState({
          containerSuccess: true,
          success: true
        })
        this.props.success(timestamp)
        return;
      }
      if (TuringTest) {
        // succ
        this.containerSuccess = true;
        this.success = true;
        this.props.success(timestamp)
      } else {
        this.setState({
          containerFail: true
        })
        this.props.again()
      }
    } else {
      this.setState({
        containerFail: true
      })
      this.props.fail()
      setTimeout(() => {
        this.reset()
      }, 1000)
    }
  }

  bindEvents() {
    let { isMouseDown, originX, originY, sliderLeft, block, timestamp, trail } = this.state
    const { w, accuracy } = this.props
    document.addEventListener('mousemove', this.bindMousemove);
    document.addEventListener('mouseup', this.bindMouseup)
  }
  touchMoveEvent(e) {
    let { isMouseDown, originX, originY, sliderLeft } = this.state
    const { w } = this.props
    if (!this.state.isMouseDown) return false;
    const moveX = e.changedTouches[0].pageX - originX;
    const moveY = e.changedTouches[0].pageY - originY;
    if (moveX < 0 || moveX + 38 >= w) return false;
    let blockLeft = (w - 40 - 20) / (w - 40) * moveX;
    this.state.block.style.left = blockLeft + 'px';

    this.setState({
      containerActive: true,
      sliderMaskWidth: moveX + 'px',
      sliderLeft: moveX + 'px'
    })
    this.state.trail.push(moveY);
  }
  touchEndEvent(e) {
    const { isMouseDown, originX, timestamp } = this.state
    const { accuracy } = this.props
    if (!this.state.isMouseDown) return false
    this.setState({
      isMouseDown: false
    })
    if (e.changedTouches[0].pageX === originX) return false;
    this.setState({
      containerActive: false,
      timestamp: + new Date() - this.state.timestamp
    })

    const { spliced, TuringTest } = this.verify();
    if (spliced) {
      if (accuracy === -1) {
        this.setState({
          containerSuccess: true,
          success: true,
        })
        this.props.success(timestamp)
        return;
      }
      if (TuringTest) {
        this.setState({
          containerSuccess: true,
          success: true,
        })
        this.props.success(timestamp)
      } else {
        this.setState({
          containerFail: true
        })
        this.props.again()
      }
    } else {
      this.setState({
        containerFail: true
      })
      this.props.fail()
      setTimeout(() => {
        this.reset()
      }, 1000)
    }
  }
  verify() {
    const { trail, block_x } = this.state
    const { accuracy: accuracy1 } = this.props

    const arr = trail // drag y move distance
    const average = arr.reduce(sum) / arr.length // average
    const deviations = arr.map(x => x - average) // deviation array
    const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length) // standard deviation
    const left = parseInt(this.state.block.style.left)
    const accuracy = accuracy1 <= 1 ? 1 : accuracy1 > 10 ? 10 : accuracy1;
    return {
      spliced: Math.abs(left - block_x) <= accuracy,
      TuringTest: average !== stddev, // equal => not person operate
    }
  }
  reset() {
    this.setState({
      success: false,
      containerActive: false,
      containerSuccess: false,
      containerFail: false,
      sliderLeft: 0,
      sliderMaskWidth: 0,
    })
    this.state.block.style.left = 0;

    // canvas
    let {
      w,
      h
    } = this.props;
    this.state.canvasCtx.clearRect(0, 0, w, h)
    this.state.blockCtx.clearRect(0, 0, w, h)
    this.state.block.width = w

    // generate img
    this.state.img.src = this.getRandomImg();
    this.props.fulfilled()
  }

  render() {
    const { w, h, show, sliderText } = this.props
    let { sliderMaskWidth, sliderLeft, loadBlock, containerActive, containerSuccess, containerFail } = this.state

    return (
      <div className="slide-verify node" style={{ width: w + 'px' }} id="slideVerify">
        <div className={loadBlock ? 'slider-verify-loading' : ''}></div>
        <canvas width={w} height={h} ref={this.canvasRef}></canvas>
        {show && <div onClick={this.refresh} className="slide-verify-refresh-icon" ></div>}
        <canvas width={w} height={h} ref={this.blockRef} className="slide-verify-block"></canvas>
        <div className={`slide-verify-slider ${containerActive ? 'container-active' : ''} ${containerSuccess ? 'container-success' : ''} ${containerFail ? 'container-fail' : ''}`}>
          <div className="slide-verify-slider-mask" style={{ width: sliderMaskWidth }}>
            <div
              onMouseDown={this.sliderDown}
              onTouchStart={this.touchStartEvent}
              onTouchMove={this.touchMoveEvent}
              onTouchEnd={this.touchEndEvent}
              className="slide-verify-slider-mask-item"
              style={{ left: sliderLeft }}>
              <div className="slide-verify-slider-mask-item-icon"></div>
            </div>
          </div>
          <span className="slide-verify-slider-text">{sliderText}</span>
        </div>
      </div>
    )
  }
}

SlideVerify.defaultProps = {
  // block length
  l: 42,
  // block radius
  r: 10,
  // canvas width
  w: 310,
  // canvas height
  h: 155,
  sliderText: '向右滑动',
  accuracy: 5, // 若为 -1 则不进行机器判断
  show: true,
  imgs: [],
  fulfilled: () => { },
  refresh: () => { },
  fail: () => { },
  success: () => { },
  again: () => { }
}

export default SlideVerify
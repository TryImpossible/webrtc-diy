import { useEffect, useRef } from 'react';
import './styles/css/capture-canvas.scss';

/**
 * 捕获Canvas作为媒体流示例
 * @returns
 */
function CaptureCanvas() {
  // 画布2d内容
  const canvasRef = useRef(null);
  // 视频对象
  const videoRef = useRef(null);
  // MediaStream对象
  const streamRef = useRef(null);
  // 画布2d内容
  const contextRef = useRef(null);

  useEffect(() => {
    // 开始捕获Canvas
    const startCaptureCanvas = async () => {
      streamRef.current = canvasRef.current.captureStream(30); // 30fps 更流畅
      // 将视频对象的源指定为stream
      videoRef.current.srcObject = streamRef.current;
    };

    // 画线
    const drawLine = () => {
      const canvas = canvasRef.current;
      // 获取Canvas的2d内容
      contextRef.current = canvas.getContext('2d');
      const context = contextRef.current;

      // 填充颜色
      context.fillStyle = '#CCC';

      // 绘制Canvas背景
      // context.fillRect(0, 0, canvas.width, canvas.height);

      context.lineWidth = 1;
      // 画笔颜色
      context.strokeStyle = '#FF0000';

      // 监听画板鼠标按下事件，开始绘画
      canvas.addEventListener('mousedown', startAction);
      // 监听画板鼠标抬起事件，结束绘画
      canvas.addEventListener('mouseup', endAction);
    };

    // 鼠标按下事件
    const startAction = (event) => {
      const context = contextRef.current;

      // 绘制Canvas背景
      const canvas = canvasRef.current;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 开始新的路径
      context.beginPath();
      // 将画笔移动到指定坐标，类似起点
      context.moveTo(event.offsetX, event.offsetY);
      // 开始绘制
      context.stroke();
      // 监听鼠标移动事件
      canvasRef.current.addEventListener('mousemove', moveAction);
    };

    // 鼠标移动事件
    const moveAction = (event) => {
      const context = contextRef.current;
      // 将画笔移动到结束坐标，类似终点
      context.lineTo(event.offsetX, event.offsetY);
      // 开始绘制
      context.stroke();
    };

    // 鼠标抬起事件
    const endAction = () => {
      // 移除鼠标移动事件
      canvasRef.current.removeEventListener('mousemove', moveAction);
    };

    startCaptureCanvas();
    drawLine();
  }, []);

  return (
    <div className="container">
      <h1>
        <span>捕获Canvas作为媒体流示例</span>
      </h1>
      <div>
        {/* 画布Canvasp容器 */}
        <div className="small-canvas">
          {/* Canvas不设置样式 */}
          <canvas ref={canvasRef} width="320" height="240"></canvas>
        </div>
        <video
          className="small-video"
          ref={videoRef}
          playsInline
          autoPlay></video>
      </div>
    </div>
  );
}

export default CaptureCanvas;

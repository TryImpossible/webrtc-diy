import { useRef, useEffect, useState } from 'react';
import { Button } from 'antd';
import './styles/css/record-canvas.scss';

// 录制数据
let recordedBlobs;

function RecordCanvas() {
  // canvas对象
  const canvasRef = useRef(null);
  // 视频对象
  const videoRef = useRef(null);
  // 画布2d内容
  const contextRef = useRef(null);
  // 录制对象
  const mediaRecorderRef = useRef(null);
  // 捕获数据流
  const streamRef = useRef(null);
  // 检测浏览器支持情况
  const [browserSupport, setBrowserSupport] = useState({});

  useEffect(() => {
    // 检测浏览器支持的格式
    const detectBrowserSupport = () => {
      const support = {
        webm:
          MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
          MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
          MediaRecorder.isTypeSupported('video/webm'),
        mp4: MediaRecorder.isTypeSupported('video/mp4'),
        mp4H264: MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E'),
      };

      console.log('浏览器支持情况:', support);
      setBrowserSupport(support);

      // iPhone 优先使用 MP4
      if (isIOS()) {
        console.log('检测到 iOS 设备，将使用 MP4 格式');
      }
    };

    // 检测浏览器支持情况
    detectBrowserSupport();

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
    drawLine();
  }, []);

  // 检测是否为 iOS 设备
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  };

  // 获取适合当前浏览器的 MIME 类型
  const getSupportedMimeType = () => {
    // iPhone 优先使用 MP4
    if (isIOS()) {
      if (browserSupport.mp4H264) {
        return 'video/mp4;codecs=avc1.42E01E';
      } else if (browserSupport.mp4) {
        return 'video/mp4';
      }
    }

    // 其他设备按原逻辑检测
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4',
    ];

    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('选择的 MIME 类型:', type);
        return type;
      }
    }

    console.warn('未找到支持的 MIME 类型，使用默认设置');
    return '';
  };

  // 根据 MIME 类型获取文件扩展名
  const getFileExtension = (mimeType) => {
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('webm')) return 'webm';
    return 'mp4'; // 默认
  };

  // 开始捕获Canvas
  const startCaptureCanvas = async () => {
    streamRef.current = canvasRef.current.captureStream(30);
    const stream = streamRef.current;
    // 获取视频轨道
    const videoTracks = stream.getVideoTracks();
    // 读取视频资源名称
    console.log(`视频资源名称：${videoTracks[0].label}`);
    window.stream = stream;
    // 将视频对象的源指定为stream
    videoRef.current.srcObject = stream;

    // 开始录制
    startRecord();
  };

  // 开始录制
  const startRecord = () => {
    // 录制数据
    recordedBlobs = [];

    const mimeType = getSupportedMimeType();
    const options = { mimeType };

    console.log('录制选项:', options);
    try {
      // 创建MediaRecorder对象，准备录制
      mediaRecorderRef.current = new MediaRecorder(window.stream, options);
    } catch (error) {
      console.error('MediaRecorder创建失败：', error);
      return;
    }
    const mediaRecorder = mediaRecorderRef.current;
    // 录制停止事件监听
    mediaRecorder.onstop = (event) => {
      console.log('录制停止：', event);
      console.log('录制的Blobs数据为：', recordedBlobs);
    };
    // 录制数据回调事件
    mediaRecorder.ondataavailable = (event) => {
      // console.log('handleDataAvailable', event);
      // 判断是否有数据
      if (event.data && event.data.size > 0) {
        // 将数据存储到recordedBlobs数组中
        recordedBlobs.push(event.data);
      }
    };
    // 开始录制并指定录制时间为10秒
    mediaRecorder.start(10);
    console.log('MediaRecorder started: ', mediaRecorder);
  };

  // 停止录制
  const stopRecord = () => {
    // 停止录制
    mediaRecorderRef.current.stop();
    if (streamRef.current) {
      // 停止所有视频轨道
      streamRef.current.getTracks().forEach((track) => track.stop());
      // 将stream设置为空
      streamRef.current = null;
    }

    // 生成Blob文件
    const mimeType = getSupportedMimeType();
    const extension = getFileExtension(mimeType);
    const blob = new Blob(recordedBlobs, { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // 指定下载文件及类型
    a.download = `canvas.${extension}`;
    // 将a标签添加到网页
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      // URL.revokeObjectURL()方法会释放一个通过URL.createObjectURL()创建的对象URL
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="container">
      <h1>
        <span>录制canvas示例</span>
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
      <div>
        <Button className="button" onClick={startCaptureCanvas}>
          开始
        </Button>
        <Button className="button" onClick={stopRecord}>
          停止
        </Button>
      </div>
    </div>
  );
}

export default RecordCanvas;

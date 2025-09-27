import { useRef, useState, useEffect } from 'react';
import { Button } from 'antd';
import './styles/css/record-video.scss';

// 录制对象
let mediaRecorder;
// 录制数据
let recordedBlobs;

/**
 * 录制视频示例
 * @returns
 */
function RecordAudio() {
  // 视频预览对象
  const videoPreviewRef = useRef(null);
  // 视频回放对象
  const videoPlayerRef = useRef(null);
  // 初始操作状态
  const [status, setStatus] = useState('start');
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

  // 打开摄像头并预览视频
  const startClickHandler = async () => {
    // 约束条件
    // const constraints = {
    //   // 开启音频
    //   audio: true,
    //   // 设置视频分辨率为1280x720
    //   video: { width: 1280, height: 720 },
    // };
    // 约束条件 - 针对移动设备优化
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, min: 15 },
        // 移动设备优先使用前置摄像头
        facingMode: 'user',
      },
    };
    console.log('约束条件为：', constraints);
    try {
      // 获取音视频流
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      window.stream = stream;
      // 将视频预览对象源指定为stream
      videoPreviewRef.current.srcObject = stream;
      setStatus('startRecord');
    } catch (error) {
      console.error('navigator.mediaDevices.getUserMedia error: ', error);
    }
  };
  // 开始录制
  const startRecordButtonClickHandler = () => {
    if (!window.stream) {
      alert('请先打开摄像头');
      return;
    }
    // 录制数据
    recordedBlobs = [];

    const mimeType = getSupportedMimeType();
    const options = { mimeType };

    console.log('录制选项:', options);
    try {
      // 创建MediaRecorder对象，准备录制
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (error) {
      console.error('MediaRecorder创建失败：', error);
      return;
    }
    // 录制停止事件监听
    mediaRecorder.onstop = (event) => {
      console.log('录制停止：', event);
      console.log('录制的Blobs数据为：', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    // 开始录制并指定录制时间为10秒
    mediaRecorder.start(1000);
    console.log('MediaRecorder started: ', mediaRecorder);
    setStatus('stopRecord');
  };
  // 停止录制
  const stopRecordButtonClickHandler = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // 停止录制
      mediaRecorder.stop();

      // 停止所有视频轨道
      if (window.stream) {
        window.stream.getTracks().forEach((track) => track.stop());
      }

      // 设置录制状态
      setStatus('play');
    }
  };
  // 回放录制视频
  const playButtonClickHandler = () => {
    if (!recordedBlobs || recordedBlobs.length === 0) {
      alert('没有录制数据可播放');
      return;
    }

    // 生成Blob文件
    const mimeType = getSupportedMimeType();
    const blob = new Blob(recordedBlobs, { type: mimeType });
    const videoPlayer = videoPlayerRef.current;
    videoPlayer.src = null;
    videoPlayer.srcObject = null;
    // URL.createObjectURL() 方法会根据传入的参数创建一个指向该参数对象的URL
    videoPlayer.src = window.URL.createObjectURL(blob);
    // 显示播放器控件
    videoPlayer.controls = true;

    // 播放事件处理
    videoPlayer.onloadeddata = () => {
      console.log('视频数据加载完成');
    };
    videoPlayer.onerror = (e) => {
      console.error('视频播放错误:', e);
      alert('视频播放失败，可能格式不支持');
    };
    // 开始播放
    videoPlayer.play().catch((error) => {
      console.error('播放失败:', error);
      alert('自动播放失败，请手动点击播放');
    });
    // 设置录制状态
    setStatus('download');
  };
  // 点击下载录制文件
  const downloadButtonClickHandler = () => {
    if (!recordedBlobs || recordedBlobs.length === 0) {
      alert('没有录制数据可下载');
      return;
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
    a.download = `recording.${extension}`;
    // 将a标签添加到网页
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      // URL.revokeObjectURL()方法会释放一个通过URL.createObjectURL()创建的对象URL
      window.URL.revokeObjectURL(url);
    }, 100);
    setStatus('start');
  };
  // 录制数据回调事件
  const handleDataAvailable = (event) => {
    // console.log('handleDataAvailable', event);
    // 判断是否有数据
    if (event.data && event.data.size > 0) {
      // 将数据存储到recordedBlobs数组中
      recordedBlobs.push(event.data);
    }
  };

  // 重置功能
  const resetHandler = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    if (window.stream) {
      window.stream.getTracks().forEach((track) => track.stop());
    }

    recordedBlobs = [];
    mediaRecorder = null;
    window.stream = null;

    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }

    if (videoPlayerRef.current) {
      videoPlayerRef.current.src = '';
      videoPlayerRef.current.controls = false;
    }

    setStatus('start');
  };

  return (
    <div className="container">
      <h1>
        <span>录制视频示例</span>
      </h1>
      {/* 视频预览 muted表示默认静音 */}
      <video
        className="small-video"
        ref={videoPreviewRef}
        playsInline
        autoPlay
        muted></video>
      {/* 视频回放 loop表示循环播放 */}
      <video
        className="small-video"
        ref={videoPlayerRef}
        playsInline
        loop></video>
      <div>
        <Button
          className="button"
          onClick={startClickHandler}
          disabled={status !== 'start'}>
          打开摄像头
        </Button>
        <Button
          className="button"
          onClick={startRecordButtonClickHandler}
          disabled={status !== 'startRecord'}>
          开始录制
        </Button>
        <Button
          className="button"
          onClick={stopRecordButtonClickHandler}
          disabled={status !== 'stopRecord'}>
          停止录制
        </Button>
        <Button
          className="button"
          onClick={playButtonClickHandler}
          disabled={status !== 'play'}>
          播放
        </Button>
        <Button
          className="button"
          onClick={downloadButtonClickHandler}
          disabled={status !== 'download'}>
          下载
        </Button>
        <button
          className="button"
          onClick={resetHandler}
          style={{ margin: '5px', padding: '10px', background: '#ff4444' }}>
          重置
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>当前状态: {status}</p>
        <p>录制数据块: {recordedBlobs ? recordedBlobs.length : 0}</p>
      </div>
    </div>
  );
}

export default RecordAudio;

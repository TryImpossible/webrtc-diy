import { Button } from 'antd';
import { useRef, useEffect, useState } from 'react';
// 录制对象
let mediaRecorder;
// 录制数据
let recordedBlobs;
// 捕获数据流
let stream;

function RecordScreen() {
  // 视频对象
  const videoRef = useRef(null);
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

  // 开始捕获桌面
  const startCaptureScreen = async () => {
    try {
      // 调用getDisplayMedia()方法，将约束设置成{video: true}即可
      stream = await navigator.mediaDevices.getDisplayMedia({
        // 设置屏幕分辨率
        video: {
          width: 2080,
          height: 1280,
        },
      });
      const video = videoRef.current;
      // 获取视频轨道
      const videoTracks = stream.getVideoTracks();
      // 读取视频资源名称
      console.log('视频资源名称: ' + videoTracks[0].label);
      window.stream = stream;
      // 将视频对象的源指定为stream
      video.srcObject = stream;
      startRecord();
    } catch (error) {
      console.error('getDisplayMedia error: ', error);
    }
  };

  // 开始录制
  const startRecord = () => {
    // 监听流是否处于不活动状态，用于判断用户是否停止捕获屏幕
    stream.addEventListener('inactive', (e) => {
      console.log('监听到屏幕捕获停止后停止录制', e);
      stopRecord();
    });
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
    mediaRecorder.stop();
    if (stream) {
      // 停止所有视频轨道
      stream.getTracks().forEach((track) => track.stop());
      // 将stream设置为空
      stream = null;
    }
    console.log('barry1');

    // 生成Blob文件
    const mimeType = getSupportedMimeType();
    const extension = getFileExtension(mimeType);
    const blob = new Blob(recordedBlobs, { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // 指定下载文件及类型
    a.download = `screen.${extension}`;
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
        <span>录制屏幕示例</span>
      </h1>
      {/* 捕获屏幕数据渲染 */}
      <video className="video" ref={videoRef} autoPlay playsInline></video>
      <Button onClick={startCaptureScreen} style={{ marginRight: '10px' }}>
        开始
      </Button>
      <Button onClick={stopRecord}>停止</Button>
    </div>
  );
}

export default RecordScreen;

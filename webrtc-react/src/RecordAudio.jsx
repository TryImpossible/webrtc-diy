import { useRef, useState } from 'react';
import { Button } from 'antd';
import './styles/css/record-audio.scss';

// 录制对象
let mediaRecorder;
// 录制数据
let recordedBlobs;

/**
 * 录制音频示例
 * @returns
 */
function RecordAudio() {
  // 初始操作状态
  const [status, setStatus] = useState('start');
  // 获取音频播放器
  const audioPlayerRef = useRef(null);
  // 点击打开麦克风按钮
  const startClickHandler = async () => {
    try {
      // 获取音频数据流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('获取音频stream:', stream);
      // 将stream与window.stream绑定
      window.stream = stream;
      // 设置当前状态为startRecord
      setStatus('startRecord');
    } catch (error) {
      console.error('navigator.getUserMedia error:', error);
    }
  };
  // 开始录制
  const startRecordButtonClickHandler = () => {
    recordedBlobs = [];
    const options = { mimeType: 'audio/ogg' };
    try {
      // 初始化MediaRecorder对象，传入音频流及媒体类型
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (error) {
      console.error('MediaRecorder创建失败：', error);
      return;
    }
    // 录制停止事件回调
    mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event);
      console.log('Recorded Blobs: ', recordedBlobs);
    };
    // 当数据有效时触发的事件，可以把数据存储到缓存区里
    mediaRecorder.ondataavailable = handleDataAvailable;
    // 录制10秒
    mediaRecorder.start(10);
    console.log('MediaRecorder started', mediaRecorder);
    // 设置当前状态为stopRecord
    setStatus('stopRecord');
  };

  // 停止录制
  const stopRecordButtonClickHandler = () => {
    mediaRecorder.stop();
    setStatus('play');
  };

  // 播放
  const playButtonClickHandler = () => {
    const audioPlayer = audioPlayerRef.current;
    // 生成Blob文件，类型为audio/ogg
    const blob = new Blob(recordedBlobs, { type: 'audio/ogg' });
    audioPlayer.src = null;
    // 根据Blob文件生成播放器的数据源
    audioPlayer.src = window.URL.createObjectURL(blob);
    // 播放声音
    audioPlayer.play();
    setStatus('download');
  };

  // 下载录制的文件
  const downloadButtonClickHandler = () => {
    // 生成Blob文件，类型为audio/ogg
    const blob = new Blob(recordedBlobs, { type: 'audio/ogg' });
    // URL.createObjectURL()方法会根据传入的参数创建一个指向该参数对象的URL
    const url = window.URL.createObjectURL(blob);
    // 创建a标签
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // 设置下载文件
    a.download = 'test.ogg';
    // 将a标签添加至网页
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      // URL.revokeObjectURL()方法会释放一个通过URL.createObjectURL()创建的对象URL
      // window.URL.revokeObjectURL(url);
    }, 100);
    setStatus('start');
  };

  // 录制数据回调事件
  const handleDataAvailable = (event) => {
    console.log('handleDataAvailable', event);
    // 判断是否有数据
    if (event.data && event.data.size > 0) {
      // 记录数据
      recordedBlobs.push(event.data);
    }
  };
  return (
    <div className="container">
      <h1>
        <span>音频录制</span>
      </h1>
      {/* 音频播放器，播放录制的音频 */}
      <audio ref={audioPlayerRef} controls autoPlay></audio>
      <div>
        <Button
          className="button"
          onClick={startClickHandler}
          disabled={status !== 'start'}>
          打开麦克风
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
          开始录制
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
      </div>
    </div>
  );
}

export default RecordAudio;

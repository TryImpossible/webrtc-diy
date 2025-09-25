import { useRef } from 'react';
import webrtcVideo from './assets/webrtc.mp4';

function CaptureVideo() {
  const sourceVideoRef = useRef(null);
  const playerVideoRef = useRef(null);
  const play = () => {
    console.log('canPlay');
    // 源视频对象
    const sourceVideo = sourceVideoRef.current;
    //播放视频对象
    const playerVideo = playerVideoRef.current;

    // MediaStream对象
    let stream = null;
    // 捕获帧率
    const fps = 0;
    // 进行浏览器兼容判断，捕获媒体流
    if (sourceVideo.captureStream) {
      stream = sourceVideo.captureStream(fps);
    } else if (sourceVideo.mozCaptureStream) {
      stream = sourceVideo.mozCaptureStream(fps);
    } else {
      console.error('captureStream不支持');
      stream = null;
    }
    // 将播放器源指定为stream
    playerVideo.srcObject = stream;
  };
  return (
    <div className="container">
      <h1>
        <span>捕获Video作为媒体流示例</span>
      </h1>
      {/* 源视频，显示控制按钮，循环播放 */}
      <video ref={sourceVideoRef} playsInline controls loop muted onPlay={play}>
        {/* mp4视频路径 */}
        <source src={webrtcVideo} type="video/mp4" />
      </video>
      <video ref={playerVideoRef} playsInline autoPlay></video>
    </div>
  );
}

export default CaptureVideo;

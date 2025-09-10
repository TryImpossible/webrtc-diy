import { useRef } from 'react';
import { Button, message } from 'antd';

// 约束条件
const constraints = {
  // 禁用音频
  audio: false,
  // 启用视频
  video: true,
};

function Camera() {
  const videoRef = useRef(null);
  // 打开摄像头
  const openCamera = async () => {
    try {
      // 根据约束获取 媒体
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('handleSuccess:');
      handleSuccess(stream);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSuccess = (stream) => {
    const video = videoRef.current;
    const videoTracks = stream.getVideoTracks();
    console.log('通过设置限制条件获取到流：', constraints);
    console.log(`使用的视频设备：${videoTracks[0].label}`);
    window.stream = stream;
    video.srcObject = stream;
  };

  const handleError = (error) => {
    if (error.name === 'ConstraintNotSatisfiedError') {
      const v = constraints.video;
      // 宽高尺寸错误
      message.error(
        `宽：${v.width.exact} 高：${v.height.exact} 的分辨率不支持`,
      );
    } else if (error.name === 'PermissionDeniedError') {
      message.error('没有摄像头和麦克风使用权限，请点击允许按钮');
    } else {
      message.error(`getUserMedia错误：${error.message}`);
    }
    console.error(error);
  };

  return (
    <div className="container">
      <h1>
        <span>摄像头示例</span>
      </h1>
      <video className="video" ref={videoRef} autoPlay playsInline />
      <Button onClick={openCamera}>打开摄像头</Button>
    </div>
  );
}

export default Camera;

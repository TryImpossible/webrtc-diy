import { useRef } from 'react';
import { Button, message } from 'antd';

// 约束条件
const constraints = {
  // 启用视频
  video: true,
};

function ScreenSharing() {
  const videoRef = useRef(null);
  // 开始捕获桌面
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      console.log('handleSuccess');
      handleSuccess(stream);
    } catch (error) {
      handleError(error);
    }
  };

  // 成功捕获，返回视频流
  const handleSuccess = (stream) => {
    const video = videoRef.current;
    // 获取视频轨道
    const videoTracks = stream.getVideoTracks();
    // 读取视频资源名称
    console.log(`视频资源名称：${videoTracks[0].label}`);
    // 使stream在浏览器控制台可见
    window.stream = stream;
    // 将视频对象的源指定为stream
    video.srcObject = stream;
  };

  // 错误处理
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
        <span>共享屏幕示例</span>
      </h1>
      <video className="video" ref={videoRef} autoPlay playsInline />
      <Button onClick={startScreenShare}>开始共享</Button>
    </div>
  );
}

export default ScreenSharing;

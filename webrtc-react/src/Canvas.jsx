import { useRef, useEffect } from 'react';
import { Button } from 'antd';

function Canvas() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 获取视频成功
  const handleSuccess = (stream) => {
    window.stream = stream;
    // 将视频源指定视频流
    videoRef.current.srcObject = stream;
  };

  // 错误处理
  const handleError = (error) => {
    console.log(
      'navigator.MediaDevices.getUserMedia error: ',
      error.message,
      error.name,
    );
  };

  useEffect(() => {
    const constraints = {
      // 禁用音频
      audio: false,
      // 启用视频
      video: true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  // 截屏处理
  const takeSnap = () => {
    // 获取video对象
    const video = videoRef.current;
    // 获取画布对象
    const canvas = canvasRef.current;
    // 设置画布宽度
    canvas.width = video.videoWidth;
    // 设置画布高度
    canvas.height = video.videoHeight;
    // 根据视频对象、xy坐标、画布宽、画布高绘图
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  };
  return (
    <div className="container">
      <h1>
        <span>截取视频示例</span>
      </h1>
      <div>
        <video className="small-video" ref={videoRef} playsInline autoPlay />
        <canvas className="small-canvas" ref={canvasRef} />
        <Button className="button" onClick={takeSnap}>
          截屏
        </Button>
      </div>
    </div>
  );
}

export default Canvas;

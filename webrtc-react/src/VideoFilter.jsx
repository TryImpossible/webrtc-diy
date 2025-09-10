import { useRef, useEffect } from 'react';
import { Select } from 'antd';
import './styles/css/video-filter.scss';

const constraints = {
  // 禁用音频
  audio: false,
  // 启用视频
  video: true,
};

function VideoFilter() {
  const videoRef = useRef(null);

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
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  // 下拉列表框中的选项改变
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    // 改变video的className，从而改变滤镜
    videoRef.current.className = value;
  };
  return (
    <div className="container">
      <h1>
        <span>视频滤镜示例</span>
      </h1>
      <video ref={videoRef} playsInline autoPlay></video>
      <Select
        defaultValue={'none'}
        style={{ width: '100px' }}
        onChange={handleChange}>
        <Select.Option value="none">没有滤镜</Select.Option>
        <Select.Option value="blur">模糊</Select.Option>
        <Select.Option value="grayscale">灰度</Select.Option>
        <Select.Option value="invert">反转</Select.Option>
        <Select.Option value="sepia">深褐色</Select.Option>
      </Select>
    </div>
  );
}

export default VideoFilter;

import { useRef } from 'react';
import { Button, Select } from 'antd';
const { Option } = Select;

// QVGA 320x240
const qvgaConstraints = {
  video: {
    width: { exact: 320 },
    height: { exact: 240 },
  },
};

// VGA 640x480
const vgaConstraints = {
  video: {
    width: { exact: 640 },
    height: { exact: 480 },
  },
};

// 高清 1280x720
const hdConstraints = {
  // 视频
  video: {
    // 宽
    width: { exact: 1280 },
    // 高
    height: { exact: 720 },
  },
};

// 超清 1920x1080
const fullHdConstraints = {
  video: {
    width: { exact: 1920 },
    height: { exact: 1080 },
  },
};

// 2K 2560x1440
const twoKConstraints = {
  video: {
    width: { exact: 2560 },
    height: { exact: 1440 },
  },
};

//4K 4096x2160
const fourKConstraints = {
  video: {
    width: { exact: 4096 },
    height: { exact: 2160 },
  },
};

//8K 7680x4320
const eightKConstraints = {
  video: {
    width: { exact: 7680 },
    height: { exact: 4320 },
  },
};

function Resolution() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const constraintsRef = useRef(null);

  // 得到视频流处理
  const gotStream = (mediaStream) => {
    streamRef.current = window.stream = mediaStream;
    // 将video视频源指定为mediaStream
    videoRef.current.srcObject = mediaStream;
    const track = mediaStream.getVideoTracks()[0];
    constraintsRef.current = track.getConstraints();
    console.log(`约束条件为：${JSON.stringify(constraintsRef.current)}`);
  };

  // 错误处理
  const handleError = (error) => {
    console.log(`访问用户媒体设备失败：${error.name}, ${error.message}`);
  };

  // 根据约束获取视频
  const getMedia = async (constraints) => {
    // 判断流对象是否为空
    if (streamRef.current) {
      // 迭代并停止所有轨道
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
    // 重新获取视频
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .catch(handleError);
  };

  // 下拉列表框中的选项改变
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    // 根据下拉列表框的值获取不同分辨率的视频
    switch (value) {
      case 'qvga':
        getMedia(qvgaConstraints);
        break;
      case 'vga':
        getMedia(vgaConstraints);
        break;
      case 'hd':
        getMedia(hdConstraints);
        break;
      case 'fullhd':
        getMedia(fullHdConstraints);
        break;
      case '2k':
        getMedia(twoKConstraints);
        break;
      case '4k':
        getMedia(fourKConstraints);
        break;
      case '8k':
        getMedia(eightKConstraints);
        break;
      default:
        break;
    }
  };

  // 动态改变分辨率
  const dynamicChange = () => {
    // 获取当前视频流中的视频轨道
    const track = window.stream.getVideoTracks()[0];
    console.log(`应用高清效果：${JSON.stringify(hdConstraints)}`);
    track
      .applyConstraints(hdConstraints)
      .then(() => {
        console.log('动态改变分辨率成功');
      })
      .catch((err) => {
        console.log('动态改变分辨率错误：', err.name);
      });
  };
  return (
    <div className="container">
      <h1>
        <span>视频分辨率示例</span>
      </h1>
      <video ref={videoRef} playsInline autoPlay></video>
      <Select
        defaultValue="vga"
        style={{ width: '100px', marginLeft: '20px' }}
        onChange={handleChange}>
        <Option value="qvga">QVGA</Option>
        <Option value="vga">VGA</Option>
        <Option value="hd">高清</Option>
        <Option value="fullhd">超清</Option>
        <Option value="2k">2K</Option>
        <Option value="4k">4K</Option>
        <Option value="8k">8K</Option>
      </Select>
      <Button style={{ marginLeft: '20px' }} onClick={dynamicChange}>
        动态设置
      </Button>
    </div>
  );
}

export default Resolution;

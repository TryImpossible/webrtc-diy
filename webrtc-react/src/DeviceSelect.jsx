import { useRef, useState, useEffect } from 'react';
import { Button, Select } from 'antd';
const { Option } = Select;

function DeviceSelect() {
  // 视频对象
  const videoRef = useRef(null);

  // 当前选择的音频输入设备
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  // 当前选择的音频输出设备
  const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] =
    useState('');
  // 当前选择的视频输入设备
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  // 视频输入设备列表
  const [videoDevices, setVideoDevices] = useState([]);
  // 音频输入设备列表
  const [audioDevices, setAudioDevices] = useState([]);
  // 音频输出设备列表
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);

  useEffect(() => {
    // 更新设备列表
    function updateDevices() {
      return new Promise((resolve) => {
        // 视频输入设备列表
        const videoDevices = [];
        // 音频输入设备列表
        const audioDevices = [];
        // 音频输出设备列表
        const audioOutputDevices = [];
        // 枚举所有设备
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            for (const device of devices) {
              // 过滤出视频输入设备
              if (device.kind === 'videoinput') {
                videoDevices.push(device);
                // 过滤出音频输入设备
              } else if (device.kind === 'audioinput') {
                audioDevices.push(device);
                // 过滤出音频输出设备
              } else if (device.kind === 'audiooutput') {
                audioOutputDevices.push(device);
              }
            }
          })
          .then(() => {
            // 处理好后 将三种设备数据返回
            const data = { videoDevices, audioDevices, audioOutputDevices };
            console.log('321', JSON.stringify(data));
            resolve(data);
          });
      });
    }

    updateDevices().then((data) => {
      // 判断当前选择的音频输入设备是否为空并且是否有设备
      if (selectedAudioDevice === '' && data.audioDevices.length > 0) {
        // 默认选中第一个设备
        setSelectedAudioDevice(data.audioDevices[0].deviceId);
      }
      // 判断当前选择的音频输出设备是否为空并且是否有设备
      if (
        selectedAudioOutputDevice === '' &&
        data.audioOutputDevices.length > 0
      ) {
        // 默认选中第一个设备
        setSelectedAudioOutputDevice(data.audioOutputDevices[0].deviceId);
      }
      // 判断当前选择的视频输入设备是否为空并且是否有设备
      if (selectedVideoDevice === '' && data.videoDevices.length > 0) {
        // 默认选中第一个设备
        setSelectedVideoDevice(data.videoDevices[0].deviceId);
      }
      // 设备当前设备Id
      setVideoDevices(data.videoDevices);
      setAudioDevices(data.audioDevices);
      setAudioOutputDevices(data.audioOutputDevices);
    });
  }, [selectedAudioDevice, selectedAudioOutputDevice, selectedVideoDevice]);

  // 开始测试
  const startTest = () => {
    // 获取音频输入设备Id
    const audioSource = selectedAudioDevice;
    // 获取视频输入设备Id
    const videoSource = selectedVideoDevice;
    // 定义约束条件
    const constraints = {
      // 设置音频设备Id
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
      // 设置视频设备Id
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
    };
    // 根据约束条件获取数据流
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // 成功返回间视频流
        window.stream = stream;
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 音频输入设备改变
  const handleAudioDeviceChange = (e) => {
    console.log('选择的音频输入设备为：' + JSON.stringify(e));
    setSelectedAudioDevice(e);
    setTimeout(() => {
      startTest();
    }, 100);
  };

  // 视频输入设备改变
  const handleVideoDeviceChange = (e) => {
    console.log('选择的视频输入设备为：' + JSON.stringify(e));
    setSelectedVideoDevice(e);
    setTimeout(() => {
      startTest();
    }, 100);
  };

  // 音频输出设备改变
  const handleAudioOutputDeviceChange = (e) => {
    console.log('选择的音频输出设备为：' + JSON.stringify(e));
    setSelectedAudioOutputDevice(e);
    if (typeof videoRef.current.sinkId != 'undefined') {
      // 调用HTMLMediaElement的setSinkId()方法改变输出源
      videoRef.current
        .setSinkId(e)
        .then((sinkId) => {
          console.log(`音频输出设备设置成功：${sinkId}`);
        })
        .catch((err) => {
          if (err.name === 'SecurityError') {
            console.log(`你需要使用HTTPS来选择输出设备：${err}`);
          }
        });
    } else {
      console.warn('你的浏览器不支持输出设备选择');
    }
  };

  return (
    <div className="container">
      <h1>
        <span>输入输出设备选择示例</span>
      </h1>
      {/* 音频输入设备列表 */}
      <Select
        value={selectedAudioDevice}
        style={{ width: 150, marginRight: '10px' }}
        onChange={handleAudioDeviceChange}>
        {audioDevices.map((device) => {
          return (
            <Option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </Option>
          );
        })}
      </Select>
      {/* 音频输出设备列表 */}
      <Select
        value={selectedAudioOutputDevice}
        style={{ width: 150, marginRight: '10px' }}
        onChange={handleAudioOutputDeviceChange}>
        {audioOutputDevices.map((device) => {
          return (
            <Option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </Option>
          );
        })}
      </Select>
      {/* 视频输入设备列表 */}
      <Select
        value={selectedVideoDevice}
        style={{ width: 150, marginRight: '10px' }}
        onChange={handleVideoDeviceChange}>
        {videoDevices.map((device) => {
          return (
            <Option value={device.deviceId} key={device.deviceId}>
              {device.label}
            </Option>
          );
        })}
      </Select>
      <video
        className="video"
        ref={videoRef}
        autoPlay
        playsInline
        style={{ objectFit: 'contain', marginTop: '10px' }}></video>
      <Button onClick={startTest}>测试</Button>
    </div>
  );
}

export default DeviceSelect;

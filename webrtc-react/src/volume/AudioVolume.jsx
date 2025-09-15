import { useRef, useEffect, useState } from 'react';
import SoundMeter from './soundmeter.js';

function AudioVolume() {
  // 音量测算对象
  const soundMeterRef = useRef(null);
  // 音量值
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    // 获取媒体成功
    const handleSuccess = (stream) => {
      window.stream = stream;
      // 将声音测量对象与流连接起来
      soundMeterRef.current.connectToSource(stream);
      // 开始实时读取音量值
      setTimeout(() => {
        soundMeterProcess();
      }, 100);
    };

    // 错误处理
    const handleError = (error) => {
      console.log(
        'navigator.mediaDevices.getUserMedia error: ',
        error.message,
        error.name,
      );
    };

    // 音频音量处理
    const soundMeterProcess = () => {
      // 读取音量值，再乘以一个系数，可以得到音量条的宽度
      var val = window.soundMeter.instant.toFixed(2) * 348 + 1;
      console.log('value', val);
      // 设置音量值状态
      setAudioLevel(val);
      // 每隔100毫秒调用soundMeterProcess函数，模拟实时检测音频音量
      setTimeout(() => {
        soundMeterProcess();
      }, 100);
    };

    try {
      // AudioContext用于管理和播放所有的声音
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      // 实例化AudioContext
      window.audioContext = new AudioContext();
    } catch (err) {
      console.log('网页音频API不支持', err.message);
    }
    // SoundMeter音量测算，用于进行音量声音测算
    soundMeterRef.current = window.soundMeter = new SoundMeter(
      window.audioContext,
    );
    const constraints = {
      // 启用音频
      audio: true,
      // 禁用视频
      video: false,
    };
    window.constraints = constraints;
    // 根据约束条件获取媒体
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);
  }, []);

  return (
    <div className="container">
      <h1>
        <span>音量检测示例</span>
      </h1>
      {/* 这是使用了一个div来作为音量条的展示，高度固定，宽度根据音量值动态变化 */}
      <div
        style={{
          width: audioLevel + 'px',
          height: '10px',
          backgroundColor: '#8dc63f',
          marginTop: '20px',
        }}></div>
    </div>
  );
}

export default AudioVolume;

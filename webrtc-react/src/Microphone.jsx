import { useRef, useEffect } from 'react';
const constraints = {
  // 启用音频
  audio: true,
  // 禁用视频
  video: false,
};
function Microphone() {
  const myAudio = useRef(null);

  // 获取媒体成功
  const handleSuccess = (stream) => {
    // 获取audio对象
    const audio = myAudio.current;
    // 获取音频轨道
    const audioTracks = stream.getAudioTracks();
    // 获取音频设备名称
    console.log('获取的音频设备为：', audioTracks[0].label);
    // 不活动状态
    stream.oninactive = () => {
      console.log('流停止了');
    };
    window.stream = stream;
    // 将autdio播放源指定为stream
    audio.srcObject = stream;
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
    async function openMicriophone() {
      try {
        // 根据约束条件获取媒体
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleSuccess(stream);
      } catch (error) {
        handleError(error);
      }
    }
    openMicriophone();
  }, []);

  return (
    <div className="container">
      <h1>
        <span>麦克风示例</span>
      </h1>
      <audio ref={myAudio} controls autoPlay />
      <p className="warning">
        警告：如果没有使用头戴式耳机，声音会反馈到扬声器
      </p>
    </div>
  );
}

export default Microphone;

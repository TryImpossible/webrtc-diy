import { useEffect, useRef } from 'react';
import { Button } from 'antd';

function MediaStreamAPI() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    async function openDevice() {
      try {
        // 根据约束获取多媒体
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          // 启用音频
          audio: true,
          // 启用视频
          video: true,
        });
        videoRef.current.srcObject = streamRef.current;
      } catch (error) {
        console.error('获取多媒体设备失败', error);
      }
    }
    openDevice();
  }, []);

  // 获取所有轨道，包括音频及视频
  const btnGetTracks = () => {
    console.log('getTracks()');
    console.log(streamRef.current.getTracks());
  };
  // 获取音频轨道列表
  const btnGetAudioTracks = () => {
    console.log('getAudioTracks()');
    console.log(streamRef.current.getAudioTracks());
  };
  // 根据Id获取音频轨道
  const btnGetAudioTrackById = () => {
    console.log('getTrackById()');
    console.log(
      streamRef.current.getTrackById(streamRef.current.getAudioTracks()[0].id),
    );
  };
  // 删除音频轨道
  const btnRemoveAudioTrack = () => {
    console.log('removeAudioTrack()');
    streamRef.current.removeTrack(streamRef.current.getAudioTracks()[0].id);
  };
  // 获取视频轨道列表
  const btnGetVideoTracks = () => {
    console.log('getVideoTracks()');
    console.log(streamRef.current.getVideoTracks());
  };
  // 删除视频轨道
  const btnRemoveVideoTrack = () => {
    console.log('removeVideoTrack()');
    streamRef.current.removeTrack(streamRef.current.getAudioTracks()[0]);
  };
  return (
    <div className="container">
      <h1>
        <span>MediaStreamAPI测试</span>
      </h1>
      <video className="video" ref={videoRef} autoPlay playsInline></video>
      <Button onClick={btnGetTracks} style={{ width: '120px' }}>
        获取所有轨道
      </Button>
      <Button onClick={btnGetAudioTracks} style={{ width: '120px' }}>
        获取音频轨道
      </Button>
      <Button onClick={btnGetAudioTrackById} style={{ width: '120px' }}>
        根据Id获取音频轨道
      </Button>
      <Button onClick={btnRemoveAudioTrack} style={{ width: '120px' }}>
        删除音频轨道
      </Button>
      <Button onClick={btnGetVideoTracks} style={{ width: '120px' }}>
        获取视频轨道
      </Button>
      <Button onClick={btnRemoveVideoTrack} style={{ width: '120px' }}>
        删除视频轨道
      </Button>
    </div>
  );
}

export default MediaStreamAPI;

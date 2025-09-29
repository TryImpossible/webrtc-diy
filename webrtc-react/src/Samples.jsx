import { List } from 'antd';
import { Link } from 'react-router-dom';

const routes = [
  { title: '首页', path: '/' },
  { title: '打开摄像头', path: '/camera' },
  { title: '打开麦克风', path: '/microphone' },
  { title: '截取视频', path: '/canvas' },
  { title: '共享屏幕', path: '/screen-sharing' },
  { title: '视频滤镜', path: '/video-filter' },
  { title: '视频分辨率设置', path: '/resolution' },
  { title: '音量检测', path: '/audio-volume' },
  { title: '设备枚举', path: '/device-select' },
  { title: '设置综合示例', path: '/media-settings' },
  { title: 'MediaStreamAPI测试', path: '/media-stream-api' },
  { title: '捕获Video媒体流', path: '/capture-video' },
  { title: '捕获Canvas媒体流', path: '/capture-canvas' },
  { title: '录制音频', path: '/record-audio' },
  { title: '录制视频', path: '/record-video' },
  { title: '录制屏幕', path: '/record-screen' },
  { title: '录制Canvas', path: '/record-canvas' },
  { title: 'RTCPeerConnection', path: '/peer-connection' },
  { title: 'Video发送至远端', path: '/peer-connection-video' },
  { title: '电子白板同步', path: '/peer-connection-canvas' },
  { title: '数据通道发送文本消息', path: '/data-channel' },
  { title: '数据通道发送文件', path: '/data-channel-file' },
];

function Samples() {
  return (
    <div>
      <List
        header={<div>WebRTC示例</div>}
        footer={<div>Footer</div>}
        bordered
        dataSource={routes}
        renderItem={(item) => (
          <List.Item>
            <Link to={item['path']}>{item['title']}</Link>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Samples;

import { useEffect, useRef } from 'react';
import { Button } from 'antd';
import './styles/css/pc-canvas.scss';

/**
 * Canavs发送至远端示例
 */
function PeerConnectionCanvas() {
  // 画布对象
  const canvasRef = useRef(null);
  // 画布2d内容
  const contextRef = useRef(null);
  // 远端视频
  const remoteVideoRef = useRef(null);
  // 本地流
  const localStreamRef = useRef(null);
  // PeerA连接对象
  const peerConnARef = useRef(null);
  // PeerB连接对象
  const peerConnBRef = useRef(null);

  useEffect(() => {
    // 画线
    const drawLine = () => {
      const canvas = canvasRef.current;

      // 获取Canvas的2d内容
      contextRef.current = canvas.getContext('2d');
      const context = contextRef.current;

      // 填充颜色
      context.fillStyle = '#CCC';
      // 绘制Canvas背景
      // context.fillRect(0, 0, canvas.width, canvas.height);

      context.lineWidth = 1;
      // 画笔颜色
      context.strokeStyle = '#FF0000';

      // 监听画板鼠标按下事件，开始绘画
      canvas.addEventListener('mousedown', startAction);
      // 监听画板鼠标抬起事件，结束绘画
      canvas.addEventListener('mouseup', endAction);
    };

    // 鼠标按下事件
    const startAction = (event) => {
      const context = contextRef.current;

      // 绘制Canvas背景
      const canvas = canvasRef.current;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 开始新的路径
      context.beginPath();
      // 将画笔移动到指定坐标，类似起点
      context.moveTo(event.offsetX, event.offsetY);
      // 开始绘制
      context.stroke();
      // 监听鼠标移动事件
      canvasRef.current.addEventListener('mousemove', moveAction);
    };

    // 鼠标移动事件
    const moveAction = (event) => {
      const context = contextRef.current;
      // 将画笔移动到结束坐标，类似终点
      context.lineTo(event.offsetX, event.offsetY);
      // 开始绘制
      context.stroke();
    };

    // 鼠标抬起事件
    const endAction = () => {
      // 移除鼠标移动事件
      canvasRef.current.removeEventListener('mousemove', moveAction);
    };

    localStreamRef.current = canvasRef.current.captureStream(10);
    drawLine();
  }, []);

  // 呼叫
  const call = async () => {
    console.log('开始呼叫...');
    const localStream = localStreamRef.current;
    // 视频轨道
    const videoTracks = localStream.getVideoTracks();
    // 音频轨道
    const audioTracks = localStream.getAudioTracks();
    // 判断视频轨道是否有值
    if (videoTracks.length > 0) {
      // 输出摄像头的名称
      console.log(`使用视频设备为：${videoTracks[0].label}`);
    }
    // 判断音频轨道是否有值
    if (audioTracks.length > 0) {
      // 输出麦克风的名称
      console.log(`使用音频设备为：${audioTracks[0].label}`);
    }

    // 设置ICE Server，使用Google服务器
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };
    // 创建RTCPeerConnection对象
    const peerConnA = new RTCPeerConnection(configuration);
    peerConnARef.current = peerConnA;
    console.log(`创建本地PeerConnection成功：peerConnA`);
    // 监听返回的Candidate信息
    peerConnA.addEventListener('icecandidate', onIceCandidateA);
    // 监听ICE状态变化
    peerConnA.addEventListener('iceconnectionstatechange', onIceStateChangeA);

    // 创建RTCPeerConnection对象
    const peerConnB = new RTCPeerConnection(configuration);
    peerConnBRef.current = peerConnB;
    console.log(`创建本地PeerConnection成功：peerConnB`);
    // 监听返回的Candidate信息
    peerConnB.addEventListener('icecandidate', onIceCandidateB);
    // 监听ICE状态变化
    peerConnB.addEventListener('iceconnectionstatechange', onIceStateChangeB);

    // 监听track事件，可以获取到远端视频流
    peerConnB.addEventListener('track', gotRemoteStream);

    //peerConnA.addStream(localStream);
    // 循环迭代本地流的所有轨道
    localStream.getTracks().forEach((track) => {
      // 把音视频轨道添加到连接中
      peerConnA.addTrack(track, localStream);
    });
    console.log(`将本地流添加到peerCoonA里`);
    try {
      console.log('peerConnA创建提议offer开始');
      // 创建提议Offer
      const offer = await peerConnA.createOffer();
      // 创建Offer成功
      await onCreateOfferSuccess(offer);
    } catch (error) {
      // 创建Offer失败
      onCreateSessionDescription(error);
    }
  };

  // 创建会话描述错误
  const onCreateSessionDescription = (error) => {
    console.log(`创建会话描述SD错误：${error.toString()}`);
  };
  // 创建提议Offer成功
  const onCreateOfferSuccess = async (desc) => {
    // peerCoonA创建Offer返回的SDP信息
    console.log(`peerConnA创建Offer返回的SDP信息\n${desc.sdp}`);
    console.log(`设置peerConnA的本地描述start`);
    const peerConnA = peerConnARef.current;
    try {
      // 设置peerConnA的本地描述
      await peerConnA.setLocalDescription(desc);
      onSetLocalSuccess(peerConnA);
    } catch (error) {
      onSetSessionDescriptionError(error);
    }

    console.log(`peerConnB开始设置远端描述`);
    const peerConnB = peerConnBRef.current;
    try {
      // 设置peerConnB的远端描述
      await peerConnB.setRemoteDescription(desc);
      onSetRemoteSuccess(peerConnB);
    } catch (error) {
      // 创建会话描述错误
      onSetSessionDescriptionError(error);
    }

    console.log(`peerConnB开始创建应答Answer`);
    try {
      // 创建应答Answer
      const answer = await peerConnB.createAnswer();
      // 创建应答成功
      await onCreateAnswerSuccess(answer);
    } catch (error) {
      // 创建会话描述错误
      onCreateSessionDescription(error);
    }
  };

  // 设置本地描述完成
  const onSetLocalSuccess = (pc) => {
    console.log(`${getName(pc)}设置本地描述完成：setLocalDescription`);
  };

  // 设置远端描述完成
  const onSetRemoteSuccess = (pc) => {
    console.log(`${getName(pc)}设置远端描述完成：setRemoteDescription`);
  };

  // 设置描述SD错误
  const onSetSessionDescriptionError = (error) => {
    console.log(`设置描述SD错误：${error.toString()}`);
  };

  const getName = (pc) => {
    return pc === peerConnARef.current ? 'peerConnA' : 'peerConnB';
  };

  // 获取到远端视频流
  const gotRemoteStream = (e) => {
    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo.srcObject !== e.streams[0]) {
      // 取集合第一个元素
      remoteVideo.srcObject = e.streams[0];
      console.log(`peerConnB开始接收远端流`);
      remoteVideo
        .play()
        .catch((err) => console.error('远端视频播放失败:', err));
    }
  };

  // 创建应答成功
  const onCreateAnswerSuccess = async (desc) => {
    // 输出SDP信息
    console.log(`peerConnB的应答Answer数据：\n${desc.sdp}`);

    console.log(`peerConnB设置本地描述开始：setLocalDescription`);
    try {
      // 设置peerConnB的本地描述信息
      await peerConnBRef.current.setLocalDescription(desc);
      onSetLocalSuccess(peerConnBRef.current);
    } catch (error) {
      onSetSessionDescriptionError(error);
    }

    console.log(`peerConnA设置远端描述开始：setRemoteDescription`);
    try {
      // 设置peerConnA的远端描述信息
      await peerConnARef.current.setRemoteDescription(desc);
      onSetRemoteSuccess(peerConnARef.current);
    } catch (error) {
      onSetSessionDescriptionError(error);
    }
  };

  // Candidate事件回调方法
  const onIceCandidateA = async (event) => {
    try {
      if (event.candidate) {
        // 将peerConnA的Candidate添加至peerConnB
        await peerConnBRef.current.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(peerConnBRef.current);
      }
    } catch (error) {
      onAddIceCandidateError(peerConnBRef.current, error);
    }
    console.log(
      `IceCandidate数据：\n${event.candidate ? event.candidate.candidate : '(null)'}`,
    );
  };

  // Candidate事件回调方法
  const onIceCandidateB = async (event) => {
    try {
      if (event.candidate) {
        // 将peerConnB的Candidate添加至peerConnA
        await peerConnARef.current.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(peerConnARef.current);
      }
    } catch (error) {
      onAddIceCandidateError(peerConnARef.current, error);
    }
    console.log(
      `IceCandidate数据：\n${event.candidate ? event.candidate.candidate : '(null)'}`,
    );
  };

  // 添加Candidate成功
  const onAddIceCandidateSuccess = (pc) => {
    console.log(`${getName(pc)}添加IceCandidate成功`);
  };

  // 添加Candidate失败
  const onAddIceCandidateError = (pc, error) => {
    console.log(`${getName(pc)}添加IceCandidate失败：${error.toString()}`);
  };

  // 监听ICE状态变化事件回调方法
  const onIceStateChangeA = (event) => {
    console.log(
      `peerConnA连接的ICE状态：${peerConnARef.current.iceConnectionState}`,
    );
    console.log('ICE状态改变事件', event);
  };

  // 监听ICE状态变化事件回调方法
  const onIceStateChangeB = (event) => {
    console.log(
      `peerConnB连接的ICE状态：${peerConnBRef.current.iceConnectionState}`,
    );
    console.log('ICE状态改变事件', event);
  };

  // 断开连接
  const hangup = () => {
    console.log('结束会话');
    // 关闭peerConnA
    peerConnARef.current.close();
    // 将peerConnA设置空
    peerConnARef.current = null;
    // 关闭peerConnB
    peerConnBRef.current.close();
    // 将peerConnB设置空
    peerConnBRef.current = null;
  };

  return (
    <div className="container">
      <h1>
        <span>Canvas发送至远端示例</span>
      </h1>
      <div>
        {/* 画布Canvasp容器 */}
        <div className="small-canvas">
          {/* Canvas不设置样式 */}
          <canvas ref={canvasRef} width="320" height="240"></canvas>
        </div>
        <video
          className="small-video"
          ref={remoteVideoRef}
          playsInline
          autoPlay></video>
      </div>
      <div>
        <Button onClick={call} style={{ marginRight: '10px' }}>
          呼叫
        </Button>
        <Button onClick={hangup} style={{ marginRight: '10px' }}>
          挂断
        </Button>
      </div>
    </div>
  );
}

export default PeerConnectionCanvas;

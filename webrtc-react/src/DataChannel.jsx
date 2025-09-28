import { useRef } from 'react';
import { Button } from 'antd';
import './styles/css/data-channel.scss';

/**
 * 数据通道示例
 */
function DataChannel() {
  // 本地连接对象
  const localConnectionRef = useRef(null);
  // 远端连接对象
  const remoteConnectionRef = useRef(null);
  // 发送通道
  const sendChannelRef = useRef(null);
  // 接收通道
  const receiveChannelRef = useRef(null);

  const dataChannelSendRef = useRef(null);
  const dataChannelReceiveRef = useRef(null);

  // 呼叫
  const call = async () => {
    console.log('开始呼叫...');

    // 设置ICE Server，使用Google服务器
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    };
    // 创建RTCPeerConnection对象
    const localConnection = new RTCPeerConnection(configuration);
    localConnectionRef.current = localConnection;
    console.log(`创建本地PeerConnection成功：localConnection`);
    // 监听返回的Candidate信息
    localConnection.addEventListener('icecandidate', onLocalIceCandidate);
    // 监听ICE状态变化
    localConnection.addEventListener(
      'iceconnectionstatechange',
      onLocalIceStateChange,
    );
    // 实例化发送通道
    const sendChannel = localConnection.createDataChannel('webrtc-datachannel');
    sendChannelRef.current = sendChannel;
    // onopen事件监听
    sendChannel.onopen = onSendChannelStateChange;
    // onclose事件监听
    sendChannel.onclose = onSendChannelStateChange;

    // 创建RTCPeerConnection对象
    const remoteConnection = new RTCPeerConnection(configuration);
    remoteConnectionRef.current = remoteConnection;
    console.log(`创建本地PeerConnection成功：remoteConnection`);
    // 监听返回的Candidate信息
    remoteConnection.addEventListener('icecandidate', onRemoteIceCandidate);
    // 监听ICE状态变化
    remoteConnection.addEventListener(
      'iceconnectionstatechange',
      onRemoteIceStateChange,
    );
    // 远端连接数据到达事件监听
    remoteConnection.ondatachannel = receiveChannelCallback;

    try {
      console.log('localConnection创建提议offer开始');
      // 创建提议Offer
      const offer = await localConnection.createOffer();
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
    // localConnect创建Offer返回的SDP信息
    console.log(`localConnection创建Offer返回的SDP信息\n${desc.sdp}`);
    console.log(`设置localConnection的本地描述start`);
    const localConnection = localConnectionRef.current;
    try {
      // 设置localConnection的本地描述
      await localConnection.setLocalDescription(desc);
      onSetLocalSuccess(localConnection);
    } catch (error) {
      onSetSessionDescriptionError(error);
    }

    console.log(`remoteConnection开始设置远端描述`);
    const remoteConnection = remoteConnectionRef.current;
    try {
      // 设置remoteConnection的远端描述
      await remoteConnection.setRemoteDescription(desc);
      onSetRemoteSuccess(remoteConnection);
    } catch (error) {
      // 创建会话描述错误
      onSetSessionDescriptionError(error);
    }

    console.log(`remoteConnection开始创建应答Answer`);
    try {
      // 创建应答Answer
      const answer = await remoteConnection.createAnswer();
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
    return pc === localConnectionRef.current
      ? 'localConnection'
      : 'remoteConnection';
  };

  // 创建应答成功
  const onCreateAnswerSuccess = async (desc) => {
    // 输出SDP信息
    console.log(`remoteConnection的应答Answer数据：\n${desc.sdp}`);

    console.log(`remoteConnection设置本地描述开始：setLocalDescription`);
    try {
      // 设置remoteConnection的本地描述信息
      await remoteConnectionRef.current.setLocalDescription(desc);
      onSetLocalSuccess(remoteConnectionRef.current);
    } catch (error) {
      onSetSessionDescriptionError(error);
    }

    console.log(`localConnection设置远端描述开始：setRemoteDescription`);
    try {
      // 设置localConnection的远端描述信息
      await localConnectionRef.current.setRemoteDescription(desc);
      onSetRemoteSuccess(localConnectionRef.current);
    } catch (error) {
      onSetSessionDescriptionError(error);
    }
  };

  // Candidate事件回调方法
  const onLocalIceCandidate = async (event) => {
    try {
      if (event.candidate) {
        // 将localConnection的Candidate添加至remoteConnection
        await remoteConnectionRef.current.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(remoteConnectionRef.current);
      }
    } catch (error) {
      onAddIceCandidateError(remoteConnectionRef.current, error);
    }
    console.log(
      `IceCandidate数据：\n${event.candidate ? event.candidate.candidate : '(null)'}`,
    );
  };

  // Candidate事件回调方法
  const onRemoteIceCandidate = async (event) => {
    try {
      if (event.candidate) {
        // 将remoteConnection的Candidate添加至localConnection
        await localConnectionRef.current.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(localConnectionRef.current);
      }
    } catch (error) {
      onAddIceCandidateError(localConnectionRef.current, error);
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
  const onLocalIceStateChange = (event) => {
    console.log(
      `localConnection连接的ICE状态：${localConnectionRef.current.iceConnectionState}`,
    );
    console.log('ICE状态改变事件', event);
  };

  // 监听ICE状态变化事件回调方法
  const onRemoteIceStateChange = (event) => {
    console.log(
      `remoteConnection连接的ICE状态：${remoteConnectionRef.current.iceConnectionState}`,
    );
    console.log('ICE状态改变事件', event);
  };

  // 断开连接
  const hangup = () => {
    console.log('结束会话');
    // 关闭localConnection
    localConnectionRef.current.close();
    // 将localConnection设置空
    localConnectionRef.current = null;
    // 关闭remoteConnection
    remoteConnectionRef.current.close();
    // 将remoteConnection设置空
    remoteConnectionRef.current = null;
  };

  const sendData = () => {
    const dataChannelSend = dataChannelSendRef.current;
    const data = dataChannelSend.value;
    sendChannelRef.current.send(data);
    console.log('发送的数据：', data);
  };

  // 接收通道数据到达回调方法
  const receiveChannelCallback = (event) => {
    console.log(`Receive Channel Callback`);
    // 实例化接收通道
    const receiveChannel = event.channel;
    receiveChannelRef.current = receiveChannel;
    // 接收消息事件监听
    receiveChannel.onmessage = onReceiveMessageCallback;
    // onopen事件监听
    receiveChannel.onopen = onReceiveChannelStateChange;
    // onclose事件
    receiveChannel.onclose = onReceiveChannelStateChange;
  };

  // 接收消息处理
  const onReceiveMessageCallback = (event) => {
    console.log(`接收的数据：` + event.data);
    const dataChannelReceive = dataChannelReceiveRef.current;
    dataChannelReceive.value = event.data;
  };

  // 发送通道状态变化
  const onSendChannelStateChange = () => {
    const readyState = sendChannelRef.current.readyState;
    console.log(`发送通道状态：` + readyState);
  };

  // 接收通道状态变化
  const onReceiveChannelStateChange = () => {
    const readyState = receiveChannelRef.current.readyState;
    console.log(`接收通道状态：` + readyState);
  };

  return (
    <div className="container">
      <div>
        <div>
          <h2>发送</h2>
          <textarea
            ref={dataChannelSendRef}
            disabled={false}
            placeholder="请输入要发送的文本..."></textarea>
        </div>
        <div>
          <h2>接收</h2>
          <textarea
            ref={dataChannelReceiveRef}
            disabled={true}
            placeholder="请输入要发送的文本..."></textarea>
        </div>
      </div>
      <div>
        <Button onClick={call} style={{ marginRight: '10px' }}>
          呼叫
        </Button>
        <Button onClick={sendData} style={{ marginRight: '10px' }}>
          发送
        </Button>
        <Button onClick={hangup} style={{ marginRight: '10px' }}>
          挂断
        </Button>
      </div>
    </div>
  );
}

export default DataChannel;

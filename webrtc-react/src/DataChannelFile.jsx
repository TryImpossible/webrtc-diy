import { useEffect, useRef } from 'react';
import { Button } from 'antd';

/**
 * 数据通道发送文件
 */
function DataChannelFile() {
  // 本地连接对象
  const localConnectionRef = useRef(null);
  // 远端连接对象
  const remoteConnectionRef = useRef(null);
  // 发送通道
  const sendChannelRef = useRef(null);
  // 接收通道
  const receiveChannelRef = useRef(null);
  // 文件读取
  const fileReaderRef = useRef(null);
  // 接收数据缓存
  const receiveBufferRef = useRef([]);
  // 接收到的数据大小
  const receivedSizeRef = useRef(0);
  // 文件选择
  const fileInputRef = useRef(null);
  // 发送进度条
  const sendProgressRef = useRef(null);
  // 接收进度条
  const receiveProgressRef = useRef(null);
  // 下载
  const downloadRef = useRef(null);

  useEffect(() => {
    // 监听change事件，判断文件是否选择
    fileInputRef.current.addEventListener('change', async () => {
      const file = fileInputRef.current.files[0];
      if (!file) {
        console.log('没有选择文件');
      } else {
        console.log('选择的文件是：' + file.name);
      }
    });
  }, []);

  // 建立对待连接并发送文件
  const startSendFile = async () => {
    // 创建RTCPeerConnection对象
    const localConnection = new RTCPeerConnection();
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
    // 数据类型为二进制
    sendChannel.binaryType = 'arraybuffer';
    // onopen事件监听
    sendChannel.onopen = onSendChannelStateChange;
    // onclose事件监听
    sendChannel.onclose = onSendChannelStateChange;

    // 创建RTCPeerConnection对象
    const remoteConnection = new RTCPeerConnection();
    remoteConnectionRef.current = remoteConnection;
    console.log(`创建远端PeerConnection成功：remoteConnection`);
    // 监听返回的Candidate信息
    remoteConnection.addEventListener('icecandidate', onRemoteIceCandidate);
    // 监听ICE状态变化
    remoteConnection.addEventListener(
      'iceconnectionstatechange',
      onRemoteIceStateChange,
    );
    // 远端连接数据到达事件监听
    remoteConnection.addEventListener('datachannel', receiveChannelCallback);

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

  // 关闭数据通道
  const closeChannel = () => {
    console.log('关闭数据通道');
    sendChannelRef.current.close();
    if (receiveChannelRef.current) {
      receiveChannelRef.current.close();
    }
    // 关闭localConnection
    localConnectionRef.current.close();
    // 将localConnection设置空
    localConnectionRef.current = null;
    // 关闭remoteConnection
    remoteConnectionRef.current.close();
    // 将remoteConnection设置空
    remoteConnectionRef.current = null;
  };

  // 发送数据
  const sendData = () => {
    const file = fileInputRef.current.files[0];
    console.log(`文件是：${[file.name, file.size, file.type].join(' ')}`);
    // 设置发送进度条的最大值
    sendProgressRef.current.max = file.size;
    // 设置接收进度条的最大值
    receiveProgressRef.current.max = file.size;

    // 文件切片大小，即每次读取的文件大小
    const chunkSize = 16384;
    // 实例化文件读取对象
    const fileReader = new FileReader();
    fileReaderRef.current = fileReader;
    // 偏移量可用于表示进度
    let offset = 0;
    // 监听error事件
    fileReader.addEventListener('error', (error) => {
      console.error('读取文件出错：', error);
    });
    // 监听abort事件
    fileReader.addEventListener('abort', (event) => {
      console.log('读取文件取消：', event);
    });
    // 监听load事件
    fileReader.addEventListener('load', (event) => {
      console.log('文件加载完成：', event);
      // 使用发送通道开始发送文件数据
      sendChannelRef.current.send(event.target.result);
      // 使用二进制数据长度作为偏移量
      offset += event.target.result.byteLength;
      // 使用偏移量作为发送进度
      sendProgressRef.current.value = offset;
      console.log('当前文件发送进度为：', offset);
      // 判断偏移量是否小于文件大小
      if (offset < file.size) {
        // 继续读取
        readSlice(offset);
      }
    });
    // 读取切片大小
    const readSlice = (o) => {
      console.log('readSlice', o);
      // 将文件的某一段切割下来，从offset到offset + chunkSize位置切下
      let slice = file.slice(offset, o + chunkSize);
      // 读取切片的二进制数据
      fileReader.readAsArrayBuffer(slice);
    };
    // 首次读取0到chunkSize大小的切片数据
    readSlice(0);
  };

  // 接收通道数据到达回调方法
  const receiveChannelCallback = (event) => {
    // 实例化接收通道
    const receiveChannel = event.channel;
    receiveChannelRef.current = receiveChannel;
    // 数据类型为二进制
    receiveChannel.binaryType = 'arraybuffer';
    // 接收消息事件监听
    receiveChannel.onmessage = onReceiveMessageCallback;
    // onopen事件监听
    receiveChannel.onopen = onReceiveChannelStateChange;
    // onclose事件监听
    receiveChannel.onclose = onReceiveChannelStateChange;

    receivedSizeRef.current = 0;
  };

  // 接收消息处理
  const onReceiveMessageCallback = (event) => {
    console.log(`接收的数据 ${event.data.byteLength}`);
    // 将接收到的数据添加到接收缓存里
    receiveBufferRef.current.push(event.data);
    // 设置当前接收文件的大小
    receivedSizeRef.current += event.data.byteLength;
    // 使用接收文件的大小表示当前接收进度
    receiveProgressRef.current.value = receivedSizeRef.current;

    const file = fileInputRef.current.files[0];
    // 判断当前接收的文件大小是否等于文件的大小
    if (receivedSizeRef.current === file.size) {
      // 根据缓存数据生成Blob文件
      const received = new Blob(receiveBufferRef.current);
      // 将缓存数据设置为空
      receiveBufferRef.current = [];

      // 获取下载连接对象
      const download = downloadRef.current;
      // 创建下载文件对象及链接
      download.href = URL.createObjectURL(received);
      download.download = file.name;
      download.textContent = `点击下载 '${file.name}'(${file.size}) bytes`;
      download.style.display = 'block';
    }
  };

  // 发送通道状态变化
  const onSendChannelStateChange = () => {
    const readyState = sendChannelRef.current.readyState;
    console.log(`发送通道状态：` + readyState);
    if (readyState === 'open') {
      sendData();
    }
  };

  // 接收通道状态变化
  const onReceiveChannelStateChange = () => {
    const readyState = receiveChannelRef.current.readyState;
    console.log(`接收通道状态：` + readyState);
  };

  // 取消发送文件
  const cancelSendFile = () => {
    if (fileReaderRef.current && fileReaderRef.current.readyState === 1) {
      console.log('取消发送文件');
      fileReaderRef.current.abort();
    }
  };

  return (
    <div className="container">
      <div>
        <form id="fileInfo">
          <input type="file" ref={fileInputRef} />
        </form>
        <div>
          <h2>发送</h2>
          <progress
            ref={sendProgressRef}
            max={0}
            value={0}
            style={{ width: '500px' }}></progress>
        </div>
        <div>
          <h2>接收</h2>
          <progress
            ref={receiveProgressRef}
            max={0}
            value={0}
            style={{ width: '500px' }}></progress>
        </div>
      </div>
      <a ref={downloadRef}></a>
      <div>
        <Button onClick={startSendFile} style={{ marginRight: '10px' }}>
          发送
        </Button>
        <Button onClick={cancelSendFile} style={{ marginRight: '10px' }}>
          取消
        </Button>
        <Button onClick={closeChannel} style={{ marginRight: '10px' }}>
          关闭
        </Button>
      </div>
    </div>
  );
}

export default DataChannelFile;

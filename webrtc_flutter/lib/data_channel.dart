import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

/// 数据通道示例
class DataChannel extends StatefulWidget {
  const DataChannel({super.key});

  static String tag = '数据通道示例';

  @override
  State<DataChannel> createState() => _DataChannelState();
}

class _DataChannelState extends State<DataChannel> {
  // 本地连接
  RTCPeerConnection? _localConnection;
  // 远端连接
  RTCPeerConnection? _remoteConnection;
  RTCDataChannelInit? _dataChannelDict;
  // 发送通道
  RTCDataChannel? _sendChannel;
  // 接收通道
  RTCDataChannel? _receiveChannel;
  // 是否连接
  bool _isConnected = false;
  // 接收到的消息
  String _message = '';

  final Map<String, dynamic> _configuration = <String, dynamic>{
    // 使用Google服务器
    'iceServers': [
      {'url': 'stun:stun.l.google.com:19302'},
    ],
  };

  // SDP约束
  final Map<String, dynamic> _sdpConstraints = <String, dynamic>{
    'mandatory': {
      // 不接收语音数据
      'OfferToReceiveAudio': false,
      // 不接收视频数据
      'OfferToReceiveVideo': false,
    },
    'optional': [],
  };

  // PeerConnection约束
  final Map<String, dynamic> _pcConstraints = <String, dynamic>{
    'mandatory': {},
    'optional': [
      // 如果要与浏览器互通，则开启DtlsSrtpKeyAgreement
      {'DtlsSrtpKeyAgreement': true},
    ],
  };

  // 本地Ice连接状态
  void _onLocalIceConnectionState(RTCIceConnectionState state) {
    print('onLocalIceConnectionState: ${state.toString()}');
  }

  // 远端Ice连接状态
  void _onRemoteIceConnectionState(RTCIceConnectionState state) {
    print('onRemoteIceConnectionState: ${state.toString()}');
  }

  // 本地Candidate数据回调
  void _onLocalCandidate(RTCIceCandidate candidate) {
    print('LocalCandidate: ${candidate.candidate}');
    // 将本地Candidate添加至远端连接
    _remoteConnection?.addCandidate(candidate);
  }

  // 远端Candidate数据回调
  void _onRemoteCandidate(RTCIceCandidate candidate) {
    print('RemoteCandidate: ${candidate.candidate}');
    // 将远端Candidate添加至本地连接
    _localConnection?.addCandidate(candidate);
  }

  // 远端DataChannel回调事件
  void _onDataChannel(RTCDataChannel dataChannel) {
    // 接收回调事件赋值
    _receiveChannel = dataChannel;
    // 监听数据通道消息
    _receiveChannel!.onMessage = _onReceiveMessageCallback;
    // 监听数据通道状态改变
    _receiveChannel!.onDataChannelState = _onDataChannelStateCallback;
  }

  // 接收消息回调方法
  void _onReceiveMessageCallback(RTCDataChannelMessage message) {
    print(message.text.toString());
    setState(() {
      _message = message.text;
    });
  }

  // 数据通道状态改变回调方法
  void _onDataChannelStateCallback(RTCDataChannelState state) {
    print('onDataChannelStateCallback: ${state.toString()}');
  }

  // 发送消息
  void _sendMessage() {
    _sendChannel?.send(RTCDataChannelMessage('测试数据'));
  }

  void _open() async {
    // 如果本地与远端连接创建，则返回
    if (_localConnection != null || _remoteConnection != null) {
      return;
    }
    try {
      // 创建本地连接对象
      _localConnection = await createPeerConnection(
        _configuration,
        _pcConstraints,
      );
      // 添加本地Candidate事件监听
      _localConnection!.onIceCandidate = _onLocalCandidate;
      // 添加本地Ice连接状态事件监听
      _localConnection!.onIceConnectionState = _onLocalIceConnectionState;

      // 实例化DataChannel初始化对象
      _dataChannelDict = RTCDataChannelInit();
      // 创建RTCDataChannel对象时设置的通道的唯一Id
      _dataChannelDict!.id = 1;
      // 表示通过RTCDataChannel的信息的到达顺序需要和发送顺序一致
      _dataChannelDict!.ordered = true;
      // 最大重传时间
      _dataChannelDict!.maxRetransmitTime = -1;
      // 最大重传次数
      _dataChannelDict!.maxRetransmits = -1;
      // 传输协议
      _dataChannelDict!.protocol = 'sctp';
      // 是否由用户代理或应用程序协商频道
      _dataChannelDict!.negotiated = false;
      // 创建发送通道
      _sendChannel = await _localConnection!.createDataChannel(
        'dataChannel',
        _dataChannelDict!,
      );

      // 创建远端连接对象
      _remoteConnection = await createPeerConnection(
        _configuration,
        _pcConstraints,
      );
      // 添加远端Candidate事件监听
      _remoteConnection!.onIceCandidate = _onRemoteCandidate;
      // 添加远端Ice连接状态事件监听
      _remoteConnection!.onIceConnectionState = _onRemoteIceConnectionState;
      // 远端DataChannel回调事件
      _remoteConnection!.onDataChannel = _onDataChannel;

      // 本地连接创建提议Offer
      final RTCSessionDescription offer = await _localConnection!.createOffer(
        _sdpConstraints,
      );
      print('offer: ${offer.sdp}');
      // 本地连接设置本地SDP信息
      _localConnection!.setLocalDescription(offer);
      // 远端连接设置远端SDP信息
      _remoteConnection!.setRemoteDescription(offer);

      // 远端连接创建应答Answer
      final RTCSessionDescription answer = await _remoteConnection!
          .createAnswer(_sdpConstraints);
      print('offer: ${answer.sdp}');
      // 远端连接设置本地SDP信息
      _remoteConnection!.setLocalDescription(answer);
      // 本地连接设置本地SDP信息
      _localConnection!.setRemoteDescription(answer);
    } catch (e) {
      print(e.toString());
    }
    if (!mounted) {
      return;
    }
    // 设置为连接状态
    setState(() {
      _isConnected = true;
    });
  }

  // 关闭处理
  void _close() async {
    try {
      // 关闭本地连接
      await _localConnection?.close();
      // 关闭远端连接
      await _remoteConnection?.close();
      // 将本地连接设置为空
      _localConnection = null;
      // 将远端连接设置空
      _remoteConnection = null;
    } catch (e) {
      print(e.toString());
    }
    if (!mounted) {
      return;
    }
    // 设置连接状态为false
    setState(() {
      _isConnected = false;
    });
  }

  @override
  void deactivate() {
    super.deactivate();
    // 挂断
    if (_isConnected) {
      _close();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('数据通道示例')),
      body: OrientationBuilder(
        builder: (BuildContext context, Orientation orientation) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text('接收到的消息：$_message'),
                ElevatedButton(onPressed: _sendMessage, child: Text('点击发送文本')),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _isConnected ? _close : _open,
        child: Icon(_isConnected ? Icons.close : Icons.add),
      ),
    );
  }
}

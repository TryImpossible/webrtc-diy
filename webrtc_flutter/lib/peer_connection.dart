import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

/// 连接建立示例
class PeerConnection extends StatefulWidget {
  const PeerConnection({super.key});
  static String tag = '连接建立示例';

  @override
  State<PeerConnection> createState() => _PeerConnectionState();
}

class _PeerConnectionState extends State<PeerConnection> {
  // 本地媒体流
  MediaStream? _localStream;
  // 远端媒体流
  MediaStream? _remoteStream;
  // 本地连接
  RTCPeerConnection? _localConnection;
  // 远端连接
  RTCPeerConnection? _remoteConnection;
  // 本地视频渲染对象
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  // 远端视频渲染对象
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();
  // 是否连接
  bool _isConnected = false;

  // 媒体约束
  final Map<String, dynamic> _mediaConstraints = <String, dynamic>{
    // 开启音频
    'audio': true,
    'video': {
      'mandatory': {
        // 宽度
        'minWidth': '640',
        // 调试
        'minHight': '480',
        // 帧率
        'minFrameRate': '30',
      },
      'facingMode': 'user',
      'optional': [],
    },
  };

  final Map<String, dynamic> _configuration = <String, dynamic>{
    // 使用Google服务器
    'iceServers': [
      {'url': 'stun:stun.l.google.com:19302'},
    ],
  };

  // SDP约束
  final Map<String, dynamic> _sdpConstraints = <String, dynamic>{
    'mandatory': {
      // 是否接收语音数据
      'OfferToReceiveAudio': true,
      // 是否接收视频数据
      'OfferToReceiveVideo': true,
    },
    'optional': [],
  };

  // PeerConnection约束
  final Map<String, dynamic> _pcConstraints = <String, dynamic>{
    'mandatory': {},
    'optional': [
      // 如果要与浏览器互通，则开启DtlsSrtpKeyAgreement，此处不开启
      {'DtlsSrtpKeyAgreement': false},
    ],
  };

  // 初始化视频渲染对象
  Future<void> _initRenderers() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
  }

  // 本地Ice连接状态
  void _onLocalIceConnectionState(RTCIceConnectionState state) {
    print('onLocalIceConnectionState: ${state.toString()}');
  }

  // 远端Ice连接状态
  void _onRemoteIceConnectionState(RTCIceConnectionState state) {
    print('onRemoteIceConnectionState: ${state.toString()}');
  }

  // 远端流添加成功后回调
  void _onRemoteAddStream(MediaStream stream) {
    print('Remote addStream: ${stream.id}');
    // 得到远端媒体流
    _remoteStream = stream;
    // 将远端视频渲染对象与媒体流绑定
    _remoteRenderer.srcObject = stream;
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

  void _open() async {
    // 如果本地与远端连接创建，则返回
    if (_localConnection != null || _remoteConnection != null) {
      return;
    }
    try {
      // 根据媒体约束获取本地媒体流
      _localStream = await navigator.mediaDevices.getUserMedia(
        _mediaConstraints,
      );
      // 将本地媒体流与本地视频对象绑定
      _localRenderer.srcObject = _localStream;

      // 创建本地连接对象
      _localConnection = await createPeerConnection(
        _configuration,
        _pcConstraints,
      );
      // 添加本地Candidate事件监听
      _localConnection!.onIceCandidate = _onLocalCandidate;
      // 添加本地Ice连接状态事件监听
      _localConnection!.onIceConnectionState = _onLocalIceConnectionState;
      // 添加本地流至本地连接
      if (_localStream!.getAudioTracks().isNotEmpty) {
        _localConnection!.addTrack(
          _localStream!.getAudioTracks()[0],
          _localStream!,
        );
      }
      if (_localStream!.getVideoTracks().isNotEmpty) {
        _localConnection!.addTrack(
          _localStream!.getVideoTracks()[0],
          _localStream!,
        );
      }
      // _localConnection!.addStream(_localStream!);
      // 设置本地静音状态为false
      Helper.setMicrophoneMute(false, _localStream!.getAudioTracks()[0]);

      // 创建远端连接对象
      _remoteConnection = await createPeerConnection(
        _configuration,
        _pcConstraints,
      );
      // 添加远端Candidate事件监听
      _remoteConnection!.onIceCandidate = _onRemoteCandidate;
      // 监听获取到远端视频流事件
      _remoteConnection!.onAddStream = _onRemoteAddStream;
      // 添加远端Ice连接状态事件监听
      _remoteConnection!.onIceConnectionState = _onRemoteIceConnectionState;

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
      // 销毁本地流
      await _localStream?.dispose();
      // 销毁远端流
      await _remoteStream?.dispose();
      // 关闭本地连接
      await _localConnection?.close();
      // 关闭远端连接
      await _remoteConnection?.close();
      // 将本地连接设置为空
      _localConnection = null;
      // 将远端连接设置空
      _remoteConnection = null;
      // 将本地视频源设置为空
      _localRenderer.srcObject = null;
      // 将远端视频源设置为空
      _remoteRenderer.srcObject = null;
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
  void initState() {
    super.initState();
    // 初始化视频渲染对象
    _initRenderers();
  }

  @override
  void deactivate() {
    super.deactivate();
    // 挂断
    if (_isConnected) {
      _close();
    }
    // 销毁本地视频渲染对象
    _localRenderer.dispose();
    // 销毁远端视频渲染对象
    _remoteRenderer.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('连接建立示例')),
      body: OrientationBuilder(
        builder: (BuildContext context, Orientation orientation) {
          return Center(
            child: ColoredBox(
              color: Colors.white,
              child: Stack(
                children: <Widget>[
                  Align(
                    // 判断是否为垂直方向
                    alignment: orientation == Orientation.portrait
                        ? const FractionalOffset(0.5, 0.1)
                        : const FractionalOffset(0.0, 0.5),
                    child: Container(
                      margin: EdgeInsets.zero,
                      width: 320,
                      height: 240,
                      color: Colors.black54,
                      // 本地视频渲染
                      child: RTCVideoView(_localRenderer),
                    ),
                  ),
                  Align(
                    // 判断是否为垂直方向
                    alignment: orientation == Orientation.portrait
                        ? const FractionalOffset(0.5, 0.9)
                        : const FractionalOffset(1.0, 0.5),
                    child: Container(
                      margin: EdgeInsets.zero,
                      width: 320,
                      height: 240,
                      color: Colors.black54,
                      // 远端视频渲染
                      child: RTCVideoView(_remoteRenderer),
                    ),
                  ),
                ],
              ),
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

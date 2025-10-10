import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

/// GetUserMedia示例
class GetUserMedia extends StatefulWidget {
  const GetUserMedia({super.key});

  static String tag = 'GetUserMedia示例';

  @override
  State<GetUserMedia> createState() => _GetUserMediaState();
}

class _GetUserMediaState extends State<GetUserMedia> {
  // 本地媒体流
  MediaStream? _localStream;
  // 本地视频渲染对象
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  // 是否打开
  bool _isOpen = false;

  Future<void> _initRenderers() async {
    // RTCVideoRenderer初始化
    await _localRenderer.initialize();
  }

  /// 打开设备，平台的消息是异步的，所以这里需要使用async
  Future<void> _open() async {
    // 约束条件
    final Map<String, dynamic> mediaConstraints = {
      'audio': true,
      'video': {'width': 1280, 'height': 720, 'facingMode': 'user'},
    };
    try {
      // 根据约束条件获取媒体流
      final MediaStream stream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints,
      );
      // 将获取到的流stream赋给_localStream
      _localStream = stream;
      // 将本地视频渲染对象与_localStream绑定
      _localRenderer.srcObject = _localStream;
    } catch (e) {
      print(e.toString());
    }
    // 判断状态是否初始化完成
    if (!mounted) {
      return;
    }
    // 设置当前状态为打开状态
    setState(() {
      _isOpen = true;
    });
  }

  /// 关闭设备
  Future<void> _close() async {
    try {
      // 释放本地流资源
      await _localStream?.dispose();
      // 将本地渲染对象源设置为空
      _localRenderer.srcObject = null;
    } catch (e) {
      print(e.toString());
    }
    // 设置当前状态为关闭状态
    setState(() {
      _isOpen = false;
    });
  }

  @override
  void initState() {
    super.initState();
    // RTCVideoRenderer初始化
    _initRenderers();
  }

  @override
  void dispose() {
    // 关闭处理
    if (_isOpen) {
      _close();
    }
    // 释放资源并停止渲染
    _localRenderer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('GetUserMedia示例')),
      body: OrientationBuilder(
        builder: (BuildContext context, Orientation orientation) {
          return Center(
            child: Container(
              margin: EdgeInsets.zero,
              width: double.infinity,
              height: double.infinity,
              color: Colors.black54,
              child: RTCVideoView(_localRenderer),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _isOpen ? _close : _open,
        child: Icon(_isOpen ? Icons.close : Icons.add),
      ),
    );
  }
}

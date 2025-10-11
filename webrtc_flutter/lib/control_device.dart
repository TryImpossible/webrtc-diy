import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';

/// 控制设备
class ControlDevice extends StatefulWidget {
  const ControlDevice({super.key});

  static String tag = '控制设备示例';

  @override
  State<ControlDevice> createState() => _ControlDeviceState();
}

class _ControlDeviceState extends State<ControlDevice> {
  // 本地媒体流
  MediaStream? _localStream;
  // 本地视频渲染对象
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  // 是否打开
  bool _isOpen = false;
  // 是否关闭摄像头
  bool _cameraOff = false;
  // 是否关闭麦克风
  bool _microphoneOff = false;
  // 是否打开扬声器
  bool _speakerOn = true;

  Future<void> _initRenderers() async {
    // RTCVideoRenderer初始化
    await _localRenderer.initialize();
  }

  // 打开设备，平台的消息是异步的，所以这里需要使用async
  Future<void> _open() async {
    // 约束条件
    final Map<String, dynamic> mediaConstraints = {
      'audio': true,
      'video': {'width': 1280, 'height': 720, 'facingMode': 'user'},
    };
    try {
      // 根据约束条件获取媒体流
      _localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints,
      );
      // 将本地视频渲染对象与_localStream绑定
      _localRenderer.srcObject = _localStream;
    } catch (e) {
      print(e.toString());
    }
    // 判断状态是否初始化完成
    if (!mounted) return;
    // 设置当前状态为打开状态
    setState(() {
      _isOpen = true;
    });
  }

  // 关闭设备
  Future<void> _close() async {
    try {
      // 释放本地流资源
      await _localStream?.dispose();
      // 将本地视频渲染对象源设置为空
      _localRenderer.srcObject = null;
    } catch (e) {
      print(e.toString());
    }
    // 设置当前状态为关闭状态
    setState(() {
      _isOpen = false;
    });
  }

  // 切换前置和后置摄像头
  void _switchCamera() {
    // 判断本地流及视频轨道长度
    if (_localStream != null && _localStream!.getVideoTracks().isNotEmpty) {
      // 调用视频轨道的切换摄像头方法
      Helper.switchCamera(_localStream!.getVideoTracks()[0]);
    } else {
      print('不能切换摄像头');
    }
  }

  // 是否禁用摄像头
  void _turnCamera() {
    // 判断本地流及视频轨道长度
    if (_localStream != null && _localStream!.getVideoTracks().isNotEmpty) {
      final bool muted = !_cameraOff;
      setState(() {
        _cameraOff = muted;
      });
      // 第一个视频轨道是否禁用
      _localStream!.getVideoTracks()[0].enabled = !muted;
    } else {
      print('不有操作摄像头');
    }
  }

  // 是否静音
  void _turnMicrophone() {
    // 判断本地流及音频轨道长度
    if (_localStream != null && _localStream!.getAudioTracks().isNotEmpty) {
      final bool muted = !_microphoneOff;
      setState(() {
        _microphoneOff = muted;
      });
      // 第一个音频轨道是否禁用
      _localStream!.getAudioTracks()[0].enabled = !muted;
      if (muted) {
        print('已静音');
      } else {
        print('取消静音');
      }
    } else {
      print('不有操作麦克风');
    }
  }

  // 切换扬声器或听筒
  void _switchSpeaker() {
    setState(() {
      _speakerOn = !_speakerOn;
      // 获取音频轨道
      final MediaStreamTrack audioTrack = _localStream!.getAudioTracks()[0];
      // 调用音频轨道的设置是否启用扬声器方法
      audioTrack.enableSpeakerphone(_speakerOn);
      print('切换至: ${_speakerOn ? '扬声器' : '听筒'}');
    });
  }

  @override
  void initState() {
    super.initState();
    // RTCVideoRenderer初始化
    _initRenderers();
  }

  @override
  void deactivate() {
    super.deactivate();
    // 关闭处理
    if (_isOpen) {
      _close();
    }
    // 释放资源并停止渲染
    _localRenderer.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('控制设备示例')),
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
      bottomNavigationBar: BottomAppBar(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            IconButton(
              onPressed: _turnCamera, // 是否禁用摄像头
              icon: Icon(_cameraOff ? Icons.videocam_off : Icons.videocam),
            ),
            IconButton(
              onPressed: _switchCamera, // 切换摄像头
              icon: Icon(Icons.switch_camera),
            ),
            IconButton(
              onPressed: _turnMicrophone, // 是否禁音
              icon: Icon(_microphoneOff ? Icons.mic_off : Icons.mic),
            ),
            IconButton(
              onPressed: _switchSpeaker, // 切换扬声器或听筒
              icon: Icon(_speakerOn ? Icons.volume_up : Icons.volume_down),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _isOpen ? _close : _open,
        child: Icon(_isOpen ? Icons.close : Icons.add),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

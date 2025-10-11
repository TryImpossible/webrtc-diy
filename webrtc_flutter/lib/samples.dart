import 'package:flutter/material.dart';
import 'package:webrtc_flutter/control_device.dart';
import 'package:webrtc_flutter/get_display_media.dart';
import 'package:webrtc_flutter/get_user_media.dart';
import 'package:webrtc_flutter/peer_connection.dart';

const List<(String, Widget)> _routes = <(String, Widget)>[
  ('GetUserMedia示例', GetUserMedia()),
  ('屏幕共享示例', GetDisplayMedia()),
  ('控制设备', ControlDevice()),
  ('连接建立', PeerConnection()),
];

class Samples extends StatelessWidget {
  const Samples({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('WebRTC示例')),
      body: ListView.builder(
        itemCount: _routes.length,
        itemBuilder: (BuildContext context, int index) {
          final (String title, Widget page) = _routes[index];
          return ListTile(
            title: Text(title),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (BuildContext context) {
                    return page;
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}

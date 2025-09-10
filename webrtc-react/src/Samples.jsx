import { useMemo } from 'react';
import { List } from 'antd';
import { Link } from 'react-router-dom';

function Samples() {
  const data = useMemo(
    () => [
      { title: '首页', path: '/' },
      { title: '摄像头', path: '/camera' },
    ],
    [],
  );
  return (
    <div>
      <List
        header={<div>WebRTC示例</div>}
        footer={<div>Footer</div>}
        bordered
        dataSource={data}
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

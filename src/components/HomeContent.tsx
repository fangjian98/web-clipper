import React from 'react';
import UrlInput from './UrlInput';
import './HomeContent.css';

interface HomeContentProps {
  onParse: (url: string) => void;
  loading: boolean;
}

const HomeContent: React.FC<HomeContentProps> = ({ onParse, loading }) => {
  const platforms = [
    { 
      name: '微信公众号', 
      url: 'https://mp.weixin.qq.com',
      color: '#07C160',
      initial: '微',
    },
    { 
      name: 'CSDN', 
      url: 'https://www.csdn.net',
      color: '#FC5531',
      initial: 'C',
    },
    { 
      name: '掘金', 
      url: 'https://juejin.cn',
      color: '#1E80FF',
      initial: '掘',
    },
    { 
      name: '开源中国', 
      url: 'https://www.oschina.net',
      color: '#29B6F6',
      initial: '开源',
    },
    { 
      name: '51CTO博客', 
      url: 'https://blog.51cto.com',
      color: '#E74C3C',
      initial: '51',
    },
    { 
      name: '博客园', 
      url: 'https://www.cnblogs.com',
      color: '#2319BC',
      initial: '博',
    },
    { 
      name: '简书', 
      url: 'https://www.jianshu.com',
      color: '#EA6F5A',
      initial: '简',
    },
    { 
      name: 'SegmentFault', 
      url: 'https://segmentfault.com',
      color: '#009A61',
      initial: 'SF',
    },
    { 
      name: 'InfoQ', 
      url: 'https://www.infoq.cn',
      color: '#0084FF',
      initial: 'IQ',
    },
    { 
      name: '阿里云开发者社区', 
      url: 'https://developer.aliyun.com',
      color: '#FF6A00',
      initial: '阿里',
    },
    { 
      name: '腾讯云开发者社区', 
      url: 'https://cloud.tencent.com/developer',
      color: '#00A3FF',
      initial: '腾讯',
    },
    { 
      name: '百度开发者中心', 
      url: 'https://developer.baidu.com',
      color: '#306EFF',
      initial: '百度',
    },
    { 
      name: '华为开发者社区', 
      url: 'https://developer.huawei.com',
      color: '#C7000B',
      initial: '华为',
    },
    { 
      name: '知乎', 
      url: 'https://www.zhihu.com',
      color: '#0084FF',
      initial: '知',
      beta: true,
    },
    { 
      name: '其他网站', 
      url: '#',
      color: '#6B7280',
      initial: '其他',
      beta: true,
    },
  ];

  return (
    <div className="home-content">
      <div className="hero-section">
        <h1 className="hero-title">
          将链接<span className="highlight">一键转换</span>为 Markdown
        </h1>
        <p className="hero-description">
          智能提取网页正文，自动去除广告和无关内容<br/>
          支持复制、编辑、下载，完美保留原文格式
        </p>
      </div>

      <div className="input-section">
        <UrlInput onParse={onParse} loading={loading} />
      </div>

      <section className="platforms-section">
        <h2 className="section-title">支持的平台</h2>
        <div className="platforms-grid">
          {platforms.map((platform) => {
            const isPlaceholder = platform.url === '#';
            return isPlaceholder ? (
              <div 
                key={platform.name} 
                className="platform-card"
                title={platform.name}
              >
                <div 
                  className="platform-icon" 
                  style={{ background: platform.color }}
                >
                  {platform.initial}
                </div>
                <span className="platform-name">
                  {platform.name}
                  {platform.beta && <span className="beta-badge">Beta</span>}
                </span>
              </div>
            ) : (
              <a 
                key={platform.name} 
                className="platform-card"
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                title={platform.name}
              >
                <div 
                  className="platform-icon" 
                  style={{ background: platform.color }}
                >
                  {platform.initial}
                </div>
                <span className="platform-name">
                  {platform.name}
                  {platform.beta && <span className="beta-badge">Beta</span>}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="home-footer">
        <p>Powered by <span className="brand">Maxx Space</span></p>
      </footer>
    </div>
  );
};

export default HomeContent;

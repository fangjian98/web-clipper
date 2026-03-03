import React from 'react';
import './HomeContent.css';

const HomeContent: React.FC = () => {
  const platforms = [
    { name: '知乎', icon: 'Zhihu', color: '#0084FF' },
    { name: '微信公众号', icon: 'Wechat', color: '#07C160' },
    { name: '掘金', icon: 'Juejin', color: '#007ACC' },
    { name: 'CSDN', icon: 'CSDN', color: '#FC1D20' },
    { name: 'SegmentFault', icon: 'SF', color: '#000000' },
    { name: '博客园', icon: 'CNblogs', color: '#2319BC' },
    { name: '简书', icon: 'Jianshu', color: '#EA6F00' },
    { name: '思否', icon: 'SegmentFault', color: '#1E93FF' },
    { name: '小红书', icon: 'Xiaohongshu', color: '#FE2C55' },
    { name: '今日头条', icon: 'Toutiao', color: '#0057FF' },
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

      <section className="platforms-section">
        <h2 className="section-title">支持的平台</h2>
        <div className="platforms-grid">
          {platforms.map((platform) => (
            <div key={platform.name} className="platform-card">
              <div className="platform-icon" style={{ background: platform.color }}>
                {platform.name.charAt(0)}
              </div>
              <span className="platform-name">{platform.name}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <p>Powered by <span className="brand">Maxx Space</span></p>
      </footer>
    </div>
  );
};

export default HomeContent;

import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">中华古籍智慧化服务平台</h1>
        <div className="search-bar glass-panel">
          <input 
            type="text" 
            placeholder="请输入您要查找的内容..." 
            className="search-input"
          />
          <button className="search-btn btn-primary">检索</button>
        </div>
        <p className="hero-description">
          致力于为社会公众提供开放共享、全面多元的古籍资源和科技赋能、便捷高效的知识服务。
        </p>
      </div>

      <div className="stats-section">
        <div className="stat-card glass-panel"></div>
        <div className="stat-card glass-panel"></div>
        <div className="stat-card glass-panel"></div>
      </div>
    </div>
  );
};

export default Home;

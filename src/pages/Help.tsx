import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText } from 'lucide-react';
import './Help.css';

interface HelpDoc {
  id: string;
  title: string;
  content?: React.ReactNode;
  children?: HelpDoc[];
}

const helpData: HelpDoc[] = [
  {
    id: '1',
    title: '用户指南',
    children: [
      {
        id: '1-1',
        title: '注册与登录',
        content: (
          <div>
            <h3>注册与登录机制</h3>
            <p>平台支持多模式登录：</p>
            <ul>
              <li><strong>密码登录：</strong> 使用您注册时的用户名和密码。</li>
              <li><strong>邮箱验证码：</strong> 若忘记密码，可通过绑定的邮箱接收一次性验证码快速登录。</li>
            </ul>
            <p>未注册的用户在首次输入未记录的邮箱和验证码时，系统会自动引导进行快速注册。</p>
          </div>
        )
      },
      {
        id: '1-2',
        title: '个人中心',
        content: (
          <div>
            <h3>个人资料管理</h3>
            <p>点击页面右上角的用户名或头像，可以进入“个人中心”。</p>
            <p>在这里，您可以：</p>
            <ul>
              <li>查看基本资料与安全设置。</li>
              <li>管理您在学习过程中的词条记录、技能栈记录等（开发中）。</li>
              <li>查阅平台通知和系统消息。</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: '2',
    title: '核心功能',
    children: [
      {
        id: '2-1',
        title: 'AI 古籍助手',
        content: (
          <div>
            <h3>AI 助手的交互方式</h3>
            <p>导航到“AI 助手”页面，您将看到一个类 ChatGPT 的对话界面：</p>
            <p>1. <strong>提问：</strong> 在底部的输入框输入任何古文难题，AI 模型将迅速解答。</p>
            <p>2. <strong>快捷键：</strong> 输入框支持 `Enter` 快速发送，`Shift+Enter` 换行。</p>
            <p>3. <strong>随笔联动：</strong> 在您研读的界面右侧配有 Notebook（随笔）工具，查找到的优质资料可以即时摘录并云端保存。</p>
          </div>
        )
      },
      {
        id: '2-2',
        title: '法律条文模块',
        content: (
          <div>
            <h3>全自动排版与法律查阅</h3>
            <p>本平台独家支持中国法律体系的“编、章、节、条、款、项、目”智能结构化功能：</p>
            <ul>
              <li><strong>一键导入：</strong> 准备一个含有标准法律编号前缀（如“第一编”、“（一）”）的 .txt 文本文档，点击左侧边栏的导入按钮即可自动解析。</li>
              <li><strong>直观阅读：</strong> 解析后的条文会自动呈现实体出版物级别的缩进与加粗排版。</li>
              <li><strong>动态修改：</strong> 点击右上角的“编辑”按钮，您可以对整个文档进行修改，修改保存后系统会重新运行智能解析。</li>
              <li><strong>导出 PDF：</strong> 支持浏览器原生的打印到 PDF 功能，生成的文档矢量化且支持文字复制。</li>
            </ul>
          </div>
        )
      }
    ]
  }
];

const Help = () => {
  // 默认展开第一个分类，并选中第一个子项
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['1']));
  const [selectedId, setSelectedId] = useState<string>('1-1');

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getSelectedContent = () => {
    let result: React.ReactNode = <div>请选择左侧菜单查看帮助</div>;
    let selectedTitle = '';
    
    const findNode = (nodes: HelpDoc[]) => {
      for (const node of nodes) {
        if (node.id === selectedId) {
          result = node.content;
          selectedTitle = node.title;
          return true;
        }
        if (node.children) {
          if (findNode(node.children)) return true;
        }
      }
      return false;
    };
    findNode(helpData);
    return { content: result, title: selectedTitle };
  };

  const renderMenu = (nodes: HelpDoc[], level: number = 0) => {
    return (
      <ul className={`help-menu-list level-${level}`}>
        {nodes.map(node => {
          const isExpanded = expandedIds.has(node.id);
          const isSelected = selectedId === node.id;
          const hasChildren = node.children && node.children.length > 0;

          return (
            <li key={node.id} className="help-menu-item">
              <div 
                className={`help-menu-label ${isSelected ? 'selected' : ''}`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(node.id);
                  } else {
                    setSelectedId(node.id);
                  }
                }}
              >
                {hasChildren ? (
                  isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                ) : (
                  <FileText size={14} style={{ marginLeft: '2px', marginRight: '4px' }} />
                )}
                <span>{node.title}</span>
              </div>
              {hasChildren && isExpanded && (
                <div className="help-menu-children">
                  {renderMenu(node.children!, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const { content, title } = getSelectedContent();

  return (
    <div className="help-container">
      <div className="help-sidebar">
        <h2 className="help-sidebar-title">使用帮助目录</h2>
        <nav className="help-nav">
          {renderMenu(helpData)}
        </nav>
      </div>
      <div className="help-content">
        <div className="help-article">
          <h1 className="help-article-title">{title}</h1>
          <div className="help-article-body">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;

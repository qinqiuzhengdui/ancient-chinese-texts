import React, { useState, useEffect, useRef } from 'react';
import { getLaws, getLawById, importLaw, updateLaw, deleteLaw, LawListResponse, LawResponse, LawNode } from '../services/laws';
import { useReactToPrint } from 'react-to-print';
import { Search, Upload, FileText, Trash2, Edit, Save, X } from 'lucide-react';
import './Laws.css';

const Laws = () => {
  const [laws, setLaws] = useState<LawListResponse[]>([]);
  const [selectedLaw, setSelectedLaw] = useState<LawResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: selectedLaw?.title || '法律条文',
  });

  const fetchLaws = async () => {
    try {
      const data = await getLaws();
      setLaws(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLaws();
  }, []);

  const handleSelectLaw = async (id: string) => {
    try {
      const data = await getLawById(id);
      setSelectedLaw(data);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const newLaw = await importLaw(file);
      await fetchLaws();
      setSelectedLaw(newLaw);
    } catch (e: any) {
      alert("导入失败: " + (e.response?.data?.detail || e.message));
    }
  };

  const handleDelete = async () => {
    if (!selectedLaw) return;
    if (window.confirm(`确定要删除《${selectedLaw.title}》吗？`)) {
      try {
        await deleteLaw(selectedLaw.id);
        setSelectedLaw(null);
        await fetchLaws();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedLaw) return;
    try {
      const updated = await updateLaw(selectedLaw.id, editTitle, editContent);
      setSelectedLaw(updated);
      setIsEditing(false);
      await fetchLaws();
    } catch (e) {
      console.error(e);
      alert('保存失败');
    }
  };

  const renderNode = (node: LawNode, index: number) => {
    return (
      <div key={`${node.level}-${index}`} className={`law-node-${node.level}`}>
        <span>{node.prefix} </span>
        <span>{node.content}</span>
        {node.children && node.children.map((child, i) => renderNode(child, i))}
      </div>
    );
  };

  const filteredLaws = laws.filter(l => l.title.includes(searchTerm));

  return (
    <div className="laws-container">
      <div className="laws-sidebar">
        <div className="laws-sidebar-header">
          <input 
            type="text" 
            placeholder="搜索法律..." 
            className="form-control"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <label className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            <Upload size={18} />
            导入 TXT 文件
            <input type="file" accept=".txt" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
        <div className="laws-list">
          {filteredLaws.map(law => (
            <div 
              key={law.id} 
              className={`law-list-item ${selectedLaw?.id === law.id ? 'active' : ''}`}
              onClick={() => handleSelectLaw(law.id)}
            >
              <FileText size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {law.title}
            </div>
          ))}
          {filteredLaws.length === 0 && <div style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>暂无数据</div>}
        </div>
      </div>
      
      <div className="laws-content">
        {selectedLaw ? (
          isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  style={{ flex: 1, fontSize: '1.2rem', fontWeight: 'bold' }}
                />
                <button className="btn btn-primary" onClick={handleSaveEdit}><Save size={18}/> 保存</button>
                <button className="btn btn-outline" onClick={() => setIsEditing(false)}><X size={18}/> 取消</button>
              </div>
              <textarea 
                className="form-control" 
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                style={{ flex: 1, resize: 'none', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}
              />
            </div>
          ) : (
            <>
              <div className="laws-content-header">
                <h2>{selectedLaw.title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={() => {
                    setEditTitle(selectedLaw.title);
                    setEditContent(selectedLaw.raw_text);
                    setIsEditing(true);
                  }}><Edit size={16} /> 编辑</button>
                  <button className="btn btn-outline" onClick={handlePrint}><FileText size={16} /> 导出 PDF</button>
                  <button className="btn" style={{ color: 'red', border: '1px solid red' }} onClick={handleDelete}><Trash2 size={16} /> 删除</button>
                </div>
              </div>
              <div ref={contentRef} style={{ padding: '20px 40px', backgroundColor: 'white' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>{selectedLaw.title}</h1>
                {selectedLaw.nodes.map((node, i) => renderNode(node, i))}
              </div>
            </>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '1.2rem' }}>
            请在左侧选择一部法律或导入新文件
          </div>
        )}
      </div>
    </div>
  );
};

export default Laws;

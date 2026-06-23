import re

LEVEL_DEPTH = {
    'law': 0,
    '编': 1,
    '章': 2,
    '节': 3,
    '条': 4,
    '款': 5,
    '项': 6,
    '目': 7
}

class LawParser:
    def __init__(self):
        self.re_bian = re.compile(r'^(第[一二三四五六七八九十百千]+编)(?:\s+(.*))?$')
        self.re_zhang = re.compile(r'^(第[一二三四五六七八九十百千]+章)(?:\s+(.*))?$')
        self.re_jie = re.compile(r'^(第[一二三四五六七八九十百千]+节)(?:\s+(.*))?$')
        self.re_tiao = re.compile(r'^(第[一二三四五六七八九十百千]+条)(?:\s+(.*))?$')
        self.re_xiang = re.compile(r'^([（\(][一二三四五六七八九十百千]+[）\)])(?:\s*(.*))?$')
        self.re_mu = re.compile(r'^(\d+[\.、])(?:\s*(.*))?$')

    def parse(self, raw_text: str) -> list:
        lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
        
        root_nodes = []
        stack = []

        def pop_until(level_name):
            target_depth = LEVEL_DEPTH[level_name]
            while stack and LEVEL_DEPTH[stack[-1][0]] >= target_depth:
                stack.pop()

        def add_node(level, prefix, content):
            node = {
                "level": level,
                "prefix": prefix,
                "content": content,
                "children": []
            }
            pop_until(level)
            if not stack:
                root_nodes.append(node)
            else:
                stack[-1][1]["children"].append(node)
            stack.append((level, node))
            return node

        for line in lines:
            m_bian = self.re_bian.match(line)
            if m_bian:
                add_node('编', m_bian.group(1), m_bian.group(2) or '')
                continue
                
            m_zhang = self.re_zhang.match(line)
            if m_zhang:
                add_node('章', m_zhang.group(1), m_zhang.group(2) or '')
                continue
                
            m_jie = self.re_jie.match(line)
            if m_jie:
                add_node('节', m_jie.group(1), m_jie.group(2) or '')
                continue
                
            m_tiao = self.re_tiao.match(line)
            if m_tiao:
                add_node('条', m_tiao.group(1), m_tiao.group(2) or '')
                continue
                
            m_xiang = self.re_xiang.match(line)
            if m_xiang:
                add_node('项', m_xiang.group(1), m_xiang.group(2) or '')
                continue
                
            m_mu = self.re_mu.match(line)
            if m_mu:
                add_node('目', m_mu.group(1), m_mu.group(2) or '')
                continue

            if stack and stack[-1][0] in ('项', '目'):
                if stack[-1][1]["content"]:
                    stack[-1][1]["content"] += "\n" + line
                else:
                    stack[-1][1]["content"] = line
            else:
                node = {
                    "level": "款",
                    "prefix": "",
                    "content": line,
                    "children": []
                }
                pop_until('款')
                if not stack:
                    root_nodes.append(node)
                else:
                    stack[-1][1]["children"].append(node)
                stack.append(('款', node))

        return root_nodes

def parse_law_text(raw_text: str):
    parser = LawParser()
    return parser.parse(raw_text)

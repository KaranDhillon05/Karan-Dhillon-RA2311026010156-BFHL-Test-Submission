const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const USER_ID = 'karandhillon_05072005';
const EMAIL_ID = 'kd2803@srmist.edu.in';
const COLLEGE_ROLL_NUMBER = 'RA2311026010156';

function isValid(entry) {
  const m = entry.match(/^([A-Z])->([A-Z])$/);
  if (!m) return false;
  return m[1] !== m[2];
}

function makeUF(nodes) {
  const parent = {};
  nodes.forEach(n => (parent[n] = n));
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(x, y) {
    parent[find(x)] = find(y);
  }
  return { find, union };
}

function hasCycleInComponent(nodes, childrenOf) {
  const nodeSet = new Set(nodes);
  const color = {};
  nodes.forEach(n => (color[n] = 0));

  function dfs(u) {
    color[u] = 1;
    for (const v of childrenOf[u] || []) {
      if (!nodeSet.has(v)) continue;
      if (color[v] === 1) return true;
      if (color[v] === 0 && dfs(v)) return true;
    }
    color[u] = 2;
    return false;
  }

  for (const n of nodes) {
    if (color[n] === 0 && dfs(n)) return true;
  }
  return false;
}

function buildTree(node, childrenOf) {
  const children = childrenOf[node] || [];
  const subtree = {};
  for (const child of children) {
    Object.assign(subtree, buildTree(child, childrenOf));
  }
  return { [node]: subtree };
}

function treeDepth(node, childrenOf) {
  const children = childrenOf[node] || [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map(c => treeDepth(c, childrenOf)));
}

function processData(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const acceptedEdges = [];

  for (let raw of data) {
    const entry = (typeof raw === 'string' ? raw : String(raw)).trim();

    if (!isValid(entry)) {
      invalid_entries.push(entry);
      continue;
    }

    if (seenEdges.has(entry)) {
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
    } else {
      seenEdges.add(entry);
      const [parent, child] = entry.split('->');
      acceptedEdges.push([parent, child]);
    }
  }

  const parentOf = {};
  const childrenOf = {};
  const allNodes = new Set();
  const retainedEdges = [];

  for (const [parent, child] of acceptedEdges) {
    allNodes.add(parent);
    allNodes.add(child);

    if (parentOf[child] === undefined) {
      parentOf[child] = parent;
      if (!childrenOf[parent]) childrenOf[parent] = [];
      childrenOf[parent].push(child);
      retainedEdges.push([parent, child]);
    }
  }

  const nodeList = [...allNodes];
  const uf = makeUF(nodeList);

  for (const [parent, child] of retainedEdges) {
    uf.union(parent, child);
  }

  const componentMap = {};
  for (const n of nodeList) {
    const rep = uf.find(n);
    if (!componentMap[rep]) componentMap[rep] = [];
    componentMap[rep].push(n);
  }

  const components = Object.values(componentMap);

  const hierarchies = [];

  for (const component of components) {
    const cyclic = hasCycleInComponent(component, childrenOf);

    if (cyclic) {
      const root = [...component].sort()[0];
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const roots = component
        .filter(n => parentOf[n] === undefined)
        .sort();

      for (const root of roots) {
        const tree = buildTree(root, childrenOf);
        const depth = treeDepth(root, childrenOf);
        hierarchies.push({ root, tree, depth });
      }
    }
  }

  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);

  let largest_tree_root = '';
  if (nonCyclic.length > 0) {
    const sorted = [...nonCyclic].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root < b.root ? -1 : 1;
    });
    largest_tree_root = sorted[0].root;
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: cyclic.length,
      largest_tree_root,
    },
  };
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: '"data" must be an array of strings.' });
    }
    const result = processData(data);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`BFHL API running -> http://localhost:${PORT}`));
}

module.exports = app;

import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  Edge,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './sidebar'; // Correct import case

import './style.css';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [variant, setVariant] = useState('lines');
  const [editValue, setEditValue] = useState('');
  const [editId, setEditId] = useState(null);

  const onNodeClick = (event, node) => {
    setEditValue(node.data.label);
    setEditId(node.id);
  };

  const handleChange = (event) => {
    setEditValue(event.target.value);
  };

  const handleEdit = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === editId
          ? {
              ...node,
              data: {
                ...node.data,
                label: editValue,
              },
            }
          : node
      )
    );
    setEditValue('');
    setEditId(null);
  };

  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== editId));
    setEdges((eds) => eds.filter((edge) => edge.source !== editId && edge.target !== editId));
    setEditValue('');
    setEditId(null);
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="dndflow">
      <div className="updatenode__controls">
        <label>Label:</label>
        <br />
        <input type="text" value={editValue} onChange={handleChange} />
        <br />
        <button onClick={handleEdit} className="btn">
          Update
        </button>
        <button onClick={handleDelete} className="btn-delete">
          Delete
        </button>
      </div>

      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Background color="#99b3ec" variant={variant} />
            <Controls />
          </ReactFlow>
        </div>
        <Sidebar />
      </ReactFlowProvider>
    </div>
  );
};

export default DnDFlow;

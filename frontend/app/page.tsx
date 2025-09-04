// pages/graph.tsx
"use client";
import { useEffect, useState } from 'react';
import { Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

export default function Home() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    fetch('http://localhost:5000/graph/get-nodes')
      .then(res => res.json())
      .then(data => setGraphData(data));
  }, []);

  useEffect(() => {
    if (graphData.nodes.length > 0) {
      const container = document.getElementById('network');
      const options = {
        nodes: {
          shape: 'dot',
          size: 16,
          font: { size: 14 }
        },
        edges: {
          arrows: 'to',
          font: { align: 'middle' }
        },
        physics: {
          stabilization: false
        }
      };
      new Network(container!, graphData, options);
    }
  }, [graphData]);

  return <div id="network" style={{ height: '600px' }} />;
}

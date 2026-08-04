"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import Link from "next/link";
import { STATE_COLORS, ENTITY_COLORS } from "@/lib/types";
import type { AttentionState, EntityType } from "@prisma/client";

interface GraphNode {
  id: string;
  title: string;
  type: EntityType;
  state: AttentionState;
  link: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function CustomNode({ data }: { data: { label: string; state: AttentionState; type: EntityType; link: string } }) {
  return (
    <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${ENTITY_COLORS[data.type]}`} />
        <div className={`h-2 w-2 rounded-full ${STATE_COLORS[data.state]}`} />
      </div>
      <p className="mt-1 text-xs font-medium text-gray-900">{data.label}</p>
      <Link
        href={data.link}
        className="mt-1 block text-xs text-blue-500 hover:underline"
      >
        View →
      </Link>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export default function GraphView({ nodes: initialNodes, edges: initialEdges }: GraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const filtered = filter === "ALL"
      ? initialNodes
      : initialNodes.filter((n) => n.type === filter);

    const nodeIds = new Set(filtered.map((n) => n.id));
    const filteredEdges = initialEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    const typeOrder: EntityType[] = ["SIGNAL", "INTENT", "EXPLORATION", "EXPERIMENT", "PROJECT_CANDIDATE", "ACTIVE_PROJECT"];
    const columns: Record<string, GraphNode[]> = {};
    filtered.forEach((n) => {
      if (!columns[n.type]) columns[n.type] = [];
      columns[n.type].push(n);
    });

    const flowNodes: Node[] = [];
    let yOffset = 0;
    typeOrder.forEach((type, typeIdx) => {
      const nodes = columns[type] || [];
      nodes.forEach((node, idx) => {
        flowNodes.push({
          id: node.id,
          type: "custom",
          position: { x: typeIdx * 280, y: yOffset + idx * 120 },
          data: { label: node.title, state: node.state, type: node.type, link: node.link },
        });
      });
      yOffset = Math.max(yOffset, (nodes.length) * 120) + 40;
    });

    const flowEdges: Edge[] = filteredEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#9ca3af" },
      animated: true,
      label: e.label,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [initialNodes, initialEdges, filter, setNodes, setEdges]);

  return (
    <div className="flex flex-col space-y-4" style={{ height: "calc(100vh - 140px)" }}>
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Filter:</span>
        {["ALL", "SIGNAL", "INTENT", "EXPLORATION", "EXPERIMENT", "PROJECT_CANDIDATE", "ACTIVE_PROJECT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "ALL" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Graph legend */}
      <div className="flex items-center gap-4 rounded-md bg-gray-50 p-2 text-xs text-gray-600">
        <span>Node color = Entity type</span>
        <span>Dot color = Attention state</span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-500" /> Inbox
        </span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-600" /> Active
        </span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-amber-600" /> Waiting
        </span>
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-purple-600" /> Dormant
        </span>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1 rounded-lg border border-gray-200 bg-white" style={{ minHeight: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
        >
          <Background color="#e5e7eb" gap={16} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

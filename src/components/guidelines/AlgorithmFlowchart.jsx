import React, { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ─── Color palette by node.color field ───────────────────────────────────────
const NODE_STYLES = {
  blue:   { box: "bg-blue-600 border-blue-700 text-white", arrow: "text-blue-600" },
  green:  { box: "bg-green-600 border-green-700 text-white", arrow: "text-green-600" },
  orange: { box: "bg-amber-500 border-amber-600 text-white", arrow: "text-amber-500" },
  red:    { box: "bg-red-600 border-red-700 text-white", arrow: "text-red-600" },
  teal:   { box: "bg-teal-600 border-teal-700 text-white", arrow: "text-teal-600" },
  grey:   { box: "bg-slate-400 border-slate-500 text-white", arrow: "text-slate-400" },
  yellow: { box: "bg-yellow-500 border-yellow-600 text-white", arrow: "text-yellow-500" },
};

// ─── Type → default color map ─────────────────────────────────────────────────
const TYPE_DEFAULT_COLOR = {
  start:     "blue",
  decision:  "orange",
  action:    "green",
  emergency: "red",
  outcome:   "teal",
  end:       "grey",
};

// ─── Single node box ──────────────────────────────────────────────────────────
function NodeBox({ node }) {
  const colorKey = node.color || TYPE_DEFAULT_COLOR[node.type] || "blue";
  const styles = NODE_STYLES[colorKey] || NODE_STYLES.blue;
  const isEmergency = node.type === "emergency";
  const isDecision = node.type === "decision";

  return (
    <div
      className={`relative border-2 rounded-xl px-4 py-3 shadow-md text-center text-sm font-semibold leading-snug
        ${isDecision ? "rounded-none rotate-0 transform" : ""}
        ${styles.box}`}
      style={isDecision ? { clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", minWidth: 160, minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center" } : {}}
    >
      {isEmergency && <AlertTriangle className="w-4 h-4 inline mr-1.5 flex-shrink-0" />}
      <span>{node.text}</span>
      {node.detail && (
        <p className="text-xs font-normal mt-1 opacity-80 leading-tight">{node.detail}</p>
      )}
    </div>
  );
}

// ─── Arrow connector ──────────────────────────────────────────────────────────
function Arrow({ label, colorKey = "blue" }) {
  const styles = NODE_STYLES[colorKey] || NODE_STYLES.blue;
  return (
    <div className="flex flex-col items-center my-1">
      {label && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-0.5 ${styles.box} opacity-90`}>
          {label}
        </span>
      )}
      <svg width="24" height="20" viewBox="0 0 24 20">
        <line x1="12" y1="0" x2="12" y2="14" stroke="currentColor" strokeWidth="2" className={styles.arrow} />
        <polygon points="6,12 18,12 12,20" fill="currentColor" className={styles.arrow} />
      </svg>
    </div>
  );
}

// ─── Build node map for O(1) lookup ──────────────────────────────────────────
function buildNodeMap(nodes) {
  const map = {};
  nodes.forEach(n => { map[n.id] = n; });
  return map;
}

// ─── Recursive flowchart renderer ─────────────────────────────────────────────
// Renders nodes in DFS order following children references.
// Visited set prevents infinite loops in cyclic graphs.
function FlowStep({ nodeId, nodeMap, visited, depth = 0 }) {
  if (!nodeId || visited.has(nodeId) || depth > 20) return null;
  const node = nodeMap[nodeId];
  if (!node) return null;

  const newVisited = new Set(visited);
  newVisited.add(nodeId);

  const colorKey = node.color || TYPE_DEFAULT_COLOR[node.type] || "blue";
  const children = node.children || [];

  return (
    <div className="flex flex-col items-center w-full">
      <NodeBox node={node} />

      {/* Decision node: two-branch layout */}
      {node.type === "decision" && children.length >= 2 ? (
        <div className="w-full mt-2">
          <div className="flex justify-center gap-6 w-full">
            {children.slice(0, 2).map((child, ci) => (
              <div key={child.node_id} className="flex flex-col items-center flex-1 min-w-0">
                <Arrow label={child.condition} colorKey={colorKey} />
                <FlowStep nodeId={child.node_id} nodeMap={nodeMap} visited={newVisited} depth={depth + 1} />
              </div>
            ))}
          </div>
          {/* Remaining children (if >2) rendered sequentially */}
          {children.slice(2).map(child => (
            <div key={child.node_id} className="flex flex-col items-center w-full mt-2">
              <Arrow label={child.condition} colorKey={colorKey} />
              <FlowStep nodeId={child.node_id} nodeMap={nodeMap} visited={newVisited} depth={depth + 1} />
            </div>
          ))}
        </div>
      ) : (
        /* Linear: one child or action/outcome/etc */
        children.map(child => (
          <div key={child.node_id} className="flex flex-col items-center w-full">
            <Arrow label={child.condition} colorKey={colorKey} />
            <FlowStep nodeId={child.node_id} nodeMap={nodeMap} visited={newVisited} depth={depth + 1} />
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function AlgorithmFlowchart({ algorithm, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);

  if (!algorithm || !algorithm.nodes || algorithm.nodes.length === 0) return null;

  const nodeMap = buildNodeMap(algorithm.nodes);

  // Find root node (start type, or first node with no parent)
  const childIds = new Set(algorithm.nodes.flatMap(n => (n.children || []).map(c => c.node_id)));
  const rootNode = algorithm.nodes.find(n => n.type === "start") ||
                   algorithm.nodes.find(n => !childIds.has(n.id)) ||
                   algorithm.nodes[0];

  return (
    <div className="border-2 border-blue-200 rounded-2xl overflow-hidden shadow-sm mb-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
      >
        <div className="text-left">
          <p className="font-bold text-sm flex items-center gap-2">
            🔀 {algorithm.title || "Clinical Decision Algorithm"}
          </p>
          {algorithm.description && (
            <p className="text-xs text-blue-200 mt-0.5 line-clamp-1">{algorithm.description}</p>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Legend */}
      {expanded && (
        <>
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex flex-wrap gap-2">
            {[
              { label: "Start", color: "blue" },
              { label: "Decision", color: "orange" },
              { label: "Action", color: "green" },
              { label: "Emergency", color: "red" },
              { label: "Outcome", color: "teal" },
              { label: "End", color: "grey" },
            ].map(({ label, color }) => {
              const s = NODE_STYLES[color] || NODE_STYLES.blue;
              return (
                <span key={label} className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.box}`}>
                  {label}
                </span>
              );
            })}
          </div>

          {/* Flowchart body */}
          <div className="p-4 bg-white overflow-x-auto">
            <div className="min-w-[280px] flex flex-col items-center">
              <FlowStep nodeId={rootNode.id} nodeMap={nodeMap} visited={new Set()} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
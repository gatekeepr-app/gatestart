// app/components/ObjectInspector.tsx
"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Copy, Search } from "lucide-react";

// shadcn/ui (remove/replace with native <button>/<input> if not installed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ObjectInspectorProps = {
  /** Any data: object, array, primitive, Map, Set, Date, etc. */
  data: unknown;
  /** Optional root label (e.g., "response", "payload") */
  name?: string;
  /** Auto-expand to this depth on first render. Default: 1 */
  defaultExpandDepth?: number;
  /** Limit number of items shown per node to prevent UI overload. Default: 250 */
  maxItemsPerLevel?: number;
  /** Sort object keys alphabetically. Default: true */
  sortKeys?: boolean;
  /** Compact one-line previews even when expanded. Default: false */
  compact?: boolean;
};

type NodeProps = {
  label: string;
  value: unknown;
  path: string[];
  depth: number;
  defaultExpandDepth: number;
  /** Maps an object to the path (first occurrence) where it was first seen */
  visited: WeakMap<object, string>;
  sortKeys: boolean;
  maxItems: number;
  filter: string;
  compact: boolean;
};

function getType(v: unknown):
  | "null"
  | "undefined"
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "symbol"
  | "function"
  | "array"
  | "date"
  | "map"
  | "set"
  | "regexp"
  | "error"
  | "object" {
  if (v === null) return "null";
  const t = typeof v;
  if (t === "undefined" || t === "string" || t === "number" || t === "boolean" || t === "bigint" || t === "symbol" || t === "function") {
    return t as any;
  }
  if (Array.isArray(v)) return "array";
  if (v instanceof Date) return "date";
  if (v instanceof Map) return "map";
  if (v instanceof Set) return "set";
  if (v instanceof RegExp) return "regexp";
  if (v instanceof Error) return "error";
  return "object";
}

function preview(value: unknown): string {
  const type = getType(value);
  switch (type) {
    case "string":
      return `"${String(value)}"`;
    case "number":
    case "boolean":
    case "bigint":
      return String(value);
    case "symbol":
      return (value as symbol).toString();
    case "undefined":
      return "undefined";
    case "null":
      return "null";
    case "function": {
      const fn = value as Function;
      return `ƒ ${fn.name || "(anonymous)"}()`;
    }
    case "date":
      return (value as Date).toISOString();
    case "regexp":
      return (value as RegExp).toString();
    case "error":
      return `${(value as Error).name}: ${(value as Error).message}`;
    case "map":
      return `Map(${(value as Map<any, any>).size})`;
    case "set":
      return `Set(${(value as Set<any>).size})`;
    case "array":
      return `Array(${(value as unknown[]).length})`;
    case "object": {
      const ctor = (value as any)?.constructor?.name;
      const keys = Object.keys(value as object);
      return `${ctor === "Object" || !ctor ? "Object" : ctor}{${keys.length}}`;
    }
  }
}

function asEntries(value: unknown, sortKeys: boolean, maxItems: number): Array<[string, unknown]> {
  const type = getType(value);
  if (type === "array") {
    const arr = value as unknown[];
    return arr.slice(0, maxItems).map((v, i) => [String(i), v]);
  }
  if (type === "map") {
    const m = value as Map<any, any>;
    const entries: Array<[string, unknown]> = [];
    let i = 0;
    for (const [k, v] of m.entries()) {
      if (i++ >= maxItems) break;
      entries.push([`→ ${preview(k)}`, v]);
    }
    return entries;
  }
  if (type === "set") {
    const s = value as Set<any>;
    const entries: Array<[string, unknown]> = [];
    let i = 0;
    for (const v of s.values()) {
      if (i++ >= maxItems) break;
      entries.push([`•`, v]);
    }
    return entries;
  }
  if (type === "object" || type === "error" || type === "regexp" || type === "date") {
    const obj = value as Record<string, unknown>;
    let keys = Object.keys(obj);
    if (sortKeys) keys = keys.sort((a, b) => a.localeCompare(b));
    keys = keys.slice(0, maxItems);
    return keys.map((k) => [k, (obj as any)[k]]);
  }
  return [];
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="rounded px-0.5">{match}</mark>
      {after}
    </>
  );
}

function isExpandable(v: unknown) {
  const t = getType(v);
  return t === "array" || t === "object" || t === "map" || t === "set";
}

function safeCopy(value: unknown) {
  // JSON-safe stringify handling BigInt and circular refs gracefully.
  const seen = new WeakSet<object>();
  const out = JSON.stringify(
    value,
    (_k, v) => {
      const t = typeof v;
      if (t === "bigint") return `${v.toString()}n`;
      if (t === "symbol") return v.toString();
      if (t === "function") return `ƒ ${v.name || "(anonymous)"}()`;
      if (v instanceof Map) return { __type: "Map", entries: Array.from(v.entries()) };
      if (v instanceof Set) return { __type: "Set", values: Array.from(v.values()) };
      if (v instanceof Date) return v.toISOString();
      if (v && typeof v === "object") {
        if (seen.has(v)) return "[Circular]";
        seen.add(v);
      }
      return v;
    },
    2
  );
  void navigator.clipboard?.writeText(out);
}

const Row: React.FC<{
  expanded: boolean;
  onToggle(): void;
  depth: number;
  badge?: string;
  label: React.ReactNode;
  previewText?: string;
  compact: boolean;
  isLeaf?: boolean;
}> = ({ expanded, onToggle, depth, badge, label, previewText, compact, isLeaf }) => {
  return (
    <div className="group flex items-start gap-2 py-1">
      <button
        onClick={onToggle}
        disabled={isLeaf}
        aria-label={expanded ? "Collapse" : "Expand"}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded hover:bg-muted flex items-center justify-center ${isLeaf ? "opacity-0 pointer-events-none" : ""}`}
      >
        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {!!badge && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{badge}</span>
          )}
          <div className="font-mono text-sm">
            {label}
            {!!previewText && (
              <span
                className={`ml-2 text-muted-foreground ${compact ? "truncate inline-block max-w-[55ch] align-top" : ""}`}
              >
                {previewText}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Node: React.FC<NodeProps> = ({
  label,
  value,
  path,
  depth,
  defaultExpandDepth,
  visited,
  sortKeys,
  maxItems,
  filter,
  compact,
}) => {
  const [open, setOpen] = useState(depth < defaultExpandDepth);
  const type = getType(value);

  // Current path string (stable for memo keys / visited map)
  const pathStr = useMemo(() => path.join("."), [path]);

  // Circular detection using first occurrence path
  let circularInfo: string | null = null;
  if (value && typeof value === "object") {
    const firstSeenAt = visited.get(value as object);
    if (firstSeenAt && firstSeenAt !== pathStr) {
      circularInfo = `[Circular → ${firstSeenAt}]`;
    } else if (!firstSeenAt) {
      visited.set(value as object, pathStr);
    }
  }

  const labelText = typeof label === "string" ? label : String(label);
  const labelNode = filter ? highlight(labelText, filter) : labelText;

  const leaf = !isExpandable(value) || !!circularInfo;

  // Always call hooks in the same order
  const entries = useMemo(() => {
    if (leaf) return [];
    return asEntries(value, sortKeys, maxItems);
  }, [leaf, value, sortKeys, maxItems]);

  const previewText =
    circularInfo ?? (leaf ? `= ${preview(value)}` : `: ${preview(value)}`);

  if (leaf) {
    return (
      <div className="pl-6">
        <Row
          expanded={false}
          onToggle={() => {}}
          depth={depth}
          badge={type}
          label={<span className="text-foreground">{labelNode}</span>}
          previewText={previewText}
          compact={compact}
          isLeaf
        />
      </div>
    );
  }

  return (
    <div className="pl-6">
      <Row
        expanded={open}
        onToggle={() => setOpen((v) => !v)}
        depth={depth}
        badge={type}
        label={<span className="text-foreground">{labelNode}</span>}
        previewText={previewText}
        compact={compact}
        isLeaf={false}
      />

      {open && (
        <div className="ml-4 border-l pl-4">
          {entries.length === maxItems && (
            <div className="mb-1 text-xs text-muted-foreground">
              Showing first {maxItems} items…
            </div>
          )}
          {entries.map(([k, v], i) => (
            <Node
              key={`${k}-${i}`}
              label={k}
              value={v}
              path={[...path, String(k)]}
              depth={depth + 1}
              defaultExpandDepth={defaultExpandDepth}
              visited={visited}
              sortKeys={sortKeys}
              maxItems={maxItems}
              filter={filter}
              compact={compact}
            />
          ))}
        </div>
      )}

      {/* Row actions */}
      <div className="ml-10 mt-1 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => {
            navigator.clipboard?.writeText(pathStr);
          }}
          title="Copy path"
        >
          <Copy className="mr-1 h-3.5 w-3.5" />
          Path
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => safeCopy(value)}
          title="Copy value as JSON"
        >
          <Copy className="mr-1 h-3.5 w-3.5" />
          Value
        </Button>
      </div>
    </div>
  );
};

const TypePill: React.FC<{ type: string }> = ({ type }) => {
  return (
    <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] uppercase">
      {type}
    </Badge>
  );
};

export default function ObjectInspector({
  data,
  name = "data",
  defaultExpandDepth = 1,
  maxItemsPerLevel = 250,
  sortKeys = true,
  compact = false,
}: ObjectInspectorProps) {
  const [query, setQuery] = useState("");
  const rootType = getType(data);

  // A single WeakMap for the whole render tree; resets when `data` identity changes
  const seen = useMemo(() => new WeakMap<object, string>(), [data]);

  return (
    <div className="w-full rounded-xl border bg-card p-3 text-card-foreground shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          <TypePill type={rootType} />
          <span className="text-sm text-muted-foreground">— {preview(data)}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keys & previews…"
              className="pl-8"
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          </div>
          <Button variant="outline" size="sm" onClick={() => safeCopy(data)}>
            <Copy className="mr-1 h-4 w-4" /> Copy JSON
          </Button>
        </div>
      </div>

      {/* Tree */}
      <div className="max-h-[70vh] overflow-auto rounded-lg bg-background px-2 py-1">
        <Node
          label={name}
          value={data}
          path={[name]}
          depth={0}
          defaultExpandDepth={defaultExpandDepth}
          visited={seen}
          sortKeys={sortKeys}
          maxItems={maxItemsPerLevel}
          filter={query}
          compact={compact}
        />
      </div>
    </div>
  );
}

/**
 * Example usage:
 *
 * import ObjectInspector from "@/components/ObjectInspector";
 *
 * export default function Page() {
 *   const payload: any = {
 *     id: 42n,
 *     name: "Gatekeepr",
 *     createdAt: new Date(),
 *     features: ["tickets", "sponsorships", { nested: true }],
 *     config: new Map([["theme", "light"], ["accent", "#7DFF6A"]]),
 *     flags: new Set(["beta", "early"]),
 *     meta: {},
 *   };
 *   payload.meta.self = payload; // circular reference demo
 *
 *   return (
 *     <div className="p-6">
 *       <ObjectInspector data={payload} name="payload" defaultExpandDepth={2} />
 *     </div>
 *   );
 * }
 */

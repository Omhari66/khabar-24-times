import React from "react";
import Image from "next/image";
import { AdBanner } from "./AdBanner";

type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
};

export function extractPlainText(content: unknown, maxLength = 200): string {
  const parts: string[] = [];

  function walk(node: Record<string, unknown>) {
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child && typeof child === "object") walk(child as Record<string, unknown>);
      }
    }
  }

  if (content && typeof content === "object" && !Array.isArray(content)) {
    walk(content as Record<string, unknown>);
  }

  const full = parts.join(" ").replace(/\s+/g, " ").trim();
  return full.length > maxLength ? `${full.slice(0, maxLength).trimEnd()}...` : full;
}

function applyMarks(
  text: string,
  marks: TiptapMark[],
  keyPrefix: string
): React.ReactNode {
  if (!marks.length) return text;

  let node: React.ReactNode = text;

  for (let index = marks.length - 1; index >= 0; index--) {
    const mark = marks[index];
    const key = `${keyPrefix}-m${index}`;

    switch (mark.type) {
      case "bold":
        node = <strong key={key} className="font-bold">{node}</strong>;
        break;
      case "italic":
        node = <em key={key} className="italic">{node}</em>;
        break;
      case "strike":
        node = <s key={key} className="line-through">{node}</s>;
        break;
      case "code":
        node = (
          <code
            key={key}
            className="rounded-lg bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-rose-700"
          >
            {node}
          </code>
        );
        break;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        node = (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-800 underline underline-offset-4 transition hover:text-emerald-950"
          >
            {node}
          </a>
        );
        break;
      }
      case "underline":
        node = <u key={key} className="underline underline-offset-2">{node}</u>;
        break;
      case "superscript":
        node = <sup key={key} className="font-medium">{node}</sup>;
        break;
      case "subscript":
        node = <sub key={key} className="font-medium">{node}</sub>;
        break;
      case "highlight": {
        const color = typeof mark.attrs?.color === "string" ? mark.attrs.color : "#fef08a";
        node = <mark key={key} style={{ backgroundColor: color }} className="rounded-sm px-1 py-0.5">{node}</mark>;
        break;
      }
      case "textStyle": {
        const color = typeof mark.attrs?.color === "string" ? mark.attrs.color : undefined;
        if (color) {
          node = <span key={key} style={{ color }}>{node}</span>;
        }
        break;
      }
      default:
        break;
    }
  }

  return node;
}

function renderNode(
  node: TiptapNode,
  index: number,
  keyPrefix = "n"
): React.ReactNode {
  const key = `${keyPrefix}-${index}`;

  switch (node.type) {
    case "doc":
      return node.content?.map((child, childIndex) => renderNode(child, childIndex, key));

    case "paragraph": {
      const children = node.content?.map((child, childIndex) => renderNode(child, childIndex, key)) ?? [];
      const align = (node.attrs?.textAlign as React.CSSProperties["textAlign"]) || "left";
      const hasBlockChild = node.content?.some(c => c.type === "image" || c.type === "youtube");
      
      if (hasBlockChild) {
        return (
          <div key={key} className="my-6 text-[1.05rem] leading-8 text-slate-700" style={{ textAlign: align }}>
            {children.length > 0 ? children : <>&nbsp;</>}
          </div>
        );
      }
      return (
        <p key={key} className="my-6 text-[1.05rem] leading-8 text-slate-700" style={{ textAlign: align }}>
          {children.length > 0 ? children : <>&nbsp;</>}
        </p>
      );
    }

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const align = (node.attrs?.textAlign as React.CSSProperties["textAlign"]) || "left";
      const children = node.content?.map((child, childIndex) => renderNode(child, childIndex, key));
      const classes: Record<number, string> = {
        1: "mt-12 text-3xl font-black leading-tight text-slate-950",
        2: "mt-10 text-2xl font-black leading-tight text-slate-950",
        3: "mt-8 text-xl font-bold leading-tight text-slate-900",
      };
      const className = classes[level] ?? "mt-8 text-lg font-bold text-slate-900";

      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      return React.createElement(Tag, { key, className, style: { textAlign: align } }, children);
    }

    case "bulletList":
      return (
        <ul key={key} className="my-6 ml-6 list-disc space-y-2 text-slate-700">
          {node.content?.map((child, childIndex) => renderNode(child, childIndex, key))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="my-6 ml-6 list-decimal space-y-2 text-slate-700">
          {node.content?.map((child, childIndex) => renderNode(child, childIndex, key))}
        </ol>
      );

    case "listItem":
      return <li key={key}>{node.content?.map((child, childIndex) => renderNode(child, childIndex, key))}</li>;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="my-8 border-l-4 border-amber-500 pl-5 text-xl font-medium italic leading-9 text-slate-700"
        >
          {node.content?.map((child, childIndex) => renderNode(child, childIndex, key))}
        </blockquote>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          className="my-8 overflow-x-auto rounded-[24px] bg-slate-950 p-5 text-sm leading-7 text-slate-100"
        >
          <code>{node.content?.map((child, childIndex) => renderNode(child, childIndex, key))}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={key} className="my-10 border-slate-200" />;

    case "hardBreak":
      return <br key={key} />;

    case "image": {
      const src = node.attrs?.src as string;
      const alt = (node.attrs?.alt as string) || "";
      if (!src) return null;
      return (
        <figure key={key} className="my-8">
          <Image 
            src={src} 
            alt={alt} 
            width={0} 
            height={0} 
            sizes="100vw" 
            style={{ width: '100%', height: 'auto' }} 
            className="rounded-[24px] border border-slate-200" 
          />
        </figure>
      );
    }

    case "youtube": {
      const src = node.attrs?.src as string;
      if (!src) return null;
      return (
        <div key={key} className="my-8 aspect-video w-full overflow-hidden rounded-[24px] border border-slate-200">
          <iframe
            src={src}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      );
    }

    case "text":
      return node.marks?.length
        ? applyMarks(node.text ?? "", node.marks, key)
        : node.text ?? "";

    default:
      return null;
  }
}

export default function TiptapRenderer({ content }: { content: unknown }) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }

  const documentNode = content as TiptapNode;

  const renderedNodes: React.ReactNode[] = [];
  let pCount = 0;

  documentNode.content?.forEach((node, index) => {
    renderedNodes.push(renderNode(node, index, "root"));
    if (node.type === "paragraph") {
      pCount++;
      if (pCount > 0 && pCount % 4 === 0) {
        renderedNodes.push(<AdBanner key={`ad-${index}`} slotName="article-inline" />);
      }
    }
  });

  return (
    <div className="tiptap-body max-w-none">
      {renderedNodes}
    </div>
  );
}

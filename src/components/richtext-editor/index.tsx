import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "./menu-bar";

interface RichTextEditorProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  editable,
}: RichTextEditorProps) {
  const isEditable = editable ?? true;

  const editor = useEditor({
    editable: isEditable,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: isEditable ? "min-h-[156px] border rounded-md py-2 px-3" : "",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  // ✅ Sync external content -> editor
  useEffect(() => {
    if (editor && !isEditable) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor, isEditable]);

  return (
    <div>
      {isEditable && editor && <MenuBar editor={editor} />}
      <EditorContent className="line-clamp-1" editor={editor} />
    </div>
  );
}

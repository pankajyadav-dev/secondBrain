"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import cpp from 'highlight.js/lib/languages/cpp'
import java from 'highlight.js/lib/languages/java'
import { useEffect, useState } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Code,
    Braces,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Minus,
    Undo2,
    Redo2
} from 'lucide-react';

import { cn } from '../../../packages/ui/utils/cn';

const lowlight = createLowlight(common);

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('cpp', cpp);
lowlight.register('java', java);

interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
}

export function TipTapEditor({ content, onChange, editable = true }: EditorProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [lastContent, setLastContent] = useState(content);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                codeBlock: false,
            }),

            CodeBlockLowlight.configure({
                lowlight,
            }),

            Placeholder.configure({
                placeholder: 'Start writing your thoughts...',
                emptyEditorClass: 'is-editor-empty',
            }),

            Underline,
        ],

        content,
        editable,

        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },

        editorProps: {
            attributes: {
                class:
                    'prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-6',
            },
        },
    }, []);

    useEffect(() => {
        if (editor && content !== lastContent && editor.getHTML() !== content) {
            editor.commands.setContent(content);
            setLastContent(content);
        }
    }, [content, editor, lastContent]);

    if (!isMounted || !editor) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-white/10 p-3 glass-card sticky top-0 z-10 backdrop-blur-lg">

                {/* Text */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        icon={<Bold size={22} />}
                    />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        icon={<Italic size={22} />}
                    />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive('underline')}
                        icon={<UnderlineIcon size={22} />}
                    />

                    {/* Inline code */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        active={editor.isActive('code')}
                        icon={<Code size={22} />}
                    />

                    {/* 🔥 Code Block */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        active={editor.isActive('codeBlock')}
                        icon={<Braces size={22} />}
                    />
                </div>

                <Divider />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    icon={<Heading1 size={22} />}
                />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    icon={<Heading2 size={22} />}
                />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    icon={<Heading3 size={22} />}
                />

                <Divider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    icon={<List size={22} />}
                />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    icon={<ListOrdered size={22} />}
                />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    icon={<Quote size={22} />}
                />

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    active={false}
                    icon={<Minus size={22} />}
                />

                <div className="flex-1" />

                {/* History */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    active={false}
                    disabled={!editor.can().undo()}
                    icon={<Undo2 size={22} />}
                />

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    active={false}
                    disabled={!editor.can().redo()}
                    icon={<Redo2 size={22} />}
                />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-300 via-gray-300 to-gray-300">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

function Divider() {
    return <div className="w-px h-6 bg-white/20 mx-1" />;
}

interface ToolbarButtonProps {
    onClick: () => void;
    active: boolean;
    icon: React.ReactNode;
    disabled?: boolean;
}

function ToolbarButton({ onClick, active, icon, disabled = false }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-2 rounded-lg transition-smooth",
                active
                    ? "glass-card text-primary"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                disabled && "opacity-40 cursor-not-allowed"
            )}
        >
            {icon}
        </button>
    );
}

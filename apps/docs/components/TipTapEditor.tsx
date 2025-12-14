"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Minus,
    Undo2,
    Redo2
} from 'lucide-react';
import { Tooltip } from '@repo/ui/Tooltip';
import { cn } from '../../../packages/ui/utils/cn';


interface EditorProps {
    content: string;
    onChange: (html: string) => void;
    editable?: boolean;
}

export function TipTapEditor({ content, onChange, editable = true }: EditorProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [lastContent, setLastContent] = useState(content);

    // Prevent hydration mismatch by only rendering on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your thoughts...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Underline,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] p-6',
            },
        },
    }, []);

    useEffect(() => {
        if (editor && content !== lastContent) {
            if (editor.getHTML() !== content) {
                editor.commands.setContent(content);
                setLastContent(content);
            }
        }
    }, [content, editor, lastContent]);

    // Don't render during SSR
    if (!isMounted || !editor) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Enhanced Toolbar */}
            <div className="flex items-center gap-1 border-b border-white/10 p-3 glass-card sticky top-0 z-10 backdrop-blur-lg">
                {/* Text Formatting */}
                <div className="flex items-center gap-1">
                    <Tooltip content="Bold (Ctrl+B)">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            active={editor.isActive('bold')}
                            icon={<Bold size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Italic (Ctrl+I)">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            active={editor.isActive('italic')}
                            icon={<Italic size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Underline (Ctrl+U)">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            active={editor.isActive('underline')}
                            icon={<UnderlineIcon size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Inline Code">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            active={editor.isActive('code')}
                            icon={<Code size={16} />}
                        />
                    </Tooltip>
                </div>

                <div className="w-px h-6 bg-white/20 mx-1" />

                {/* Headings */}
                <div className="flex items-center gap-1">
                    <Tooltip content="Heading 1">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            active={editor.isActive('heading', { level: 1 })}
                            icon={<Heading1 size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Heading 2">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            active={editor.isActive('heading', { level: 2 })}
                            icon={<Heading2 size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Heading 3">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            active={editor.isActive('heading', { level: 3 })}
                            icon={<Heading3 size={16} />}
                        />
                    </Tooltip>
                </div>

                <div className="w-px h-6 bg-white/20 mx-1" />

                {/* Lists & More */}
                <div className="flex items-center gap-1">
                    <Tooltip content="Bullet List">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            active={editor.isActive('bulletList')}
                            icon={<List size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Numbered List">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            active={editor.isActive('orderedList')}
                            icon={<ListOrdered size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Blockquote">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            active={editor.isActive('blockquote')}
                            icon={<Quote size={16} />}
                        />
                    </Tooltip>
                </div>

                <div className="w-px h-6 bg-white/20 mx-1" />

                {/* Divider & History */}
                <div className="flex items-center gap-1">
                    <Tooltip content="Horizontal Rule">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                            active={false}
                            icon={<Minus size={16} />}
                        />
                    </Tooltip>
                </div>

                <div className="flex-1" />

                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                    <Tooltip content="Undo (Ctrl+Z)">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().undo().run()}
                            active={false}
                            disabled={!editor.can().undo()}
                            icon={<Undo2 size={16} />}
                        />
                    </Tooltip>
                    <Tooltip content="Redo (Ctrl+Shift+Z)">
                        <ToolbarButton
                            onClick={() => editor.chain().focus().redo().run()}
                            active={false}
                            disabled={!editor.can().redo()}
                            icon={<Redo2 size={16} />}
                        />
                    </Tooltip>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-background/95">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
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

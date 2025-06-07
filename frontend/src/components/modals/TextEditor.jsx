// TextEditor.js
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useRef, useState, useEffect } from 'react';
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaImage,
  FaHeading,
} from 'react-icons/fa';
import './textEditor.scss';

const TextEditor = ({ onContentChange, content }) => {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Zacznij pisać...',
      }),
    ],
    content: content, // Initialize with content prop
    onUpdate: ({ editor }) => {
      if (onContentChange && typeof onContentChange === 'function') {
        onContentChange(editor.getHTML()); // Call onContentChange with HTML
      }
    },
  });

  const fileInputRef = useRef(null);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Formatting functions
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleHeading = useCallback((level) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  // Text alignment
  const setTextAlign = useCallback((align) => {
    editor?.chain().focus().setTextAlign(align).run();
  }, [editor]);

  // Text color
  const setTextColor = useCallback(
    (color) => {
      editor?.chain().focus().setColor(color).run();
      setSelectedColor(color);
    },
    [editor],
  );

  // Image insertion
  const addImage = useCallback(() => {
    const url = window.prompt('Wprowadź URL obrazka:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor?.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div className="toolbar">
        <button
          onClick={() => toggleHeading(1)}
          className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
          title="Nagłówek 1"
        >
          <FaHeading />
        </button>
        <button
          onClick={() => toggleHeading(2)}
          className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
          title="Nagłówek 2"
        >
          <FaHeading size={14} />
        </button>
        <button
          onClick={toggleBold}
          className={editor.isActive('bold') ? 'active' : ''}
          title="Pogrubienie"
        >
          <FaBold />
        </button>
        <button
          onClick={toggleItalic}
          className={editor.isActive('italic') ? 'active' : ''}
          title="Kursywa"
        >
          <FaItalic />
        </button>
        <button
          onClick={toggleBulletList}
          className={editor.isActive('bulletList') ? 'active' : ''}
          title="Lista punktowana"
        >
          <FaListUl />
        </button>
        <button
          onClick={toggleOrderedList}
          className={editor.isActive('orderedList') ? 'active' : ''}
          title="Lista numerowana"
        >
          <FaListOl />
        </button>
        <button
          onClick={() => setTextAlign('left')}
          className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
          title="Wyrównaj do lewej"
        >
          <FaAlignLeft />
        </button>
        <button
          onClick={() => setTextAlign('center')}
          className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
          title="Wyrównaj do środka"
        >
          <FaAlignCenter />
        </button>
        <button
          onClick={() => setTextAlign('right')}
          className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
          title="Wyrównaj do prawej"
        >
          <FaAlignRight />
        </button>
        <button
          onClick={() => setTextAlign('justify')}
          className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}
          title="Wyjustuj"
        >
          <FaAlignJustify />
        </button>
        <div className="color-picker">
          <input
            type="color"
            onChange={(e) => setTextColor(e.target.value)}
            value={selectedColor}
            title="Wybierz kolor tekstu"
          />
          <span
            className="color-preview"
            style={{ color: selectedColor }}
            title="Aktualny kolor"
          >
            A
          </span>
        </div>
        <button onClick={addImage} title="Wstaw obrazek z URL">
          <FaImage />
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Wstaw obrazek z pliku"
        >
          <FaImage />
        </button>
      </div>
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
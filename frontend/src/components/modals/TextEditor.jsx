import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
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
import Compressor from 'compressorjs';
import './textEditor.scss';

const BASE_URL = import.meta.env.VITE_API_URL;

const TextEditor = ({ onContentChange, content }) => {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [uploadProgress, setUploadProgress] = useState(null); 
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
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: 'Zacznij pisać...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      if (onContentChange && typeof onContentChange === 'function') {
        onContentChange(editor.getHTML());
      }
    },
    editorProps: {
      handlePaste: (view, event) => {
        handlePaste(event);
        return true;
      },
    },
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const uploadImage = useCallback(
    async (file) => {
      if (!file) return null;

      if (!file.type.startsWith('image/')) {
        alert('Proszę wybrać plik graficzny (np. PNG, JPEG).');
        return null;
      }

      return new Promise((resolve) => {
        new Compressor(file, {
          quality: 0.4, 
          maxWidth: 1000, 
          maxHeight: 1000, 
          success(compressedFile) {
            if (compressedFile.size > 5 * 1024 * 1024) { 
              alert('Plik po kompresji jest za duży. Maksymalny rozmiar to 5 MB.');
              resolve(null);
              return;
            }

            const formData = new FormData();
            formData.append('file', compressedFile);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${BASE_URL}/img/add/general`, true);
            xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(percent);
              }
            };

            xhr.onload = () => {
              setUploadProgress(null); 
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText);
                  const relativeUrl = data.url;
                  const imageUrl = `${BASE_URL}${relativeUrl}`;
                  resolve(imageUrl);
                } catch (error) {
                  console.error('Error parsing response:', error);
                  alert('Błąd podczas przetwarzania odpowiedzi serwera.');
                  resolve(null);
                }
              } else {
                let errorMessage = 'Nie udało się przesłać obrazka.';
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  errorMessage = errorData.message || `Błąd serwera: ${xhr.status}`;
                  if (xhr.status === 413) {
                    errorMessage = 'Plik jest za duży dla serwera (limit: 5 MB).';
                  }
                } catch (error) {
                  console.error('Error parsing error response:', error);
                }
                alert(errorMessage);
                resolve(null);
              }
            };

            xhr.onerror = () => {
              setUploadProgress(null);
              alert('Błąd sieci podczas przesyłania obrazka.');
              resolve(null);
            };

            xhr.send(formData);
          },
          error(err) {
            console.error('Error compressing image:', err);
            alert('Błąd podczas kompresji obrazu.');
            resolve(null);
          },
        });
      });
    },
    [],
  );

  const handlePaste = useCallback(
    async (event) => {
      event.preventDefault();
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const imageUrl = await uploadImage(file);
            if (imageUrl && editor) {
              editor.chain().focus().setImage({ src: imageUrl }).run();
            }
            return; 
          }
        }
      }

      const text = event.clipboardData.getData('text/plain');
      if (text && editor) {
        editor.chain().focus().insertContent(text).run();
      }
    },
    [editor, uploadImage],
  );

  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      const imageUrl = await uploadImage(file);
      if (imageUrl && editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    },
    [editor, uploadImage],
  );

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

  const setTextAlign = useCallback((align) => {
    editor?.chain().focus().setTextAlign(align).run();
  }, [editor]);

  const setTextColor = useCallback(
    (color) => {
      editor?.chain().focus().setColor(color).run();
      setSelectedColor(color);
    },
    [editor],
  );

  const addImage = useCallback(() => {
    const url = window.prompt('Wprowadź URL obrazka:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
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
          disabled={uploadProgress !== null}
        >
          <FaImage />
        </button>
        {uploadProgress !== null && (
          <div className="progress-bar">
            Przesyłanie: {uploadProgress}%
          </div>
        )}
      </div>
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TextEditor;
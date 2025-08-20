import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';

// Устанавливаем worker для PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFUploader = ({ onKnowledgeBaseUpdate }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        onKnowledgeBaseUpdate(fullText.trim());
      } catch (error) {
        console.error('Ошибка при обработке PDF:', error);
        alert('Ошибка при обработке PDF файла');
      }
    }
  }, [onKnowledgeBaseUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  return (
    <div className="pdf-uploader">
      <h3>Загрузите PDF файл для базы знаний</h3>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Отпустите файл здесь...</p>
        ) : (
          <p>Перетащите PDF файл сюда или кликните для выбора</p>
        )}
      </div>
    </div>
  );
};

export default PDFUploader;

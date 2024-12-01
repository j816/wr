import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

interface MarkdownRendererProps {
  content: string;
}

const Container = styled.div`
  color: var(--text-primary);
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  p {
    margin-bottom: 1em;
  }

  code {
    background: var(--bg-code);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  pre {
    background: var(--bg-code);
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
  }

  ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
  }

  blockquote {
    border-left: 4px solid var(--border-color);
    padding-left: 1em;
    margin: 1em 0;
    color: var(--text-secondary);
  }
`;

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <Container>
      <ReactMarkdown>{content}</ReactMarkdown>
    </Container>
  );
}; 
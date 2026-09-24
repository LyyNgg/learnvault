import ReactMarkdown from 'react-markdown'

// react-markdown escapes raw HTML and strips unsafe URLs by default.
const components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
}

export default function Markdown({ children }) {
  return <div className="md"><ReactMarkdown components={components}>{children}</ReactMarkdown></div>
}

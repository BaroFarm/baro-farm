// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Render Error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: '#b91c1c' }}>
          <h3>컴포넌트 렌더링 중 오류가 발생했습니다.</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

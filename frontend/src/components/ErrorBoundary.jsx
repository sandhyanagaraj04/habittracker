import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-full p-10">
          <div className="card max-w-lg w-full space-y-3">
            <p className="text-lg font-semibold text-rose-400">Something went wrong</p>
            <pre className="text-xs text-slate-400 bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
            <button className="btn-primary" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

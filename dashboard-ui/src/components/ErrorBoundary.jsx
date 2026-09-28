var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Component } from "react";
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    __publicField(this, "handleReset", () => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    });
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4"><div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-6 text-center"><div className="text-red-500 mb-4"><svg
        className="mx-auto h-16 w-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      ><path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      /></svg></div><h1 className="text-xl font-bold text-white mb-2">
              Something went wrong
            </h1><p className="text-gray-400 mb-4">
              An unexpected error occurred. Our team has been notified.
            </p>{import.meta.env.DEV && this.state.error && <details className="text-left bg-gray-900 rounded p-3 mb-4 text-sm"><summary className="text-red-400 cursor-pointer mb-2">
                  Error Details
                </summary><pre className="text-gray-300 overflow-auto max-h-48">{this.state.error.toString()}{this.state.errorInfo?.componentStack}</pre></details>}<div className="flex gap-3 justify-center"><button
        onClick={this.handleReset}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
                Try Again
              </button><button
        onClick={() => window.location.href = "/"}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
      >
                Go Home
              </button></div></div></div>;
    }
    return this.props.children;
  }
}
var stdin_default = ErrorBoundary;
export {
  stdin_default as default
};

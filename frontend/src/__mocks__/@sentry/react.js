const React = require('react');

const SentryMock = {
  init: jest.fn(),
  captureException: jest.fn(() => 'mock-event-id'),
  captureMessage: jest.fn(),
  captureUserFeedback: jest.fn(),
  withErrorBoundary: (Component) => Component,
  ErrorBoundary: ({ children, fallback }) => {
    const [hasError, setHasError] = React.useState(false);
    if (hasError) return fallback || null;
    return React.createElement(React.Fragment, null, children);
  },
  showReportDialog: jest.fn(),
  configureScope: jest.fn(),
};

module.exports = SentryMock;

import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

test('renders FlowCare app header', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  const headerElement = screen.getByText(/FlowCare/i);
  expect(headerElement).toBeInTheDocument();
});

test('navigates to Tracker page', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  const trackerLink = screen.getByText(/Tracker/i);
  fireEvent.click(trackerLink);
  const trackerPage = screen.getByText(/Track Your Cycle/i); // Assuming "Track Your Cycle" is in the Tracker page
  expect(trackerPage).toBeInTheDocument();
});

test('navigates to Chatbot page', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  const chatbotLink = screen.getByText(/Chatbot/i);
  fireEvent.click(chatbotLink);
  const chatbotPage = screen.getByText(/Chatbot/i); // Assuming "Chatbot" is in the Chatbot page
  expect(chatbotPage).toBeInTheDocument();
});

test('renders Footer component', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  const footerElement = screen.getByText(/Footer Content/i); // Modify this text based on your Footer content
  expect(footerElement).toBeInTheDocument();
});

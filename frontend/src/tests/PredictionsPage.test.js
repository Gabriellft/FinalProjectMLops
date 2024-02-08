import { render, screen } from '@testing-library/react';
import PredictionsPage from './pages/PredictionsPage';

test('renders PredictionsPage', () => {
  render(<PredictionsPage />);
  const linkElement = screen.getByText(/Predictions/i); // Assurez-vous que le texte "Predictions" est présent dans le composant
  expect(linkElement).toBeInTheDocument();
});

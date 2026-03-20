import { useState } from 'react';
import Home from './pages/Home';
import ItemDetail from './pages/ItemDetail';
import Leaderboard from './pages/Leaderboard';
import RestaurantPage from './pages/RestaurantPage';
import UploadPhoto from './pages/UploadPhoto';
import Legal from './pages/Legal';
import Header from './components/Header';
import Footer from './components/Footer';
import WelcomeScreen from './components/WelcomeScreen';

export type Page = 'home' | 'item' | 'leaderboard' | 'restaurant' | 'upload' | 'legal';

interface AppState {
  page: Page;
  itemId?: string;
  restaurantSlug?: string;
  legalTab?: 'privacy' | 'terms';
}

function App() {
  const [appState, setAppState] = useState<AppState>({ page: 'home' });

  const navigate = (page: Page, params?: { itemId?: string; restaurantSlug?: string; legalTab?: 'privacy' | 'terms' }) => {
    setAppState({ page, ...params });
  };

  const navigateToLegal = (tab: 'privacy' | 'terms') => {
    navigate('legal', { legalTab: tab });
  };

  const renderPage = () => {
    switch (appState.page) {
      case 'item':
        return <ItemDetail itemId={appState.itemId!} onBack={() => navigate('home')} />;
      case 'leaderboard':
        return <Leaderboard onBack={() => navigate('home')} onItemClick={(id) => navigate('item', { itemId: id })} />;
      case 'restaurant':
        return <RestaurantPage slug={appState.restaurantSlug!} onBack={() => navigate('home')} onItemClick={(id) => navigate('item', { itemId: id })} />;
      case 'upload':
        return <UploadPhoto onBack={() => navigate('home')} />;
      case 'legal':
        return <Legal onBack={() => navigate('home')} initialTab={appState.legalTab} />;
      case 'home':
      default:
        return (
          <Home
            onItemClick={(id) => navigate('item', { itemId: id })}
            onRestaurantClick={(slug) => navigate('restaurant', { restaurantSlug: slug })}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-white flex flex-col">
      <WelcomeScreen />
      <Header
        currentPage={appState.page}
        onNavigate={navigate}
      />
      <div className="flex-1">
        {renderPage()}
      </div>
      <Footer onNavigate={navigateToLegal} />
    </div>
  );
}

export default App;
